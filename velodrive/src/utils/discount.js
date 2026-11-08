/**
 * Fitur: Hitung Diskon (calculateDiscount)
 *
 * Mengurangi harga berdasarkan kode promo (string) atau persentase (number).
 * Diskon sebaiknya dihitung dari biaya sewa (baseCost), bukan dari deposit
 * karena deposit bersifat refundable.
 *
 * Skenario Pengujian:
 * - Diskon valid (kode atau persentase)
 * - Diskon nol / tanpa diskon
 * - Kode salah
 * - Diskon terlalu besar
 */

export const DISCOUNT_CODES = Object.freeze({
  VELO10: 10,
  MAHASISWA: 15,
  WEEKEND20: 20,
});

export const MAX_DISCOUNT_PERCENT = 30;

/**
 * @param {number} price - Harga sebelum diskon (IDR, tidak boleh negatif)
 * @param {string|number|null} [discount=0] - Kode promo atau persentase diskon
 * @returns {{originalPrice: number, percent: number, discountAmount: number, finalPrice: number}}
 * @throws {TypeError|Error} Jika harga, kode, atau persentase tidak valid
 */
export function calculateDiscount(price, discount = 0) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    throw new TypeError('Harga tidak valid.');
  }

  let percent;

  if (discount === null || discount === undefined) {
    percent = 0;
  } else if (typeof discount === 'string') {
    const code = discount.trim().toUpperCase();
    percent = DISCOUNT_CODES[code];
    if (percent === undefined) {
      throw new Error(`Kode diskon tidak valid: "${discount}".`);
    }
  } else if (typeof discount === 'number' && Number.isFinite(discount)) {
    percent = discount;
  } else {
    throw new TypeError('Diskon harus berupa kode (teks) atau persentase (angka).');
  }

  if (percent < 0 || percent > MAX_DISCOUNT_PERCENT) {
    throw new Error(
      `Persentase diskon harus antara 0 dan ${MAX_DISCOUNT_PERCENT}.`
    );
  }

  const discountAmount = Math.round((price * percent) / 100);

  return {
    originalPrice: price,
    percent,
    discountAmount,
    finalPrice: price - discountAmount,
  };
}
