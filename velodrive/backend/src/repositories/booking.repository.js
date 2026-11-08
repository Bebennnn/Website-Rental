const pool = require('../config/db');

class BookingRepository {
  mapRowToBooking(row) {
    if (!row) return null;
    return {
      id: row.id,
      code: row.booking_code,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerNik: row.customer_nik,
      customerSim: row.customer_sim,
      vehicleId: row.vehicle_id,
      vehicleName: row.vehicle_name,
      plateNumber: row.plate_number,
      branchId: row.branch_id,
      pickupHub: row.pickup_hub,
      purpose: row.purpose,
      packageId: row.package_id,
      multiplier: Number(row.multiplier),
      totalHours: Number(row.total_hours),
      serviceId: row.service_id,
      deliveryId: row.delivery_id,
      startDateTime: row.start_time,
      endDateTime: row.end_time,
      baseCost: Number(row.base_cost),
      driverCost: Number(row.driver_cost),
      deliveryCost: Number(row.delivery_cost),
      depositCost: Number(row.deposit_cost),
      discountCode: row.discount_code ?? null,
      discountAmount: Number(row.discount_amount ?? 0),
      grandTotal: Number(row.grand_total),
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    return rows.map((r) => this.mapRowToBooking(r));
  }

  async hasTimeOverlap(vehicleId, startTime, endTime) {
    const sql = `
      SELECT COUNT(*)::INT AS conflict_count
      FROM bookings
      WHERE vehicle_id = $1
        AND status IN ('CONFIRMED', 'ON_TRIP')
        AND (start_time < $3 AND end_time > $2);
    `;
    const { rows } = await pool.query(sql, [vehicleId, startTime, endTime]);
    return rows[0].conflict_count > 0;
  }

  
async createBookingWithTransaction(payload) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Kunci kendaraan selama transaksi berlangsung.
    // Request lain untuk kendaraan yang sama harus menunggu.
    const vehicleResult = await client.query(
      `SELECT id, status
       FROM vehicles
       WHERE id = $1
       FOR UPDATE`,
      [payload.vehicleId]
    );

    const vehicle = vehicleResult.rows[0];

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      throw new Error(
        'Unit armada sedang tidak tersedia untuk disewa.'
      );
    }

    // 2. Periksa konflik jadwal di dalam transaksi.
    // PENDING_VERIFICATION tidak memblokir jadwal.
    const conflictSql = `
      SELECT EXISTS (
        SELECT 1
        FROM bookings
        WHERE vehicle_id = $1
          AND status IN ('CONFIRMED', 'ON_TRIP')
          AND start_time < $3
          AND end_time > $2
      ) AS has_conflict;
    `;

    const conflictResult = await client.query(
      conflictSql,
      [
        payload.vehicleId,
        payload.startDateTime,
        payload.endDateTime,
      ]
    );

    if (conflictResult.rows[0].has_conflict) {
      throw new Error(
        'Jadwal unit bentrok dengan reservasi aktif lain pada jam tersebut.'
      );
    }

    // 3. Simpan booking.
    const insertSql = `
      INSERT INTO bookings (
        id, booking_code, user_id, customer_name, customer_email, customer_phone,
        customer_nik, customer_sim, vehicle_id, vehicle_name, plate_number, branch_id,
        pickup_hub, purpose, package_id, multiplier, total_hours, service_id, delivery_id,
        start_time, end_time, base_cost, driver_cost, delivery_cost, deposit_cost, grand_total, status,
        discount_code, discount_amount
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
      ) RETURNING *;
    `;

    const params = [
      payload.id,
      payload.code,
      payload.userId,
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.customerNik,
      payload.customerSim,
      payload.vehicleId,
      payload.vehicleName,
      payload.plateNumber,
      payload.branchId,
      payload.pickupHub,
      payload.purpose,
      payload.packageId,
      payload.multiplier,
      payload.totalHours,
      payload.serviceId,
      payload.deliveryId,
      payload.startDateTime,
      payload.endDateTime,
      payload.baseCost,
      payload.driverCost,
      payload.deliveryCost,
      payload.depositCost,
      payload.grandTotal,
      payload.status || 'PENDING_VERIFICATION',
      payload.discountCode || null,
      payload.discountAmount || 0,
    ];

    const { rows } = await client.query(insertSql, params);

    await client.query('COMMIT');

    return this.mapRowToBooking(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  async updateStatus(bookingCode, nextStatus) {
    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1 WHERE booking_code = $2 RETURNING *',
      [nextStatus, bookingCode]
    );
    return this.mapRowToBooking(rows[0]);
  }
}

module.exports = new BookingRepository();