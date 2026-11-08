
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cekKetersediaanMobil,
  validasiBooking,
  cekBentrokJadwal,
} = require('../src/validators/booking.validator');

const dummyFleet = [
  { id: 'ID-01', name: 'Toyota Avanza', status: 'AVAILABLE' },
  { id: 'ID-02', name: 'Mitsubishi Xpander', status: 'RENTED' },
  { id: 'ID-03', name: 'Honda Brio', status: 'MAINTENANCE' },
];

test('Anggota 2 - Fungsi 1: Cek Ketersediaan Mobil', async (t) => {
  await t.test('TC 1.1: Mobil tersedia', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-01');
    assert.equal(hasil.isAvailable, true);
    assert.equal(hasil.status, 'AVAILABLE');
    assert.equal(hasil.message, 'Mobil tersedia');
  });

  await t.test('TC 1.2: Mobil sedang disewa', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-02');
    assert.equal(hasil.isAvailable, false);
    assert.equal(hasil.status, 'RENTED');
    assert.equal(hasil.message, 'Mobil sedang disewa');
  });

  await t.test('TC 1.3: Mobil sedang servis', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-03');
    assert.equal(hasil.isAvailable, false);
    assert.equal(hasil.status, 'MAINTENANCE');
    assert.equal(hasil.message, 'Mobil sedang servis');
  });

  await t.test('TC 1.4: ID tidak ditemukan', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-999');
    assert.equal(hasil.isAvailable, false);
    assert.equal(hasil.status, 'NOT_FOUND');
    assert.equal(hasil.message, 'ID mobil tidak ditemukan');
  });
});

test('Anggota 2 - Fungsi 2: Validasi Booking', async (t) => {
  await t.test('TC 2.1: Data lengkap', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    assert.equal(hasil.isValid, true);
    assert.equal(hasil.message, 'Data booking lengkap');
  });

  await t.test('TC 2.2: Nama kosong', () => {
    const input = {
      customerName: '',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    assert.equal(hasil.isValid, false);
    assert.equal(hasil.errorField, 'customerName');
    assert.equal(hasil.message, 'Nama tidak boleh kosong');
  });

  await t.test('TC 2.3: Mobil kosong', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: '',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    assert.equal(hasil.isValid, false);
    assert.equal(hasil.errorField, 'vehicleId');
    assert.equal(hasil.message, 'Mobil tidak boleh kosong');
  });

  await t.test('TC 2.4: Tanggal kosong', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: 'ID-01',
      startDateTime: '',
    };
    const hasil = validasiBooking(input);
    assert.equal(hasil.isValid, false);
    assert.equal(hasil.errorField, 'startDateTime');
    assert.equal(hasil.message, 'Tanggal tidak boleh kosong');
  });
});

test('Anggota 2 - Fungsi 3: Cek Bentrok Jadwal', async (t) => {
  const daftarBookingAktif = [
    {
      code: 'INV-849201',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-15T08:00',
      endDateTime: '2025-05-16T08:00',
      status: 'CONFIRMED',
    },
  ];

  await t.test('TC 3.1: Tidak bentrok (jadwal di hari berbeda)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-20T08:00',
      '2025-05-21T08:00',
      daftarBookingAktif,
      'ID-01'
    );
    assert.equal(hasil.isConflict, false);
    assert.equal(hasil.status, 'SAFE');
    assert.equal(hasil.message, 'Tidak bentrok');
  });

  await t.test('TC 3.2: Jadwal bertabrakan (jam sewa beririsan dengan booking lama)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-15T12:00',
      '2025-05-16T12:00',
      daftarBookingAktif,
      'ID-01'
    );
    assert.equal(hasil.isConflict, true);
    assert.equal(hasil.status, 'CONFLICT');
    assert.equal(hasil.message, 'Jadwal bertabrakan dengan booking yang sudah ada');
  });

  await t.test('TC 3.3: Booking setelah jadwal sebelumnya (mulai tepat saat sewa lama selesai)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-16T08:00',
      '2025-05-17T08:00',
      daftarBookingAktif,
      'ID-01'
    );
    assert.equal(hasil.isConflict, false);
    assert.equal(hasil.status, 'AFTER_PREVIOUS');
    assert.equal(hasil.message, 'Tidak bentrok (booking setelah jadwal sebelumnya)');
  });
});
