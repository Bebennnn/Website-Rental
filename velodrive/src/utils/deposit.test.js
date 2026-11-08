import { describe, expect, it } from 'vitest';
import {
  calculateDeposit,
  PREMIUM_SELF_DRIVE_DEPOSIT,
} from './deposit.js';

describe('Fitur 2: Hitung Deposit (calculateDeposit)', () => {
  it('mobil biasa lepas kunci memakai deposit standar', () => {
    expect(calculateDeposit('MPV')).toBe(300000);
    expect(calculateDeposit('CITY_LCGC', 'SELF_DRIVE')).toBe(300000);
  });

  it('mobil premium (SUV dan EV) memakai deposit lebih tinggi', () => {
    expect(calculateDeposit('SUV')).toBe(PREMIUM_SELF_DRIVE_DEPOSIT);
    expect(calculateDeposit('EV', 'SELF_DRIVE')).toBe(PREMIUM_SELF_DRIVE_DEPOSIT);
  });

  it('layanan dengan supir tidak memerlukan deposit', () => {
    expect(calculateDeposit('MPV', 'WITH_DRIVER')).toBe(0);
    expect(calculateDeposit('SUV', 'WITH_DRIVER')).toBe(0);
  });

  it('kategori tidak sensitif terhadap huruf besar/kecil dan spasi', () => {
    expect(calculateDeposit('  suv ')).toBe(PREMIUM_SELF_DRIVE_DEPOSIT);
    expect(calculateDeposit('mpv')).toBe(300000);
  });

  it('melempar error jika input kosong', () => {
    expect(() => calculateDeposit('')).toThrow(/Kategori mobil wajib diisi/);
    expect(() => calculateDeposit('   ')).toThrow(/Kategori mobil wajib diisi/);
    expect(() => calculateDeposit()).toThrow(/Kategori mobil wajib diisi/);
    expect(() => calculateDeposit(null)).toThrow(/Kategori mobil wajib diisi/);
  });

  it('melempar error jika kategori tidak dikenal', () => {
    expect(() => calculateDeposit('SPORT')).toThrow(/Kategori mobil tidak dikenal/);
  });

  it('melempar error jika jenis layanan tidak dikenal', () => {
    expect(() => calculateDeposit('MPV', 'TANPA_LAYANAN')).toThrow(/Jenis layanan tidak dikenal/);
  });
});
