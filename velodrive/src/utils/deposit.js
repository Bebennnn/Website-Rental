import { INDONESIAN_CAR_CATEGORIES, SERVICE_TYPES } from '../constants/rentalData.js';

/**
 * Fitur: Hitung Deposit (calculateDeposit)
 *
 * Menentukan uang jaminan (refundable) yang harus dibayar penyewa.
 * - Layanan dengan supir (WITH_DRIVER): tidak ada deposit.
 * - Layanan lepas kunci (SELF_DRIVE): deposit mengikuti kategori mobil.
 *   Mobil biasa memakai nilai deposit standar dari SERVICE_TYPES,
 *   mobil premium (SUV dan EV) memakai deposit yang lebih tinggi.
 *
 * Skenario Pengujian:
 * - Mobil biasa
 * - Mobil premium
 * - Layanan lepas kunci vs dengan supir
 * - Input kosong / tidak dikenal
 */

export const PREMIUM_CATEGORIES = Object.freeze(['SUV', 'EV']);
export const PREMIUM_SELF_DRIVE_DEPOSIT = 1000000;

/**
 * @param {string} category - ID kategori mobil (MPV, SUV, CITY_LCGC, dst.)
 * @param {string} [serviceId='SELF_DRIVE'] - SELF_DRIVE atau WITH_DRIVER
 * @returns {number} Nominal deposit (IDR)
 * @throws {Error} Jika kategori atau layanan kosong / tidak dikenal
 */
export function calculateDeposit(category, serviceId = 'SELF_DRIVE') {
  if (typeof category !== 'string' || !category.trim()) {
    throw new Error('Kategori mobil wajib diisi.');
  }

  const categoryId = category.trim().toUpperCase();
  const isKnownCategory = INDONESIAN_CAR_CATEGORIES.some((c) => c.id === categoryId);
  if (!isKnownCategory) {
    throw new Error(`Kategori mobil tidak dikenal: "${category}".`);
  }

  const service = SERVICE_TYPES[serviceId];
  if (!service) {
    throw new Error(`Jenis layanan tidak dikenal: "${serviceId}".`);
  }

  if (serviceId === 'WITH_DRIVER') {
    return service.refundableDeposit;
  }

  return PREMIUM_CATEGORIES.includes(categoryId)
    ? PREMIUM_SELF_DRIVE_DEPOSIT
    : service.refundableDeposit;
}
