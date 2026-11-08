import { describe, expect, it } from 'vitest';
import {
  VEHICLE_STATUS,
  updateVehicleStatus,
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
