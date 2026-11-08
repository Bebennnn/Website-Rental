
class CustomerService {

    // 1. VALIDASI DATA PENYEWA
    validasiDataPenyewa(user) {
      const errors = [];
  
      if (!user || !user.name || !user.name.trim()) {
        errors.push('Nama penyewa wajib diisi.');
      }
  
      if (!user || !user.email || !user.email.trim()) {
        errors.push('Email wajib diisi.');
      } else {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim());
  
        if (!emailValid) {
          errors.push('Format email tidak valid.');
        }
      }
  
      if (!user || !user.phone || !user.phone.trim()) {
        errors.push('Nomor telepon wajib diisi.');
      } else {
        const phone = user.phone.replace(/\D/g, '');
  
        if (phone.length < 10 || phone.length > 15) {
          errors.push('Nomor telepon harus 10-15 digit.');
        }
      }
  
      return {
        valid: errors.length === 0,
        errors
      };
    }
  
  
    // 2. CEK STATUS USER
    cekStatusUser(user) {
      if (!user) {
        return 'User tidak ditemukan.';
      }
  
      if (user.blocked === true || user.isBlocked === true || user.is_blocked === true) {
        return 'User diblokir.';
      }
  
      if (user.active === false || user.is_active === false) {
        return 'User tidak aktif.';
      }
  
      if (!user.verified) {
        return 'User belum terverifikasi.';
      }
  
      return 'User aktif.';
    }
  
  
    // 3. BERSIHKAN DATA USER
    bersihkanDataUser(user) {
      if (!user) {
        return null;
      }
  
      return {
        ...user,
        name: (user.name || '').trim().replace(/\s+/g, ' '),
        email: (user.email || '').trim().toLowerCase(),
        phone: (user.phone || '').replace(/\D/g, '')
      };
    }
  
  }
  
  module.exports = new CustomerService();
  