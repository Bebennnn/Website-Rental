const vehicleRepo = require('../repositories/vehicle.repository');
const bookingRepo = require('../repositories/booking.repository');

class BookingService {
  calculateServerQuote(vehicle, packageId, multiplier, serviceId, deliveryId) {
    const packageHoursMap = { PKG_6H: 6, PKG_12H: 12, PKG_24H: 24 };
    const hoursPerUnit = packageHoursMap[packageId];

    if (!hoursPerUnit) {
      throw new Error('Paket durasi sewa tidak valid.');
    }

    const safeMultiplier = Math.max(1, Number(multiplier) || 1);
    const unitRate = Number(vehicle.rates[packageId] || 0);
    const totalHours = hoursPerUnit * safeMultiplier;

    const baseCost = unitRate * safeMultiplier;
    const driverCost = serviceId === 'WITH_DRIVER' ? 150000 * safeMultiplier : 0;
    const deliveryCost = deliveryId === 'DELIVERY_ADDRESS' ? 50000 : 0;
    const depositCost = serviceId === 'SELF_DRIVE' ? 300000 : 0;
    const grandTotal = baseCost + driverCost + deliveryCost + depositCost;

    return {
      totalHours,
      baseCost,
      driverCost,
      deliveryCost,
      depositCost,
      grandTotal,
    };
  }

  async createBooking(dto) {
    const vehicle = await vehicleRepo.findById(dto.vehicleId);
    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      throw new Error('Unit armada sedang tidak tersedia untuk disewa.');
    }

    const quote = this.calculateServerQuote(
      vehicle,
      dto.packageId,
      dto.multiplier,
      dto.serviceId,
      dto.deliveryId
    );

    const startTime = new Date(dto.startDateTime);
    const endTime = new Date(startTime.getTime() + quote.totalHours * 3600 * 1000);

    const hasConflict = await bookingRepo.hasTimeOverlap(vehicle.id, startTime, endTime);
    if (hasConflict) {
      throw new Error('Jadwal unit bentrok dengan reservasi aktif lain pada jam tersebut.');
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `INV-${randomDigits}`;

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
      multiplier: dto.multiplier,
      serviceId: dto.serviceId,
      deliveryId: dto.deliveryId,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      status: 'PENDING_VERIFICATION',
      ...quote,
    });
  }

  async updateBookingStatus(bookingCode, nextStatus) {
    const updatedBooking = await bookingRepo.updateStatus(bookingCode, nextStatus);
    if (!updatedBooking) {
      throw new Error('Data pesanan tidak ditemukan.');
    }

    if (nextStatus === 'ON_TRIP') {
      await vehicleRepo.updateStatus(updatedBooking.vehicleId, 'RENTED');
    } else if (nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED') {
      await vehicleRepo.updateStatus(updatedBooking.vehicleId, 'AVAILABLE');
    }

    return updatedBooking;
  }
}

module.exports = new BookingService();