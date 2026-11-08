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
  it('calculates the base rental price', () => {
    expect(calculateRentalPrice(100000, 6)).toBe(600000);
  });

  it('includes an optional service fee', () => {
    expect(calculateRentalPrice(100000, 6, 50000)).toBe(650000);
  });

  it('returns zero for negative values', () => {
    expect(calculateRentalPrice(100000, -1)).toBe(0);
    expect(calculateRentalPrice(-100000, 6)).toBe(0);
  });

  it('returns zero for non-numeric or non-finite values', () => {
    expect(calculateRentalPrice('100000', 6)).toBe(0);
    expect(calculateRentalPrice(100000, Number.NaN)).toBe(0);
    expect(calculateRentalPrice(100000, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('formats currency and dates for the Indonesian locale', () => {
    expect(formatIDR(100000)).toContain('100.000');
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
    expect(formatDateTime()).toBe('-');
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
      driverCost: 300000,
      deliveryCost: 50000,
      grandTotal: 1350000,
    });
    expect(calculateRentalQuote({ vehicle: null })).toBeNull();
  });

  it('resolves known and unknown vehicle categories', () => {
    expect(getCategoryLabel('MPV')).toBe('MPV Keluarga');
    expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});
