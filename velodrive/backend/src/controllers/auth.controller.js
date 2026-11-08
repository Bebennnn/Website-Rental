const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');

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
          message: 'Email atau password tidak sesuai.',
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

      if (!name || !email || !password || !phone || !nik || !simA || !address) {
        return res.status(400).json({
          success: false,
          message: 'Semua data wajib diisi.',
        });
      }

      const existing = await userRepo.findByEmail(email);

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar.',
        });
      }

      const newUser = await userRepo.create({
        id: `USR-${Date.now().toString().slice(-4)}`,
        name,
        email,
        password,
        phone,
        nik,
        simA,
        address,
        verified: false,
      });

      return res.status(201).json({
        success: true,
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