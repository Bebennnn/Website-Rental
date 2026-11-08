
const userRepo = require('../repositories/user.repository');
const customerService = require('../services/customer.service');

class AuthController {

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userRepo.findByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password tidak sesuai.'
        });
      }

      return res.json({
        success: true,
        data: user
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
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
        phone
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Validasi data gagal.',
          errors: validation.errors
        });
      }

      // Membersihkan data penyewa
      const cleanUser = customerService.bersihkanDataUser({
        name,
        email,
        phone
      });

      // Memeriksa password
      if (!password || !password.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Password wajib diisi.'
        });
      }

      // Memeriksa email yang sudah terdaftar
      const existing = await userRepo.findByEmail(cleanUser.email);

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan halaman Masuk.'
        });
      }

      // Membuat akun baru
      const newUser = await userRepo.create({
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: cleanUser.name,
        email: cleanUser.email,
        password,
        phone: cleanUser.phone,
        nik,
        simA,
        address,
        verified: false
      });

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil.',
        data: newUser
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = new AuthController();
