import { describe, expect, it } from 'vitest';
import {
  VEHICLE_STATUS,
  updateVehicleStatus,
  checkServiceSchedule,
} from './vehicleManagement.js';

describe('Fitur 1: Ubah Status Mobil (updateVehicleStatus)', () => {
  const dummyCar = {
    id: 'ID-01',
    name: 'Toyota Avanza',
    plateNumber: 'D 1421 VLD',
    status: VEHICLE_STATUS.AVAILABLE,
  };

  it('mengubah status mobil menjadi status tersedia (AVAILABLE)', () => {
    const rentedCar = { ...dummyCar, status: VEHICLE_STATUS.RENTED };
    const updated = updateVehicleStatus(rentedCar, 'AVAILABLE');

    expect(updated.status).toBe(VEHICLE_STATUS.AVAILABLE);
    expect(updated.id).toBe(dummyCar.id);
    expect(updated.updatedAt).toBeDefined();
  });

  it('mengubah status mobil menjadi status disewa (RENTED)', () => {
    const updated = updateVehicleStatus(dummyCar, 'RENTED');

    expect(updated.status).toBe(VEHICLE_STATUS.RENTED);
  });

  it('mengubah status mobil menjadi status servis/perawatan (MAINTENANCE)', () => {
    const updated = updateVehicleStatus(dummyCar, 'MAINTENANCE');

    expect(updated.status).toBe(VEHICLE_STATUS.MAINTENANCE);
  });

  it('menerima alias status dalam bahasa Indonesia (tersedia, disewa, servis, perawatan)', () => {
    expect(updateVehicleStatus(dummyCar, 'tersedia').status).toBe(VEHICLE_STATUS.AVAILABLE);
    expect(updateVehicleStatus(dummyCar, 'disewa').status).toBe(VEHICLE_STATUS.RENTED);
    expect(updateVehicleStatus(dummyCar, 'servis').status).toBe(VEHICLE_STATUS.MAINTENANCE);
    expect(updateVehicleStatus(dummyCar, 'perawatan').status).toBe(VEHICLE_STATUS.MAINTENANCE);
  });

  it('melempar error jika status yang dimasukkan salah / tidak dikenal', () => {
    expect(() => updateVehicleStatus(dummyCar, 'STATUS_SALAH')).toThrow(
      /Status tidak dikenal/
    );
    expect(() => updateVehicleStatus(dummyCar, 'RUSAK_TOTAL')).toThrow(
      /Status tidak dikenal/
    );
  });

  it('melempar error jika data kendaraan null, undefined, atau bukan objek', () => {
    expect(() => updateVehicleStatus(null, 'AVAILABLE')).toThrow(TypeError);
    expect(() => updateVehicleStatus(undefined, 'AVAILABLE')).toThrow(TypeError);
    expect(() => updateVehicleStatus('bukan-objek', 'AVAILABLE')).toThrow(TypeError);
  });

  it('melempar error jika nilai status baru kosong atau bukan string', () => {
    expect(() => updateVehicleStatus(dummyCar, '')).toThrow(/Status baru harus berupa teks/);
    expect(() => updateVehicleStatus(dummyCar, '   ')).toThrow(/Status baru harus berupa teks/);
    expect(() => updateVehicleStatus(dummyCar, 123)).toThrow(/Status baru harus berupa teks/);
  });
});

describe('Fitur 2: Cek Jadwal Servis Mobil (checkServiceSchedule)', () => {
  it('mengembalikan BELUM_WAKTUNYA jika km saat ini masih di bawah batas servis', () => {
    const car = { id: 'ID-01', currentKm: 5000, nextServiceKm: 10000 };
    const result = checkServiceSchedule(car);

    expect(result.isDue).toBe(false);
    expect(result.status).toBe('BELUM_WAKTUNYA');
    expect(result.remainingKm).toBe(5000);
    expect(result.message).toContain('belum waktunya diservis');
  });

  it('mengembalikan BELUM_WAKTUNYA jika tanggal servis masih di masa mendatang', () => {
    const fixedToday = new Date('2026-01-01T00:00:00Z');
    const car = { id: 'ID-02', serviceDueDate: '2026-06-01T00:00:00Z' };
    const result = checkServiceSchedule(car, fixedToday);

    expect(result.isDue).toBe(false);
    expect(result.status).toBe('BELUM_WAKTUNYA');
  });

  it('mengembalikan SUDAH_WAKTUNYA jika km sudah melampaui batas servis', () => {
    const car = { id: 'ID-03', currentKm: 10500, nextServiceKm: 10000 };
    const result = checkServiceSchedule(car);

    expect(result.isDue).toBe(true);
    expect(result.status).toBe('SUDAH_WAKTUNYA');
    expect(result.kmDiff).toBe(500);
    expect(result.message).toContain('sudah waktunya diservis');
  });

  it('mengembalikan SUDAH_WAKTUNYA jika tanggal jatuh tempo servis telah terlewati', () => {
    const fixedToday = new Date('2026-06-15T00:00:00Z');
    const car = { id: 'ID-04', serviceInfo: { nextServiceDate: '2026-06-01T00:00:00Z' } };
    const result = checkServiceSchedule(car, fixedToday);

    expect(result.isDue).toBe(true);
    expect(result.status).toBe('SUDAH_WAKTUNYA');
  });

  it('mengembalikan DATA_KOSONG jika data servis tidak tersedia', () => {
    const car = { id: 'ID-05', name: 'Honda Brio' };
    const result = checkServiceSchedule(car);

    expect(result.isDue).toBe(false);
    expect(result.status).toBe('DATA_KOSONG');
    expect(result.message).toContain('Data servis kosong');
  });

  it('mengembalikan DATA_KOSONG jika argumen kendaraan null atau bukan objek', () => {
    expect(checkServiceSchedule(null).status).toBe('DATA_KOSONG');
    expect(checkServiceSchedule(undefined).status).toBe('DATA_KOSONG');
  });

  it('mengembalikan DATA_KOSONG jika nilai kilometer negatif', () => {
    const car = { currentKm: -500, nextServiceKm: 10000 };
    const result = checkServiceSchedule(car);

    expect(result.isDue).toBe(false);
    expect(result.status).toBe('DATA_KOSONG');
    expect(result.message).toContain('tidak boleh negatif');
  });
});
