
/**
 * FUNGSI 1: Cek Ketersediaan Mobil
 *
 * @param {Array} daftarMobil - Array daftar kendaraan dari database/state
 * @param {string} vehicleId - ID mobil yang ingin disewa
 */
function cekKetersediaanMobil(daftarMobil = [], vehicleId) {
  // Jika parameter pertama yang dikirim langsung berupa objek mobil tunggal
  const mobil = Array.isArray(daftarMobil)
    ? daftarMobil.find((item) => item.id === vehicleId)
    : daftarMobil;

  if (!mobil || !mobil.id) {
    return {
      isAvailable: false,
      status: 'NOT_FOUND',
      message: 'ID mobil tidak ditemukan',
    };
  }

  if (mobil.status === 'RENTED' || mobil.status === 'DISEWA') {
    return {
      isAvailable: false,
      status: 'RENTED',
      message: 'Mobil sedang disewa',
    };
  }

  if (mobil.status === 'MAINTENANCE' || mobil.status === 'SERVIS') {
    return {
      isAvailable: false,
      status: 'MAINTENANCE',
      message: 'Mobil sedang servis',
    };
  }

  if (mobil.status === 'AVAILABLE' || mobil.status === 'TERSEDIA') {
    return {
      isAvailable: true,
      status: 'AVAILABLE',
      message: 'Mobil tersedia',
    };
  }

  return {
    isAvailable: false,
    status: 'UNKNOWN',
    message: 'Status mobil tidak diketahui',
  };
}

/**
 * FUNGSI 2: Validasi Booking
 *
 * @param {Object} dataBooking - Objek data pemesanan
 */
function validasiBooking(dataBooking = {}) {
  if (!dataBooking || typeof dataBooking !== 'object') {
    return {
      isValid: false,
      errorField: 'all',
      message: 'Data booking tidak boleh kosong',
    };
  }

  const nama = dataBooking.customerName ?? dataBooking.nama ?? '';
  const mobil = dataBooking.vehicleId ?? dataBooking.mobil ?? '';
  const tanggalMulai = dataBooking.startDateTime ?? dataBooking.tanggalMulai ?? dataBooking.tanggal ?? '';

  if (String(nama).trim() === '') {
    return {
      isValid: false,
      errorField: 'customerName',
      message: 'Nama tidak boleh kosong',
    };
  }

  if (String(mobil).trim() === '') {
    return {
      isValid: false,
      errorField: 'vehicleId',
      message: 'Mobil tidak boleh kosong',
    };
  }

  if (String(tanggalMulai).trim() === '') {
    return {
      isValid: false,
      errorField: 'startDateTime',
      message: 'Tanggal tidak boleh kosong',
    };
  }

  return {
    isValid: true,
    errorField: null,
    message: 'Data booking lengkap',
  };
}

/**
 * FUNGSI 3: Cek Bentrok Jadwal
 *
 * @param {string} startBaru - Waktu mulai booking baru (ISO String / Date)
 * @param {string} endBaru - Waktu selesai booking baru (ISO String / Date)
 * @param {Array} jadwalAktif - Daftar booking yang sudah ada
 * @param {string} [vehicleId] - Opsional filter ID kendaraan
 */
function cekBentrokJadwal(startBaru, endBaru, jadwalAktif = [], vehicleId = null) {
  const newStart = new Date(startBaru).getTime();
  const newEnd = new Date(endBaru).getTime();

  if (Number.isNaN(newStart) || Number.isNaN(newEnd) || newEnd <= newStart) {
    return {
      isConflict: true,
      hasConflict: true,
      status: 'INVALID_DATE',
      message: 'Format tanggal mulai dan selesai tidak valid',
    };
  }

  let tepatSetelahJadwalSebelumnya = false;

  for (const booking of jadwalAktif) {
    // Jika vehicleId disertakan, hanya cek booking pada mobil yang sama
    if (vehicleId && booking.vehicleId && booking.vehicleId !== vehicleId) {
      continue;
    }

    // Abaikan booking yang sudah dibatalkan
    if (booking.status === 'CANCELLED') {
      continue;
    }

    const existingStart = new Date(booking.startDateTime || booking.start_time).getTime();
    const existingEnd = new Date(booking.endDateTime || booking.end_time).getTime();

    if (newStart === existingEnd) {
      tepatSetelahJadwalSebelumnya = true;
      continue;
    }

    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        isConflict: true,
        hasConflict: true,
        status: 'CONFLICT',
        conflictingBooking: booking,
        message: 'Jadwal bertabrakan dengan booking yang sudah ada',
      };
    }
  }

  if (tepatSetelahJadwalSebelumnya) {
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

module.exports = {
  cekKetersediaanMobil,
  validasiBooking,
  cekBentrokJadwal,
  // Alias agar kompatibel dengan pemanggilan di service
  validateVehicleAvailability: cekKetersediaanMobil,
  validateBookingData: validasiBooking,
  validateScheduleConflict: cekBentrokJadwal,
};
