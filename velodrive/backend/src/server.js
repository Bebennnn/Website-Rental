const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db'); // Untuk mengecek koneksi DB
const apiRoutes = require('./routes/api.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Pelacak Request & Error di Terminal
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 4000;

// Cek koneksi ke PostgreSQL saat server dinyalakan
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DATABASE ERROR: Gagal terhubung ke PostgreSQL!');
    console.error('Detail:', err.message);
    console.error('Pastikan password di .env benar dan database velodrive_db sudah dibuat.');
  } else {
    console.log('✅ PostgreSQL Terhubung dengan sukses!');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VeloDrive Backend API running on http://localhost:${PORT}`);
});