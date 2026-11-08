const assert = require('node:assert/strict');

const customerService = require('./customer.service');


// ==========================================
// 1. TEST VALIDASI DATA PENYEWA
// ==========================================

test('Data penyewa lengkap dan valid', () => {
  const user = {
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    phone: '081234567890'
  };

  const result = customerService.validasiDataPenyewa(user);

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});


test('Email tidak valid', () => {
  const user = {
    name: 'Budi',
    email: 'budi-gmail.com',
    phone: '081234567890'
  };

  const result = customerService.validasiDataPenyewa(user);

  assert.equal(result.valid, false);
});


test('Nomor telepon kosong', () => {
  const user = {
    name: 'Budi',
    email: 'budi@gmail.com',
    phone: ''
  };

  const result = customerService.validasiDataPenyewa(user);

  assert.equal(result.valid, false);
});


// ==========================================
// 2. TEST CEK STATUS USER
// ==========================================

test('User aktif', () => {
  const user = {
    verified: true
  };

  const result = customerService.cekStatusUser(user);

  assert.equal(result, 'User aktif.');
});


test('User belum terverifikasi', () => {
  const user = {
    verified: false
  };

  const result = customerService.cekStatusUser(user);

  assert.equal(result, 'User belum terverifikasi.');
});


test('User diblokir', () => {
  const user = {
    verified: true,
    blocked: true
  };

  const result = customerService.cekStatusUser(user);

  assert.equal(result, 'User diblokir.');
});


test('User tidak ditemukan', () => {
  const result = customerService.cekStatusUser(null);

  assert.equal(result, 'User tidak ditemukan.');
});


// ==========================================
// 3. TEST BERSIHKAN DATA USER
// ==========================================

test('Membersihkan nama, email, dan nomor telepon', () => {
  const user = {
    name: '  Budi   Santoso  ',
    email: '  BUDI@GMAIL.COM ',
    phone: ' 0812-3456-7890 '
  };

  const result = customerService.bersihkanDataUser(user);

  assert.equal(result.name, 'Budi Santoso');
  assert.equal(result.email, 'budi@gmail.com');
  assert.equal(result.phone, '081234567890');
});


test('Data user kosong', () => {
  const result = customerService.bersihkanDataUser(null);

  assert.equal(result, null);
});
