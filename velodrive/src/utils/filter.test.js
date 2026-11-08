import { describe, expect, it } from 'vitest';
import { filterVehiclesByCategory } from './filter.js';

const vehicles = [
  { id: '1', name: 'Avanza', category: 'Mobil' },
  { id: '2', name: 'Pajero', category: 'SUV' },
  { id: '3', name: 'Brio', category: 'Mobil' },
];

describe('filterVehiclesByCategory', () => {
  it('menemukan kendaraan dengan kategori Mobil', () => {
    expect(filterVehiclesByCategory(vehicles, 'Mobil')).toHaveLength(2);
  });

  it('mengembalikan array kosong jika kategori tidak ditemukan', () => {
    expect(filterVehiclesByCategory(vehicles, 'Truk')).toEqual([]);
  });

  it('mengembalikan array kosong jika data kendaraan kosong', () => {
    expect(filterVehiclesByCategory([], 'Mobil')).toEqual([]);
  });

  it('mengembalikan array kosong jika kategori tidak diisi', () => {
    expect(filterVehiclesByCategory(vehicles, undefined)).toEqual([]);
  });
});
