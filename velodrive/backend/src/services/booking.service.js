
const vehicleRepo = require('../repositories/vehicle.repository');
const bookingRepo = require('../repositories/booking.repository');
const { resolveDiscount, resolveDeposit } = require('./pricing.rules');

class BookingService {
  calculateServerQuote(vehicle, packageId, multiplier, serviceId, deliveryId, discountCode = null) {
    const packageHoursMap = {
      PKG_6H: 6,
      PKG_12H: 12,
      PKG_24H: 24,
    };

    const hoursPerUnit = packageHoursMap[packageId];

    if (!hoursPerUnit) {
      throw new Error('Paket durasi sewa tidak valid.');
    }

    // Validasi multiplier
    const safeMultiplier = Number(multiplier);

    if (
      !Number.isSafeInteger(safeMultiplier) ||
      safeMultiplier < 1
    ) {
      throw new Error('Kelipatan paket penyewaan tidak valid.');
    }

    // Validasi jenis layanan
    if (!['SELF_DRIVE', 'WITH_DRIVER'].includes(serviceId)) {
      throw new Error('Jenis layanan penyewaan tidak valid.');
    }

    // Validasi metode pengiriman
    if (!['PICKUP_GARAGE', 'DELIVERY_ADDRESS'].includes(deliveryId)) {
      throw new Error('Metode pengambilan kendaraan tidak valid.');
    }

    // Validasi harga kendaraan
    const unitRate = Number(vehicle.rates?.[packageId]);

    if (!Number.isFinite(unitRate) || unitRate <= 0) {
      throw new Error('Harga penyewaan tidak valid.');
    }

    // Perhitungan durasi dan biaya
    const totalHours = hoursPerUnit * safeMultiplier;

    const baseCost = unitRate * safeMultiplier;

    const driverCost =
      serviceId === 'WITH_DRIVER'
        ? 150000 * safeMultiplier
        : 0;

    const deliveryCost =
      deliveryId === 'DELIVERY_ADDRESS'
        ? 50000
        : 0;

    // Deposit mengikuti kategori mobil, diskon hanya dari biaya sewa pokok
    const depositCost = resolveDeposit(vehicle.category, serviceId);

    const { discountCode: appliedCode, discountAmount } = resolveDiscount(
      baseCost,
      discountCode
    );

    const grandTotal =
      baseCost - discountAmount + driverCost + deliveryCost + depositCost;

    return {
      totalHours,
      baseCost,
      driverCost,
      deliveryCost,
      depositCost,
      discountCode: appliedCode,
      discountAmount,
      grandTotal,
    };
  }

  async createBooking(dto) {
    // 1. Validasi kendaraan
    if (!dto.vehicleId) {
      throw new Error('ID kendaraan wajib diisi.');
    }

    const vehicle = await vehicleRepo.findById(dto.vehicleId);

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      throw new Error(
        'Unit armada sedang tidak tersedia untuk disewa.'
      );
    }

    // 2. Hitung biaya dan durasi berdasarkan data backend
    const quote = this.calculateServerQuote(
      vehicle,
      dto.packageId,
      dto.multiplier,
      dto.serviceId,
      dto.deliveryId,
      dto.discountCode
    );

    const safeMultiplier = Number(dto.multiplier);

    // 3. Validasi waktu mulai
    if (!dto.startDateTime) {
      throw new Error(
        'Waktu mulai penyewaan wajib diisi.'
      );
    }

    const startTime = new Date(dto.startDateTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new Error(
        'Waktu mulai penyewaan tidak valid.'
      );
    }

    if (startTime.getTime() <= Date.now()) {
      throw new Error(
        'Waktu mulai penyewaan harus lebih dari waktu sekarang.'
      );
    }

    // 4. Hitung waktu pengembalian di backend
    const endTime = new Date(
      startTime.getTime() +
      quote.totalHours * 60 * 60 * 1000
    );

    if (
      Number.isNaN(endTime.getTime()) ||
      endTime.getTime() <= startTime.getTime()
    ) {
      throw new Error(
        'Perhitungan waktu pengembalian tidak valid.'
      );
    }

    // 5. Buat kode booking
    const randomDigits = Math.floor(
      100000 + Math.random() * 900000
    );

    const bookingCode = `INV-${randomDigits}`;

    // 6. Simpan booking melalui transaksi repository.
    // Pemeriksaan konflik dilakukan di dalam transaksi.
    return await bookingRepo.createBookingWithTransaction({
      id: `BK-${Date.now()}`,
      code: bookingCode,

      userId: dto.userId,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      customerNik: dto.customerNik,
      customerSim: dto.customerSim,

      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      plateNumber: vehicle.plateNumber,
      branchId: vehicle.branchId,

      pickupHub: dto.pickupHub,
      purpose: dto.purpose,

      packageId: dto.packageId,
      multiplier: safeMultiplier,
      totalHours: quote.totalHours,

      serviceId: dto.serviceId,
      deliveryId: dto.deliveryId,

      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),

      status: 'PENDING_VERIFICATION',

      ...quote,
    });
  }

  async updateBookingStatus(bookingCode, nextStatus) {
    const allowedStatuses = [
      'PENDING_VERIFICATION',
      'CONFIRMED',
      'ON_TRIP',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(nextStatus)) {
      throw new Error('Status booking tidak valid.');
    }

    const updatedBooking = await bookingRepo.updateStatus(
      bookingCode,
      nextStatus
    );

    if (!updatedBooking) {
      throw new Error('Data pesanan tidak ditemukan.');
    }

    // Sinkronisasi status kendaraan
    if (nextStatus === 'ON_TRIP') {
      await vehicleRepo.updateStatus(
        updatedBooking.vehicleId,
        'RENTED'
      );
    } else if (
      nextStatus === 'COMPLETED' ||
      nextStatus === 'CANCELLED'
    ) {
      await vehicleRepo.updateStatus(
        updatedBooking.vehicleId,
        'AVAILABLE'
      );
    }

    return updatedBooking;
  }
}

module.exports = new BookingService();
