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

describe('Anggota 2 - Fungsi 1: Cek Ketersediaan Mobil', () => {
  test('TC 1.1: Mobil tersedia', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-01');
    expect(hasil.isAvailable).toBe(true);
    expect(hasil.status).toBe('AVAILABLE');
    expect(hasil.message).toBe('Mobil tersedia');
  });

  test('TC 1.2: Mobil sedang disewa', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-02');
    expect(hasil.isAvailable).toBe(false);
    expect(hasil.status).toBe('RENTED');
    expect(hasil.message).toBe('Mobil sedang disewa');
  });

  test('TC 1.3: Mobil sedang servis', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-03');
    expect(hasil.isAvailable).toBe(false);
    expect(hasil.status).toBe('MAINTENANCE');
    expect(hasil.message).toBe('Mobil sedang servis');
  });

  test('TC 1.4: ID tidak ditemukan', () => {
    const hasil = cekKetersediaanMobil(dummyFleet, 'ID-999');
    expect(hasil.isAvailable).toBe(false);
    expect(hasil.status).toBe('NOT_FOUND');
    expect(hasil.message).toBe('ID mobil tidak ditemukan');
  });
});

describe('Anggota 2 - Fungsi 2: Validasi Booking', () => {
  test('TC 2.1: Data lengkap', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    expect(hasil.isValid).toBe(true);
    expect(hasil.message).toBe('Data booking lengkap');
  });

  test('TC 2.2: Nama kosong', () => {
    const input = {
      customerName: '',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    expect(hasil.isValid).toBe(false);
    expect(hasil.errorField).toBe('customerName');
    expect(hasil.message).toBe('Nama tidak boleh kosong');
  });

  test('TC 2.3: Mobil kosong', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: '',
      startDateTime: '2025-05-20T09:00',
    };
    const hasil = validasiBooking(input);
    expect(hasil.isValid).toBe(false);
    expect(hasil.errorField).toBe('vehicleId');
    expect(hasil.message).toBe('Mobil tidak boleh kosong');
  });

  test('TC 2.4: Tanggal kosong', () => {
    const input = {
      customerName: 'Rizky Pratama',
      vehicleId: 'ID-01',
      startDateTime: '',
    };
    const hasil = validasiBooking(input);
    expect(hasil.isValid).toBe(false);
    expect(hasil.errorField).toBe('startDateTime');
    expect(hasil.message).toBe('Tanggal tidak boleh kosong');
  });
});

describe('Anggota 2 - Fungsi 3: Cek Bentrok Jadwal', () => {
  const daftarBookingAktif = [
    {
      code: 'INV-849201',
      vehicleId: 'ID-01',
      startDateTime: '2025-05-15T08:00',
      endDateTime: '2025-05-16T08:00',
      status: 'CONFIRMED',
    },
  ];

  test('TC 3.1: Tidak bentrok (jadwal di hari berbeda)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-20T08:00',
      '2025-05-21T08:00',
      daftarBookingAktif,
      'ID-01'
    );
    expect(hasil.isConflict).toBe(false);
    expect(hasil.status).toBe('SAFE');
    expect(hasil.message).toBe('Tidak bentrok');
  });

  test('TC 3.2: Jadwal bertabrakan (jam sewa beririsan dengan booking lama)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-15T12:00',
      '2025-05-16T12:00',
      daftarBookingAktif,
      'ID-01'
    );
    expect(hasil.isConflict).toBe(true);
    expect(hasil.status).toBe('CONFLICT');
    expect(hasil.message).toBe('Jadwal bertabrakan dengan booking yang sudah ada');
  });

  test('TC 3.3: Booking setelah jadwal sebelumnya (mulai tepat saat sewa lama selesai)', () => {
    const hasil = cekBentrokJadwal(
      '2025-05-16T08:00',
      '2025-05-17T08:00',
      daftarBookingAktif,
      'ID-01'
    );
    expect(hasil.isConflict).toBe(false);
    expect(hasil.status).toBe('AFTER_PREVIOUS');
    expect(hasil.message).toBe('Tidak bentrok (booking setelah jadwal sebelumnya)');
  });
});