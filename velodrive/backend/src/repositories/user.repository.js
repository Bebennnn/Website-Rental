const pool = require('../config/db');

class UserRepository {
  mapRowToUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    nik: row.nik,
    simA: row.sim_a,
    address: row.address,
    verified: row.verified,
    role: row.role || 'USER',
    accountStatus: row.account_status || 'ACTIVE',
    joinedAt: row.joined_at,
  };
}

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY joined_at DESC');
    return rows.map((row) => this.mapRowToUser(row));
  }

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return this.mapRowToUser(rows[0]);
  }

  async findByEmailWithPassword(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (!rows[0]) return null;
    return { ...this.mapRowToUser(rows[0]), password: rows[0].password };
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return this.mapRowToUser(rows[0]);
  }

  async create(user) {
    const sql = `
      INSERT INTO users (id, name, email, password, phone, nik, sim_a, address, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const params = [
      user.id,
      user.name,
      user.email,
      user.password,
      user.phone,
      user.nik,
      user.simA,
      user.address,
      Boolean(user.verified),
    ];
    const { rows } = await pool.query(sql, params);
    return this.mapRowToUser(rows[0]);
  }

  async updateAccountStatus(id, accountStatus) {
    const { rows } = await pool.query(
      'UPDATE users SET account_status = $1 WHERE id = $2 RETURNING *',
      [accountStatus, id]
    );
    return this.mapRowToUser(rows[0]);
  }

  async updateVerification(id, verified) {
    const { rows } = await pool.query(
      'UPDATE users SET verified = $1 WHERE id = $2 RETURNING *',
      [Boolean(verified), id]
    );
    return this.mapRowToUser(rows[0]);
  }
}

module.exports = new UserRepository();