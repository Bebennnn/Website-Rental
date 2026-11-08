const pool = require('../config/db');

class VehicleRepository {
  mapRowToVehicle(row) {
    if (!row) return null;
    return {
      id: row.id,
      brand: row.brand,
      name: row.name,
      year: Number(row.year),
      branchId: row.branch_id,
      category: row.category,
      transmission: row.transmission,
      fuel: row.fuel,
      seats: Number(row.seats),
      luggage: Number(row.luggage),
      plateNumber: row.plate_number,
      imageUrl: row.image_url,
      status: row.status,
      currentKm: row.current_km === null ? null : Number(row.current_km),
      nextServiceKm: row.next_service_km === null ? null : Number(row.next_service_km),
      nextServiceDate: row.next_service_date
        ? new Date(row.next_service_date).toISOString().slice(0, 10)
        : null,
      rates: {
        PKG_6H: Number(row.rate_6h),
        PKG_12H: Number(row.rate_12h),
        PKG_24H: Number(row.rate_24h),
      },
    };
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
    return rows.map((r) => this.mapRowToVehicle(r));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    return this.mapRowToVehicle(rows[0]);
  }

  async create(vehicle) {
    const sql = `
      INSERT INTO vehicles (
        id, brand, name, year, branch_id, category, transmission, fuel,
        seats, luggage, plate_number, rate_6h, rate_12h, rate_24h, status, image_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *;
    `;
    const params = [
      vehicle.id,
      vehicle.brand,
      vehicle.name,
      Number(vehicle.year),
      vehicle.branchId,
      vehicle.category,
      vehicle.transmission,
      vehicle.fuel,
      Number(vehicle.seats),
      Number(vehicle.luggage || 3),
      vehicle.plateNumber,
      Number(vehicle.rates.PKG_6H),
      Number(vehicle.rates.PKG_12H),
      Number(vehicle.rates.PKG_24H),
      vehicle.status || 'AVAILABLE',
      vehicle.imageUrl,
    ];
    const { rows } = await pool.query(sql, params);
    return this.mapRowToVehicle(rows[0]);
  }

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return this.mapRowToVehicle(rows[0]);
  }

  async updateImage(id, imageUrl) {
    const { rows } = await pool.query(
      'UPDATE vehicles SET image_url = $1 WHERE id = $2 RETURNING *',
      [imageUrl, id]
    );
    return this.mapRowToVehicle(rows[0]);
  }

  async updateServiceSchedule(id, schedule) {
    const { rows } = await pool.query(
      `UPDATE vehicles
       SET current_km = $1, next_service_km = $2, next_service_date = $3
       WHERE id = $4
       RETURNING *`,
      [schedule.currentKm, schedule.nextServiceKm, schedule.nextServiceDate, id]
    );
    return this.mapRowToVehicle(rows[0]);
  }
}

module.exports = new VehicleRepository();