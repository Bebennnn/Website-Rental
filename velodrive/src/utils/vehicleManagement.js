/**
 * Modul Manajemen Armada Kendaraan (Anggota 7)
 * Fitur 1: Ubah Status Mobil (updateVehicleStatus)
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
