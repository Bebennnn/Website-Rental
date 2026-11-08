const { resolveDiscount, resolveDeposit } = require('../src/services/pricing.rules');
const bookingService = require('../src/services/booking.service');

describe('resolveDiscount', () => {
  it('tanpa kode berarti tidak ada diskon', () => {
    expect(resolveDiscount(500000)).toEqual({
      discountCode: null,
      discountPercent: 0,
      discountAmount: 0,
    });
    expect(resolveDiscount(500000, '')).toMatchObject({ discountAmount: 0 });
  });

  it('menghitung diskon dari kode yang valid (tidak peka huruf besar/kecil)', () => {
    expect(resolveDiscount(500000, ' velo10 ')).toEqual({
      discountCode: 'VELO10',
      discountPercent: 10,
      discountAmount: 50000,
    });
  });

  it('menolak kode yang tidak dikenal atau bukan teks', () => {
    expect(() => resolveDiscount(500000, 'NGAWUR')).toThrow('Kode diskon tidak valid.');
    expect(() => resolveDiscount(500000, 10)).toThrow('Kode diskon tidak valid.');
  });
});

describe('resolveDeposit', () => {
  it('lepas kunci mobil biasa memakai deposit standar', () => {
    expect(resolveDeposit('MPV', 'SELF_DRIVE')).toBe(300000);
    expect(resolveDeposit(undefined, 'SELF_DRIVE')).toBe(300000);
  });

  it('lepas kunci mobil premium memakai deposit lebih tinggi', () => {
    expect(resolveDeposit('SUV', 'SELF_DRIVE')).toBe(1000000);
    expect(resolveDeposit('ev', 'SELF_DRIVE')).toBe(1000000);
  });

  it('dengan supir tidak ada deposit', () => {
    expect(resolveDeposit('SUV', 'WITH_DRIVER')).toBe(0);
  });
});

describe('calculateServerQuote dengan diskon dan deposit kategori', () => {
  const rates = { PKG_24H: 450000 };

  it('menerapkan diskon pada biaya sewa saja', () => {
    const quote = bookingService.calculateServerQuote(
      { rates, category: 'MPV' },
      'PKG_24H',
      1,
      'SELF_DRIVE',
      'PICKUP_GARAGE',
      'VELO10'
    );

    expect(quote).toMatchObject({
      baseCost: 450000,
      discountCode: 'VELO10',
      discountAmount: 45000,
      depositCost: 300000,
      grandTotal: 705000,
    });
  });

  it('deposit mobil SUV lepas kunci Rp1.000.000', () => {
    const quote = bookingService.calculateServerQuote(
      { rates, category: 'SUV' },
      'PKG_24H',
      1,
      'SELF_DRIVE',
      'PICKUP_GARAGE'
    );

    expect(quote.depositCost).toBe(1000000);
    expect(quote.grandTotal).toBe(1450000);
  });

  it('menolak kode diskon tidak valid', () => {
    expect(() =>
      bookingService.calculateServerQuote(
        { rates },
        'PKG_24H',
        1,
        'SELF_DRIVE',
        'PICKUP_GARAGE',
        'NGAWUR'
      )
    ).toThrow('Kode diskon tidak valid.');
  });
});
