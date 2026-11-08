import { describe, expect, it } from 'vitest';
import { calculateDiscount, MAX_DISCOUNT_PERCENT } from './discount.js';

describe('Fitur 1: Hitung Diskon (calculateDiscount)', () => {
  it('menghitung diskon valid dari kode promo', () => {
    const result = calculateDiscount(1000000, 'VELO10');

    expect(result).toEqual({
      originalPrice: 1000000,
      percent: 10,
      discountAmount: 100000,
      finalPrice: 900000,
    });
  });

  it('menerima kode promo dengan huruf kecil dan spasi', () => {
    expect(calculateDiscount(200000, '  mahasiswa ').finalPrice).toBe(170000);
  });

  it('menghitung diskon valid dari persentase', () => {
    expect(calculateDiscount(500000, 20).finalPrice).toBe(400000);
  });

  it('diskon nol atau tanpa diskon tidak mengubah harga', () => {
    expect(calculateDiscount(500000, 0).finalPrice).toBe(500000);
    expect(calculateDiscount(500000).finalPrice).toBe(500000);
    expect(calculateDiscount(500000, null).discountAmount).toBe(0);
  });

  it('menerima diskon tepat di batas maksimal', () => {
    const result = calculateDiscount(100000, MAX_DISCOUNT_PERCENT);
    expect(result.finalPrice).toBe(70000);
  });

  it('membulatkan nominal diskon ke rupiah terdekat', () => {
    expect(calculateDiscount(333, 10).discountAmount).toBe(33);
  });

  it('melempar error jika kode diskon salah', () => {
    expect(() => calculateDiscount(500000, 'KODESALAH')).toThrow(/Kode diskon tidak valid/);
    expect(() => calculateDiscount(500000, '')).toThrow(/Kode diskon tidak valid/);
  });

  it('melempar error jika diskon terlalu besar atau negatif', () => {
    expect(() => calculateDiscount(500000, 31)).toThrow(/Persentase diskon/);
    expect(() => calculateDiscount(500000, 100)).toThrow(/Persentase diskon/);
    expect(() => calculateDiscount(500000, -5)).toThrow(/Persentase diskon/);
  });

  it('melempar error jika tipe diskon tidak valid', () => {
    expect(() => calculateDiscount(500000, Number.NaN)).toThrow(TypeError);
    expect(() => calculateDiscount(500000, {})).toThrow(TypeError);
  });

  it('melempar error jika harga tidak valid', () => {
    expect(() => calculateDiscount(-1, 10)).toThrow(/Harga tidak valid/);
    expect(() => calculateDiscount('500000', 10)).toThrow(TypeError);
    expect(() => calculateDiscount(Number.NaN, 10)).toThrow(TypeError);
  });
});
