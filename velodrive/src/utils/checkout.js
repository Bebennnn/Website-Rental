import { calculateDiscount } from './discount.js';
import { calculateDeposit } from './deposit.js';

/**
 * Menggabungkan fitur Diskon dan Deposit ke dalam rincian biaya checkout.
 * - Deposit mengikuti kategori mobil dan jenis layanan (calculateDeposit).
 * - Diskon hanya dihitung dari biaya sewa pokok (baseCost), bukan dari deposit.
 * - Kode promo yang salah tidak melempar error, tetapi dikembalikan sebagai promoError
 *   agar bisa ditampilkan di formulir.
 *
 * @param {Object|null} quote - Hasil calculateRentalQuote
 * @param {{category?: string, serviceId?: string, promoCode?: string}} options
 * @returns {Object|null} Quote baru dengan depositCost, diskon, dan grandTotal terbaru
 */
export function applyCheckoutAdjustments(quote, { category, serviceId, promoCode } = {}) {
  if (!quote) return null;

  let depositCost = quote.depositCost;
  try {
    depositCost = calculateDeposit(category, serviceId);
  } catch {
    // Kategori/layanan tidak dikenal: pakai deposit bawaan dari quote.
  }

  const code = typeof promoCode === 'string' ? promoCode.trim() : '';
  let discountCode = null;
  let discountPercent = 0;
  let discountAmount = 0;
  let promoError = '';

  if (code) {
    try {
      const result = calculateDiscount(quote.baseCost, code);
      discountCode = code.toUpperCase();
      discountPercent = result.percent;
      discountAmount = result.discountAmount;
    } catch (error) {
      promoError = error.message;
    }
  }

  return {
    ...quote,
    depositCost,
    discountCode,
    discountPercent,
    discountAmount,
    promoError,
    grandTotal:
      quote.baseCost - discountAmount + quote.driverCost + quote.deliveryCost + depositCost,
  };
}
