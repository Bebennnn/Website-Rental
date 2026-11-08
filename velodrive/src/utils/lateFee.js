/**
 * Fitur: Hitung Denda (calculateLateFee)
 *
 * Menghitung denda jika mobil terlambat dikembalikan.
 * Keterlambatan dibulatkan ke atas per jam (30 menit = 1 jam).
 *
 * Skenario Pengujian:
 * - Tidak terlambat
 * - Terlambat 1 jam
 * - Terlambat beberapa jam
 * - Durasi negatif / tidak valid
 */

export const LATE_FEE_PER_HOUR = 50000;

/**
 * @param {number} lateHours - Lama keterlambatan dalam jam (0 = tepat waktu)
 * @param {number} [ratePerHour=LATE_FEE_PER_HOUR] - Tarif denda per jam (IDR)
 * @returns {number} Total denda (IDR)
 * @throws {TypeError|Error} Jika durasi atau tarif tidak valid
 */
export function calculateLateFee(lateHours, ratePerHour = LATE_FEE_PER_HOUR) {
  if (typeof lateHours !== 'number' || !Number.isFinite(lateHours)) {
    throw new TypeError('Durasi keterlambatan harus berupa angka.');
  }

  if (lateHours < 0) {
    throw new Error('Durasi keterlambatan tidak boleh negatif.');
  }

  if (typeof ratePerHour !== 'number' || !Number.isFinite(ratePerHour) || ratePerHour <= 0) {
    throw new Error('Tarif denda per jam tidak valid.');
  }

  return Math.ceil(lateHours) * ratePerHour;
}

/**
 * Menghitung jam keterlambatan dari waktu selesai sewa (endDateTime di booking)
 * dan waktu mobil benar-benar dikembalikan. Hasil 0 jika tidak terlambat.
 *
 * @param {string} endIso - Waktu selesai sewa, contoh '2026-01-01T09:00'
 * @param {string} returnedIso - Waktu pengembalian aktual
 * @returns {number} Jam keterlambatan (>= 0)
 * @throws {Error} Jika format tanggal tidak valid
 */
export function getLateHours(endIso, returnedIso) {
  const end = new Date(endIso);
  const returned = new Date(returnedIso);

  if (Number.isNaN(end.getTime()) || Number.isNaN(returned.getTime())) {
    throw new Error('Format tanggal tidak valid.');
  }

  const lateMinutes = Math.ceil((returned.getTime() - end.getTime()) / 60000);
  return lateMinutes > 0 ? lateMinutes / 60 : 0;
}

/**
 * Ringkasan keterlambatan sebuah booking untuk ditampilkan di dashboard admin.
 * Hanya booking berstatus ON_TRIP (mobil masih di tangan penyewa) yang bisa terlambat.
 *
 * @param {Object} booking - Objek booking (butuh status dan endDateTime)
 * @param {Date|string} [referenceDate=new Date()] - Waktu pembanding (default: sekarang)
 * @returns {{isLate: boolean, billedHours: number, fee: number}}
 */
export function getBookingLateInfo(booking, referenceDate = new Date()) {
  const notLate = { isLate: false, billedHours: 0, fee: 0 };

  if (!booking || booking.status !== 'ON_TRIP' || !booking.endDateTime) {
    return notLate;
  }

  let lateHours;
  try {
    lateHours = getLateHours(booking.endDateTime, new Date(referenceDate).toISOString());
  } catch {
    return notLate;
  }

  if (lateHours <= 0) {
    return notLate;
  }

  return {
    isLate: true,
    billedHours: Math.ceil(lateHours),
    fee: calculateLateFee(lateHours),
  };
}
