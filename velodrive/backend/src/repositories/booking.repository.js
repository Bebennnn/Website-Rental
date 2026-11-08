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
      grandTotal: Number(row.grand_total),
      paidAmount: Number(row.paid_amount || 0),
      remainingAmount: Math.max(0, Number(row.grand_total) - Number(row.paid_amount || 0)),
      paymentStatus: row.payment_status || 'UNPAID',
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

    // Kunci kendaraan selama transaksi berlangsung.
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

    // Periksa konflik jadwal.
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

    // Simpan booking beserta informasi pembayaran.
    const insertSql = `
      INSERT INTO bookings (
        id, booking_code, user_id, customer_name, customer_email,
        customer_phone, customer_nik, customer_sim, vehicle_id,
        vehicle_name, plate_number, branch_id, pickup_hub, purpose,
        package_id, multiplier, total_hours, service_id, delivery_id,
        start_time, end_time, base_cost, driver_cost, delivery_cost,
        deposit_cost, grand_total, status, paid_amount, payment_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
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
      0,
      'UNPAID',
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


  async findByCode(bookingCode) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE booking_code = $1', [bookingCode]);
    return this.mapRowToBooking(rows[0]);
  }

  async cancelByCustomer(bookingCode, userId) {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = 'CANCELLED'
       WHERE booking_code = $1 AND user_id = $2
         AND status IN ('PENDING_VERIFICATION', 'CONFIRMED')
       RETURNING *`, [bookingCode, userId]
    );
    return this.mapRowToBooking(rows[0]);
  }

async updatePayment(bookingCode, paidAmount) {
  const { rows } = await pool.query(
    `UPDATE bookings
     SET paid_amount = $1::numeric,
         payment_status = CASE
           WHEN $1::numeric = 0 THEN 'UNPAID'
           WHEN $1::numeric < grand_total THEN 'PARTIAL'
           ELSE 'PAID'
         END
     WHERE booking_code = $2
     RETURNING *`,
    [paidAmount, bookingCode]
  );

  return this.mapRowToBooking(rows[0]);
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