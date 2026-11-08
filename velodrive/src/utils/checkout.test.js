import { describe, expect, it } from 'vitest';
import { applyCheckoutAdjustments } from './checkout.js';

const baseQuote = {
  baseCost: 450000,
  driverCost: 0,
  deliveryCost: 50000,
  depositCost: 300000,
  grandTotal: 800000,
};

describe('applyCheckoutAdjustments', () => {
  it('mengembalikan null jika quote kosong', () => {
    expect(applyCheckoutAdjustments(null, { category: 'MPV' })).toBeNull();
  });

  it('tanpa kode promo: total sama dengan sebelumnya untuk mobil biasa', () => {
    const result = applyCheckoutAdjustments(baseQuote, { category: 'MPV', serviceId: 'SELF_DRIVE' });
    expect(result.discountAmount).toBe(0);
    expect(result.depositCost).toBe(300000);
    expect(result.grandTotal).toBe(800000);
  });

  it('kode promo valid memotong biaya sewa pokok saja', () => {
    const result = applyCheckoutAdjustments(baseQuote, {
      category: 'MPV',
      serviceId: 'SELF_DRIVE',
      promoCode: 'velo10',
    });
    expect(result.discountCode).toBe('VELO10');
    expect(result.discountAmount).toBe(45000);
    expect(result.grandTotal).toBe(755000);
  });

  it('mobil premium lepas kunci memakai deposit lebih tinggi', () => {
    const result = applyCheckoutAdjustments(baseQuote, { category: 'SUV', serviceId: 'SELF_DRIVE' });
    expect(result.depositCost).toBe(1000000);
    expect(result.grandTotal).toBe(1500000);
  });

  it('layanan dengan supir tidak memakai deposit', () => {
    const quote = { ...baseQuote, driverCost: 150000, depositCost: 0 };
    const result = applyCheckoutAdjustments(quote, { category: 'SUV', serviceId: 'WITH_DRIVER' });
    expect(result.depositCost).toBe(0);
    expect(result.grandTotal).toBe(650000);
  });

  it('kode promo salah menghasilkan promoError tanpa diskon', () => {
    const result = applyCheckoutAdjustments(baseQuote, {
      category: 'MPV',
      serviceId: 'SELF_DRIVE',
      promoCode: 'NGAWUR',
    });
    expect(result.promoError).toMatch(/Kode diskon tidak valid/);
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(800000);
  });

  it('kategori tidak dikenal memakai deposit bawaan quote', () => {
    const result = applyCheckoutAdjustments(baseQuote, { category: 'XYZ', serviceId: 'SELF_DRIVE' });
    expect(result.depositCost).toBe(300000);
  });
});
