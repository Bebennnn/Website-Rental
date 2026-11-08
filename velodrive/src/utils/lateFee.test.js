import { describe, expect, it } from 'vitest';
import { calculateLateFee, getLateHours, LATE_FEE_PER_HOUR } from './lateFee.js';

describe('Fitur 3: Hitung Denda (calculateLateFee)', () => {
  it('tidak terlambat berarti denda nol', () => {
    expect(calculateLateFee(0)).toBe(0);
  });

  it('terlambat 1 jam dikenakan satu kali tarif', () => {
    expect(calculateLateFee(1)).toBe(LATE_FEE_PER_HOUR);
  });

  it('terlambat beberapa jam dikalikan tarif per jam', () => {
    expect(calculateLateFee(5)).toBe(250000);
  });

  it('keterlambatan sebagian jam dibulatkan ke atas', () => {
    expect(calculateLateFee(0.5)).toBe(50000);
    expect(calculateLateFee(2.1)).toBe(150000);
  });

  it('mendukung tarif denda kustom', () => {
    expect(calculateLateFee(3, 20000)).toBe(60000);
  });

  it('melempar error jika durasi negatif', () => {
    expect(() => calculateLateFee(-2)).toThrow(/tidak boleh negatif/);
  });

  it('melempar error jika durasi bukan angka valid', () => {
    expect(() => calculateLateFee('3')).toThrow(TypeError);
    expect(() => calculateLateFee(Number.NaN)).toThrow(TypeError);
    expect(() => calculateLateFee(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it('melempar error jika tarif tidak valid', () => {
    expect(() => calculateLateFee(2, 0)).toThrow(/Tarif denda/);
    expect(() => calculateLateFee(2, -100)).toThrow(/Tarif denda/);
  });
});

describe('getLateHours (pendukung hitung denda)', () => {
  it('mengembalikan 0 jika dikembalikan tepat waktu atau lebih awal', () => {
    expect(getLateHours('2026-01-01T09:00', '2026-01-01T09:00')).toBe(0);
    expect(getLateHours('2026-01-01T09:00', '2026-01-01T07:30')).toBe(0);
  });

  it('menghitung jam keterlambatan dari waktu aktual', () => {
    expect(getLateHours('2026-01-01T09:00', '2026-01-01T12:00')).toBe(3);
    expect(getLateHours('2026-01-01T09:00', '2026-01-01T09:30')).toBe(0.5);
  });

  it('terhubung dengan calculateLateFee', () => {
    const late = getLateHours('2026-01-01T09:00', '2026-01-01T11:20');
    expect(calculateLateFee(late)).toBe(150000);
  });

  it('melempar error jika format tanggal tidak valid', () => {
    expect(() => getLateHours('invalid', '2026-01-01T09:00')).toThrow(/Format tanggal/);
  });
});
