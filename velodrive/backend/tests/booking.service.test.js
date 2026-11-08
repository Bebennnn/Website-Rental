
const userRepo = require('../src/repositories/user.repository');
const vehicleRepo = require('../src/repositories/vehicle.repository');
const bookingRepo = require('../src/repositories/booking.repository');
const bookingService = require('../src/services/booking.service');

jest.mock('../src/repositories/vehicle.repository');
jest.mock('../src/repositories/booking.repository');
jest.mock('../src/repositories/user.repository', () => ({
  findById: jest.fn(),
}));

describe('BookingService', () => {
  const vehicle = {
    id: 'ID-01',
    name: 'Toyota Avanza',
    plateNumber: 'D 1421 VLD',
    branchId: 'BDG',
    status: 'AVAILABLE',
    rates: {
      PKG_6H: 200000,
      PKG_12H: 325000,
      PKG_24H: 450000,
    },
  };

  const createDTO = {
    vehicleId: 'ID-01',
    userId: 'USR-01',
    customerName: 'Rizky Pratama',
    customerEmail: 'rizky@example.com',
    customerPhone: '081234567890',
    customerNik: '3273011205030001',
    customerSim: '120503998877',
    packageId: 'PKG_6H',
    multiplier: 1,
    serviceId: 'SELF_DRIVE',
    deliveryId: 'PICKUP_GARAGE',
    startDateTime: new Date(Date.now() + 86400000).toISOString(),
    pickupHub: 'Garasi Bandung',
    purpose: 'Perjalanan keluarga',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    userRepo.findById.mockResolvedValue({
      id: 'USR-01',
      name: 'Rizky Pratama',
      email: 'rizky@example.com',
      phone: '081234567890',
      nik: '3273011205030001',
      simA: '120503998877',
      address: 'Bandung',
      accountStatus: 'ACTIVE',
      verified: true,
    });

    vehicleRepo.findById.mockResolvedValue(vehicle);

    bookingRepo.hasTimeOverlap.mockResolvedValue(false);

    bookingRepo.createBookingWithTransaction.mockImplementation(
      async (payload) => payload
    );
  });

  // ==========================================
  // CALCULATE SERVER QUOTE
  // ==========================================

  describe('calculateServerQuote', () => {
    it('menghitung harga paket 6 jam dengan benar', () => {
      const quote = bookingService.calculateServerQuote(
        vehicle,
        'PKG_6H',
        1,
        'SELF_DRIVE',
        'PICKUP_GARAGE'
      );

      expect(quote).toMatchObject({
        totalHours: 6,
        baseCost: 200000,
        driverCost: 0,
        deliveryCost: 0,
        depositCost: 300000,
        grandTotal: 500000,
      });
    });

    it('menolak paket yang tidak valid', () => {
      expect(() =>
        bookingService.calculateServerQuote(
          vehicle,
          'PKG_INVALID',
          1,
          'SELF_DRIVE',
          'PICKUP_GARAGE'
        )
      ).toThrow('Paket durasi sewa tidak valid.');
    });

    it('menolak multiplier negatif', () => {
      expect(() =>
        bookingService.calculateServerQuote(
          vehicle,
          'PKG_6H',
          -1,
          'SELF_DRIVE',
          'PICKUP_GARAGE'
        )
      ).toThrow('Kelipatan paket penyewaan tidak valid.');
    });

    it('menghitung biaya supir dan pengantaran', () => {
      const quote = bookingService.calculateServerQuote(
        vehicle,
        'PKG_6H',
        2,
        'WITH_DRIVER',
        'DELIVERY_ADDRESS'
      );

      expect(quote).toMatchObject({
        totalHours: 12,
        baseCost: 400000,
        driverCost: 300000,
        deliveryCost: 50000,
        depositCost: 0,
        grandTotal: 750000,
      });
    });
  });

  // ==========================================
  // CREATE BOOKING
  // ==========================================

  describe('createBooking', () => {
    it('menolak kendaraan yang tidak ditemukan', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(
        bookingService.createBooking(createDTO)
      ).rejects.toThrow(
        'Unit armada sedang tidak tersedia untuk disewa.'
      );
    });

    it('menolak kendaraan yang tidak tersedia', async () => {
      vehicleRepo.findById.mockResolvedValue({
        ...vehicle,
        status: 'RENTED',
      });

      await expect(
        bookingService.createBooking(createDTO)
      ).rejects.toThrow(
        'Unit armada sedang tidak tersedia untuk disewa.'
      );
    });

    it('menolak waktu mulai yang kosong', async () => {
      await expect(
        bookingService.createBooking({
          ...createDTO,
          startDateTime: '',
        })
      ).rejects.toThrow(
        'Waktu mulai penyewaan wajib diisi.'
      );
    });

    it('menolak waktu mulai yang tidak valid', async () => {
      await expect(
        bookingService.createBooking({
          ...createDTO,
          startDateTime: 'invalid-date',
        })
      ).rejects.toThrow(
        'Waktu mulai penyewaan tidak valid.'
      );
    });

    it('menolak waktu mulai yang sudah lewat', async () => {
      await expect(
        bookingService.createBooking({
          ...createDTO,
          startDateTime: new Date(
            Date.now() - 60000
          ).toISOString(),
        })
      ).rejects.toThrow(
        'Waktu mulai penyewaan harus lebih dari waktu sekarang.'
      );
    });

    it('menolak jadwal yang bentrok', async () => {
      bookingRepo.createBookingWithTransaction.mockRejectedValue(
        new Error(
          'Jadwal unit bentrok dengan reservasi aktif lain pada jam tersebut.'
        )
      );

      await expect(
        bookingService.createBooking(createDTO)
      ).rejects.toThrow(
        'Jadwal unit bentrok dengan reservasi aktif lain pada jam tersebut.'
      );
    });

    it('berhasil membuat booking dengan status pending verification', async () => {
      const result = await bookingService.createBooking(createDTO);

      expect(result).toMatchObject({
        userId: 'USR-01',
        vehicleId: 'ID-01',
        vehicleName: 'Toyota Avanza',
        status: 'PENDING_VERIFICATION',
        totalHours: 6,
        grandTotal: 500000,
      });

      expect(bookingRepo.createBookingWithTransaction)
        .toHaveBeenCalledTimes(1);
    });
  });
});
