const vehicleRepo = require('../repositories/vehicle.repository');
const bookingRepo = require('../repositories/booking.repository');
const userRepo = require('../repositories/user.repository');

const ALLOWED_TRANSITIONS = {
  PENDING_VERIFICATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ON_TRIP', 'CANCELLED'],
  ON_TRIP: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

class BookingService {
  calculateServerQuote(vehicle, packageId, multiplier, serviceId, deliveryId) {
    const packageHoursMap = { PKG_6H: 6, PKG_12H: 12, PKG_24H: 24 };
    const hoursPerUnit = packageHoursMap[packageId];
    if (!hoursPerUnit) throw new Error('Paket durasi sewa tidak valid.');
    const safeMultiplier = Number(multiplier);
    if (!Number.isInteger(safeMultiplier) || safeMultiplier < 1 || safeMultiplier > 14) throw new Error('Kelipatan paket harus 1 sampai 14.');
    if (!['SELF_DRIVE', 'WITH_DRIVER'].includes(serviceId)) throw new Error('Jenis layanan tidak valid.');
    if (!['PICKUP_GARAGE', 'DELIVERY_ADDRESS'].includes(deliveryId)) throw new Error('Metode serah terima tidak valid.');
    const unitRate = Number(vehicle.rates[packageId] || 0);
    const totalHours = hoursPerUnit * safeMultiplier;
    const baseCost = unitRate * safeMultiplier;
    const driverCost = serviceId === 'WITH_DRIVER' ? 150000 * safeMultiplier : 0;
    const deliveryCost = deliveryId === 'DELIVERY_ADDRESS' ? 50000 : 0;
    const depositCost = serviceId === 'SELF_DRIVE' ? 300000 : 0;
    return { totalHours, baseCost, driverCost, deliveryCost, depositCost, grandTotal: baseCost + driverCost + deliveryCost + depositCost };
  }

  async createBooking(dto) {
    const user = await userRepo.findById(dto.userId);
    if (!user) throw new Error('Akun penyewa tidak ditemukan.');
    if (user.accountStatus !== 'ACTIVE') throw new Error('Akun Anda sedang diblokir dan tidak dapat melakukan booking.');
    if (!user.verified) throw new Error('Akun belum diverifikasi admin. Lengkapi dan verifikasi data penyewa sebelum booking.');
    const required = [user.name, user.email, user.phone, user.nik, user.simA, user.address];
    if (required.some((value) => !String(value || '').trim())) throw new Error('Data penyewa belum lengkap. Lengkapi nama, email, telepon, NIK, SIM A, dan alamat.');
    if (!/^\d{16}$/.test(String(user.nik))) throw new Error('NIK harus terdiri dari 16 digit.');
    if (!/^\d{8,16}$/.test(String(user.simA))) throw new Error('Nomor SIM A harus terdiri dari 8–16 digit.');

    const vehicle = await vehicleRepo.findById(dto.vehicleId);
    if (!vehicle || vehicle.status !== 'AVAILABLE') throw new Error('Unit armada sedang tidak tersedia untuk disewa.');
    const quote = this.calculateServerQuote(vehicle, dto.packageId, dto.multiplier, dto.serviceId, dto.deliveryId);
    const startTime = new Date(dto.startDateTime);
    if (Number.isNaN(startTime.getTime()) || startTime <= new Date()) throw new Error('Waktu mulai sewa harus berupa tanggal valid di masa mendatang.');
    const endTime = new Date(startTime.getTime() + quote.totalHours * 3600 * 1000);
    if (await bookingRepo.hasTimeOverlap(vehicle.id, startTime, endTime)) throw new Error('Jadwal unit bentrok dengan reservasi aktif lain pada jam tersebut.');

    const bookingCode = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    return bookingRepo.createBookingWithTransaction({
      id: `BK-${Date.now()}`, code: bookingCode, userId: user.id,
      customerName: user.name, customerEmail: user.email, customerPhone: user.phone,
      customerNik: user.nik, customerSim: user.simA, vehicleId: vehicle.id,
      vehicleName: vehicle.name, plateNumber: vehicle.plateNumber, branchId: vehicle.branchId,
      pickupHub: String(dto.pickupHub || '').trim(), purpose: String(dto.purpose || '').trim(),
      packageId: dto.packageId, multiplier: Number(dto.multiplier), serviceId: dto.serviceId,
      deliveryId: dto.deliveryId, startDateTime: startTime.toISOString(), endDateTime: endTime.toISOString(),
      status: 'PENDING_VERIFICATION', ...quote,
    });
  }

  async updateBookingStatus(bookingCode, nextStatus) {
    const booking = await bookingRepo.findByCode(bookingCode);
    if (!booking) throw new Error('Data pesanan tidak ditemukan.');
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS, nextStatus)) throw new Error('Status booking tidak valid.');
    if (!ALLOWED_TRANSITIONS[booking.status].includes(nextStatus)) throw new Error(`Perubahan status dari ${booking.status} ke ${nextStatus} tidak diperbolehkan.`);
    if (nextStatus === 'CONFIRMED' && booking.paymentStatus === 'UNPAID') throw new Error('Booking belum dapat disetujui karena belum ada pembayaran.');
    const updated = await bookingRepo.updateStatus(bookingCode, nextStatus);
    if (nextStatus === 'ON_TRIP') await vehicleRepo.updateStatus(updated.vehicleId, 'RENTED');
    if (nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED') await vehicleRepo.updateStatus(updated.vehicleId, 'AVAILABLE');
    return updated;
  }

  async cancelBooking(bookingCode, userId) {
    const booking = await bookingRepo.findByCode(bookingCode);
    if (!booking) throw new Error('Booking tidak ditemukan.');
    if (booking.userId !== userId) throw new Error('Anda tidak memiliki akses untuk membatalkan booking ini.');
    if (!['PENDING_VERIFICATION', 'CONFIRMED'].includes(booking.status)) throw new Error('Booking hanya dapat dibatalkan saat menunggu verifikasi atau sudah disetujui, sebelum mobil digunakan.');
    const updated = await bookingRepo.cancelByCustomer(bookingCode, userId);
    if (!updated) throw new Error('Booking tidak dapat dibatalkan. Muat ulang data dan coba kembali.');
    await vehicleRepo.updateStatus(updated.vehicleId, 'AVAILABLE');
    return updated;
  }

  async updatePayment(bookingCode, paidAmount) {
    const booking = await bookingRepo.findByCode(bookingCode);
    if (!booking) throw new Error('Booking tidak ditemukan.');
    const amount = Number(paidAmount);
    if (!Number.isFinite(amount) || amount < 0 || amount > booking.grandTotal) throw new Error('Nominal pembayaran harus antara 0 dan total tagihan.');
    return bookingRepo.updatePayment(bookingCode, amount);
  }
}
module.exports = new BookingService();
