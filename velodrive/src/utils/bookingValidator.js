export function cekKetersediaanMobil(daftarMobil = [], vehicleId) {
  const mobil = Array.isArray(daftarMobil)
    ? daftarMobil.find((item) => item.id === vehicleId)
    : daftarMobil;

  if (!mobil || !mobil.id) {
    return { isAvailable: false, status: 'NOT_FOUND', message: 'ID mobil tidak ditemukan' };
  }
  if (mobil.status === 'RENTED') {
    return { isAvailable: false, status: 'RENTED', message: 'Mobil sedang disewa' };
  }
  if (mobil.status === 'MAINTENANCE') {
    return { isAvailable: false, status: 'MAINTENANCE', message: 'Mobil sedang servis' };
  }
  return { isAvailable: true, status: 'AVAILABLE', message: 'Mobil tersedia' };
}

export function validasiBooking(dataBooking = {}) {
  const nama = dataBooking.customerName ?? dataBooking.nama ?? '';
  const mobil = dataBooking.vehicleId ?? dataBooking.mobil ?? '';
  const tanggal = dataBooking.startDateTime ?? dataBooking.tanggal ?? '';

  if (String(nama).trim() === '') {
    return { isValid: false, errorField: 'customerName', message: 'Nama tidak boleh kosong' };
  }
  if (String(mobil).trim() === '') {
    return { isValid: false, errorField: 'vehicleId', message: 'Mobil tidak boleh kosong' };
  }
  if (String(tanggal).trim() === '') {
    return { isValid: false, errorField: 'startDateTime', message: 'Tanggal tidak boleh kosong' };
  }
  return { isValid: true, errorField: null, message: 'Data booking lengkap' };
}

export function cekBentrokJadwal(startBaru, endBaru, jadwalAktif = [], vehicleId = null) {
  const newStart = new Date(startBaru).getTime();
  const newEnd = new Date(endBaru).getTime();

  if (Number.isNaN(newStart) || Number.isNaN(newEnd) || newEnd <= newStart) {
    return {
      isConflict: true,
      hasConflict: true,
      status: 'INVALID_DATE',
      message: 'Tanggal tidak boleh kosong atau tidak valid',
    };
  }

  let tepatSetelah = false;

  for (const booking of jadwalAktif) {
    if (vehicleId && booking.vehicleId !== vehicleId) continue;
    if (booking.status === 'CANCELLED') continue;

    const existingStart = new Date(booking.startDateTime).getTime();
    const existingEnd = new Date(booking.endDateTime).getTime();

    if (newStart === existingEnd) {
      tepatSetelah = true;
      continue;
    }

    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        isConflict: true,
        hasConflict: true,
        status: 'CONFLICT',
        message: `Jadwal bertabrakan dengan pesanan ${booking.code}`,
      };
    }
  }

  if (tepatSetelah) {
    return {
      isConflict: false,
      hasConflict: false,
      status: 'AFTER_PREVIOUS',
      message: 'Tidak bentrok (booking setelah jadwal sebelumnya)',
    };
  }

  return {
    isConflict: false,
    hasConflict: false,
    status: 'SAFE',
    message: 'Tidak bentrok',
  };
}

// Alias agar tetap sinkron dengan komponen UI UserStorefrontPage.jsx
export const validateVehicleAvailability = cekKetersediaanMobil;
export const validateBookingData = validasiBooking;
export const validateScheduleConflict = cekBentrokJadwal;