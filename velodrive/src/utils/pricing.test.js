import { describe, expect, it } from 'vitest';
import {
  calculateRentalPrice,
  calculateRentalQuote,
  computeEndDateTime,
  formatDateTime,
  formatIDR,
  getCategoryLabel,
} from './pricing.js';

describe('calculateRentalPrice', () => {
  it('menghitung harga sewa standar dengan pajak 10%', () => {
    expect(calculateRentalPrice(100000, 3)).toBe(330000);
  });

  it('menghitung harga sewa untuk durasi satu hari', () => {
    expect(calculateRentalPrice(250000, 1)).toBe(275000);
  });

  it('mengembalikan nol untuk durasi nol atau negatif', () => {
    expect(calculateRentalPrice(100000, 0)).toBe(0);
    expect(calculateRentalPrice(100000, -1)).toBe(0);
  });

  it('mengembalikan nol untuk input bukan angka', () => {
    expect(calculateRentalPrice('100000', 2)).toBe(0);
    expect(calculateRentalPrice(null, 2)).toBe(0);
  });
});

describe('pricing helpers', () => {
  it('formats currency and dates', () => {
    expect(formatIDR(100000)).toContain('100.000');
    expect(formatDateTime()).toBe('-');
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
    expect(formatDateTime('2026-01-01T10:00:00.000Z')).toContain('2026');
  });

  it('calculates an end time and handles invalid input', () => {
    expect(computeEndDateTime('2026-01-01T10:00:00', 6)).toContain('16:00');
    expect(computeEndDateTime('invalid-date', 6)).toBe('');
  });

  it('calculates a complete rental quote', () => {
    const quote = calculateRentalQuote({
      vehicle: { rates: { PKG_6H: 500000 } },
      packageId: 'PKG_6H',
      multiplier: 2,
      serviceId: 'WITH_DRIVER',
      deliveryId: 'DELIVERY_ADDRESS',
    });

    expect(quote).toMatchObject({
      unitRate: 500000,
      baseCost: 1000000,
      totalHours: 12,
      grandTotal: 1350000,
    });
    expect(calculateRentalQuote({ vehicle: null })).toBeNull();
  });

  it('resolves known and unknown vehicle categories', () => {
    expect(getCategoryLabel('MPV')).toBe('MPV Keluarga');
    expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});
