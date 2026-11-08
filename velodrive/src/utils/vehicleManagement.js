/**
 * Modul Manajemen Armada Kendaraan (Anggota 7)
 * Fitur 1: Ubah Status Mobil (updateVehicleStatus)
 * Fitur 2: Cek Jadwal Servis (checkServiceSchedule)
 */

export const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
});

// Pemetaan alias status ramah pengguna (termasuk bahasa Indonesia)
const STATUS_ALIASES = {
  tersedia: VEHICLE_STATUS.AVAILABLE,
  available: VEHICLE_STATUS.AVAILABLE,
  disewa: VEHICLE_STATUS.RENTED,
  rented: VEHICLE_STATUS.RENTED,
  servis: VEHICLE_STATUS.MAINTENANCE,
  perawatan: VEHICLE_STATUS.MAINTENANCE,
  maintenance: VEHICLE_STATUS.MAINTENANCE,
};

/**
 * 1. Ubah Status Mobil
 * Mengubah status mobil menjadi AVAILABLE (tersedia), RENTED (disewa), atau MAINTENANCE (servis).
 *
 * Skenario Pengujian:
 * - Status tersedia (AVAILABLE)
 * - Status disewa (RENTED)
 * - Status servis (MAINTENANCE)
 * - Status salah / tidak dikenal (melempar error deskriptif)
 *
 * @param {Object} vehicle - Objek data kendaraan (minimal memiliki id dan status)
 * @param {string} newStatus - Status baru yang ingin diterapkan
 * @returns {Object} Salinan objek kendaraan baru dengan status yang telah diperbarui
 * @throws {TypeError|Error} Jika data kendaraan tidak valid atau status tidak dikenal
 */
export function updateVehicleStatus(vehicle, newStatus) {
  if (!vehicle || typeof vehicle !== 'object') {
    throw new TypeError('Data kendaraan tidak valid.');
  }

  if (typeof newStatus !== 'string' || !newStatus.trim()) {
    throw new Error('Status baru harus berupa teks non-kosong.');
  }

  const cleanStatus = newStatus.trim();
  const normalizedKey = cleanStatus.toUpperCase();
  const lowerKey = cleanStatus.toLowerCase();

  const finalStatus =
    VEHICLE_STATUS[normalizedKey] ||
    STATUS_ALIASES[lowerKey];

  if (!finalStatus) {
    throw new Error(
      `Status tidak dikenal: "${newStatus}". Pilihan valid: AVAILABLE, RENTED, MAINTENANCE.`
    );
  }

  return {
    ...vehicle,
    status: finalStatus,
    updatedAt: new Date().toISOString(),
  };
}


/**
 * 2. Cek Jadwal Servis Mobil
 * Mengecek apakah mobil sudah waktunya diservis berdasarkan jarak tempuh (kilometer)
 * atau tanggal jatuh tempo servis.
 *
 * Skenario Pengujian:
 * - Belum waktunya (currentKm < nextServiceKm / tanggal servis di masa depan)
 * - Sudah waktunya (currentKm >= nextServiceKm / tanggal servis sudah lewat)
 * - Data servis kosong (properti servis tidak ada / null / invalid)
 *
 * @param {Object} vehicle - Objek kendaraan yang memiliki data servis
 * @param {Date|string} [referenceDate=new Date()] - Tanggal referensi pengecekan (default: hari ini)
 * @returns {Object} Hasil evaluasi { isDue, status, message, ... }
 */
export function checkServiceSchedule(vehicle, referenceDate = new Date()) {
  if (!vehicle || typeof vehicle !== 'object') {
    return {
      isDue: false,
      status: 'DATA_KOSONG',
      message: 'Data kendaraan atau informasi servis tidak ditemukan.',
    };
  }

  const service = vehicle.serviceInfo || vehicle.service || vehicle;
  const currentKm = service.currentKm ?? service.odometer;
  const nextServiceKm = service.nextServiceKm ?? service.serviceTargetKm;
  const nextServiceDate = service.nextServiceDate ?? service.serviceDueDate;

  const hasKmData =
    typeof currentKm === 'number' &&
    Number.isFinite(currentKm) &&
    typeof nextServiceKm === 'number' &&
    Number.isFinite(nextServiceKm);

  const hasDateData = Boolean(nextServiceDate);

  if (!hasKmData && !hasDateData) {
    return {
      isDue: false,
      status: 'DATA_KOSONG',
      message: 'Data servis kosong atau tidak lengkap.',
    };
  }

  if (hasKmData && (currentKm < 0 || nextServiceKm < 0)) {
    return {
      isDue: false,
      status: 'DATA_KOSONG',
      message: 'Nilai kilometer tidak valid (tidak boleh negatif).',
    };
  }

  const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const isDateValid = !Number.isNaN(now.getTime());

  let isKmDue = false;
  let kmDiff = 0;
  if (hasKmData) {
    isKmDue = currentKm >= nextServiceKm;
    kmDiff = currentKm - nextServiceKm;
  }

  let isDateDue = false;
  if (hasDateData && isDateValid) {
    const targetDate = new Date(nextServiceDate);
    if (!Number.isNaN(targetDate.getTime())) {
      isDateDue = now.getTime() >= targetDate.getTime();
    }
  }

  if (isKmDue || isDateDue) {
    const reasons = [];
    if (isKmDue) reasons.push(`jarak tempuh melebihi batas servis (${kmDiff} km)`);
    if (isDateDue) reasons.push('jadwal tanggal servis telah jatuh tempo');
    return {
      isDue: true,
      status: 'SUDAH_WAKTUNYA',
      message: `Mobil sudah waktunya diservis karena ${reasons.join(' dan ')}.`,
      kmDiff,
      currentKm: hasKmData ? currentKm : null,
      nextServiceKm: hasKmData ? nextServiceKm : null,
    };
  }

  const remainingKm = hasKmData ? nextServiceKm - currentKm : null;
  return {
    isDue: false,
    status: 'BELUM_WAKTUNYA',
    message: remainingKm !== null
      ? `Mobil belum waktunya diservis. Sisa jarak tempuh: ${remainingKm} km.`
      : 'Mobil belum waktunya diservis.',
    remainingKm,
  };
}
