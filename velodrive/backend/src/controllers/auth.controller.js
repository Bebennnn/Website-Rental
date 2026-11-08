
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const customerService = require('../services/customer.service');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi.',
        });
      }

      const user = await userRepo.findByEmailWithPassword(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah.',
        });
      }

      if (user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Akun sedang diblokir.',
        });
      }

      const token = jwt.sign(
        {
          role: user.role || 'USER',
        },
        process.env.JWT_SECRET,
        {
          subject: user.id,
          expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        }
      );

      const { password: _password, ...safeUser } = user;

      return res.json({
        success: true,
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, phone, nik, simA, address } = req.body;

      // Validasi data penyewa
      const validation = customerService.validasiDataPenyewa({
        name,
        email,
        phone,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Validasi data gagal.',
          errors: validation.errors,
        });
      }

      // Membersihkan data penyewa
      const cleanUser = customerService.bersihkanDataUser({
        name,
        email,
        phone,
      });

      if (!password || !password.trim() || !nik || !simA || !address) {
        return res.status(400).json({
          success: false,
          message: 'Password, NIK, SIM A, dan alamat wajib diisi.',
        });
      }

      const existing = await userRepo.findByEmail(cleanUser.email);

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan halaman Masuk.',
        });
      }

      const newUser = await userRepo.create({
        name: cleanUser.name,
        email: cleanUser.email,
        password,
        phone: cleanUser.phone,
        nik,
        simA,
        address,
        verified: false,
      });

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil.',
        data: newUser,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
