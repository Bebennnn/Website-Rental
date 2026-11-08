/**
 * Aturan harga sisi server untuk fitur Diskon dan Deposit.
 * Nilai di sini harus sama dengan frontend (src/utils/discount.js dan deposit.js),
 * karena server selalu menghitung ulang total dan tidak memercayai angka dari klien.
 */

const DISCOUNT_CODES = Object.freeze({
  VELO10: 10,
  MAHASISWA: 15,
  WEEKEND20: 20,
});

const MAX_DISCOUNT_PERCENT = 30;
const PREMIUM_CATEGORIES = Object.freeze(['SUV', 'EV']);
const STANDARD_SELF_DRIVE_DEPOSIT = 300000;
const PREMIUM_SELF_DRIVE_DEPOSIT = 1000000;

function resolveDiscount(baseCost, discountCode) {
  if (discountCode === undefined || discountCode === null || discountCode === '') {
    return { discountCode: null, discountPercent: 0, discountAmount: 0 };
  }

  if (typeof discountCode !== 'string') {
    throw new Error('Kode diskon tidak valid.');
  }

  const code = discountCode.trim().toUpperCase();
  const percent = DISCOUNT_CODES[code];

  if (percent === undefined || percent > MAX_DISCOUNT_PERCENT) {
    throw new Error('Kode diskon tidak valid.');
  }

  return {
    discountCode: code,
    discountPercent: percent,
    discountAmount: Math.round((baseCost * percent) / 100),
  };
}

function resolveDeposit(category, serviceId) {
  if (serviceId === 'WITH_DRIVER') {
    return 0;
  }

  const normalized = typeof category === 'string' ? category.trim().toUpperCase() : '';
  return PREMIUM_CATEGORIES.includes(normalized)
    ? PREMIUM_SELF_DRIVE_DEPOSIT
    : STANDARD_SELF_DRIVE_DEPOSIT;
}

module.exports = {
  DISCOUNT_CODES,
  MAX_DISCOUNT_PERCENT,
  PREMIUM_CATEGORIES,
  STANDARD_SELF_DRIVE_DEPOSIT,
  PREMIUM_SELF_DRIVE_DEPOSIT,
  resolveDiscount,
  resolveDeposit,
};
