import { describe, expect, it } from 'vitest';
import { calculateTotalRevenue } from './dashboard.js';

describe('calculateTotalRevenue', () => {
  it('menjumlahkan tiga transaksi dengan akurat', () => {
    expect(
      calculateTotalRevenue([
        { totalBayar: 100000 },
        { totalBayar: 250000 },
        { totalBayar: 150000 },
      ])
    ).toBe(500000);
  });

  it('menghitung satu transaksi', () => {
    expect(calculateTotalRevenue([{ totalBayar: 300000 }])).toBe(300000);
  });

  it('mengembalikan nol untuk array transaksi kosong', () => {
    expect(calculateTotalRevenue([])).toBe(0);
  });

  it('mengembalikan nol jika input bukan array', () => {
    expect(calculateTotalRevenue(null)).toBe(0);
  });

  it('mengabaikan transaksi tanpa totalBayar', () => {
    expect(
      calculateTotalRevenue([{ id: '1' }, { totalBayar: 200000 }, { totalBayar: undefined }])
    ).toBe(200000);
  });
});
