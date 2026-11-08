import React, { useState } from 'react';
import { checkServiceSchedule } from '../../utils/vehicleManagement';

export default function AdminFleetTable({
  vehicles,
  editingImageCarId,
  tempImageUrl,
  onImageUrlChange,
  onSaveImage,
  onEditImage,
  onUpdateServiceSchedule,
  onUpdateStatus,
  formatIDR,
  getCategoryLabel,
  ImageIcon,
}) {
  const [editingServiceCarId, setEditingServiceCarId] = useState(null);
  const [serviceDraft, setServiceDraft] = useState({});
  const [serviceError, setServiceError] = useState('');

  const editServiceSchedule = (car) => {
    setEditingServiceCarId(car.id);
    setServiceDraft({
      currentKm: car.currentKm ?? '',
      nextServiceKm: car.nextServiceKm ?? '',
      nextServiceDate: car.nextServiceDate ?? '',
    });
    setServiceError('');
  };

  const saveServiceSchedule = async (carId) => {
    const currentKm = serviceDraft.currentKm === '' ? null : Number(serviceDraft.currentKm);
    const nextServiceKm = serviceDraft.nextServiceKm === '' ? null : Number(serviceDraft.nextServiceKm);
    const nextServiceDate = serviceDraft.nextServiceDate || null;

    if ((currentKm === null) !== (nextServiceKm === null)) {
      setServiceError('Isi kilometer saat ini dan batas kilometer servis secara berpasangan.');
      return;
    }

    try {
      await onUpdateServiceSchedule(carId, { currentKm, nextServiceKm, nextServiceDate });
      setEditingServiceCarId(null);
      setServiceError('');
    } catch (error) {
      setServiceError(error.message || 'Gagal menyimpan jadwal servis.');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead><tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
          <th className="py-3.5 px-4">Foto & Nama Mobil</th><th className="py-3.5 px-4">Tipe & Cabang</th>
          <th className="py-3.5 px-4">Tarif 6J / 12J / 24J</th><th className="py-3.5 px-4">Jadwal Servis</th><th className="py-3.5 px-4">Status Unit</th>
          <th className="py-3.5 px-4 text-right">Ubah Foto</th>
        </tr></thead>
        <tbody className="divide-y divide-zinc-200 text-xs">
          {vehicles.map((car) => {
            const schedule = checkServiceSchedule(car);
            const scheduleStyle = schedule.status === 'SUDAH_WAKTUNYA'
              ? 'bg-red-100 text-red-700'
              : schedule.status === 'BELUM_WAKTUNYA'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-zinc-100 text-zinc-600';
            const scheduleLabel = schedule.status === 'SUDAH_WAKTUNYA'
              ? 'Perlu diservis'
              : schedule.status === 'BELUM_WAKTUNYA'
                ? 'Belum waktunya'
                : 'Data servis belum tersedia';
            return (
              <tr key={car.id} className="hover:bg-zinc-50">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <img src={car.imageUrl} alt={car.name} className="w-16 h-11 rounded object-cover border border-zinc-200 shrink-0" />
                  <div><p className="font-bold text-zinc-900">{car.name}</p><p className="font-mono text-zinc-500">{car.plateNumber}</p></div>
                </div>
                {editingImageCarId === car.id && <div className="mt-2 flex items-center gap-2">
                  <input type="text" value={tempImageUrl} onChange={(e) => onImageUrlChange(e.target.value)}
                    placeholder="Masukkan tautan gambar mobil (misal: https://...)" className="flex-1 border border-zinc-300 rounded px-2.5 py-1 text-xs" />
                  <button onClick={() => onSaveImage(car.id)} className="bg-orange-600 text-white px-2.5 py-1 rounded font-semibold">Simpan</button>
                </div>}
              </td>
              <td className="py-3.5 px-4"><p className="font-semibold text-zinc-800">{getCategoryLabel(car.category)}</p><p className="text-zinc-500">{car.branchId} • {car.transmission}</p></td>
              <td className="py-3.5 px-4 font-mono">{formatIDR(car.rates.PKG_6H)} / {formatIDR(car.rates.PKG_12H)} / <strong className="text-orange-600">{formatIDR(car.rates.PKG_24H)}</strong></td>
              <td className="py-3.5 px-4">
                <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${scheduleStyle}`}>
                  {scheduleLabel}
                </span>
                <p className="mt-1 max-w-48 text-[11px] text-zinc-500">
                  {schedule.status === 'DATA_KOSONG'
                    ? 'Isi data kilometer atau tanggal servis untuk menghitung jadwal.'
                    : schedule.message}
                </p>
                {editingServiceCarId === car.id ? (
                  <div className="mt-2 min-w-48 space-y-1.5">
                    <label className="block text-[11px] text-zinc-600">
                      Kilometer saat ini
                      <input type="number" min="0" step="1" value={serviceDraft.currentKm}
                        onChange={(e) => setServiceDraft({ ...serviceDraft, currentKm: e.target.value })}
                        className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1" />
                    </label>
                    <label className="block text-[11px] text-zinc-600">
                      Servis berikutnya pada km
                      <input type="number" min="0" step="1" value={serviceDraft.nextServiceKm}
                        onChange={(e) => setServiceDraft({ ...serviceDraft, nextServiceKm: e.target.value })}
                        className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1" />
                    </label>
                    <label className="block text-[11px] text-zinc-600">
                      Atau tanggal servis
                      <input type="date" value={serviceDraft.nextServiceDate}
                        onChange={(e) => setServiceDraft({ ...serviceDraft, nextServiceDate: e.target.value })}
                        className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1" />
                    </label>
                    {serviceError && <p role="alert" className="text-[11px] text-red-600">{serviceError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => saveServiceSchedule(car.id)}
                        className="rounded bg-orange-600 px-2.5 py-1 text-[11px] font-semibold text-white">Simpan</button>
                      <button onClick={() => { setEditingServiceCarId(null); setServiceError(''); }}
                        className="rounded border border-zinc-300 px-2.5 py-1 text-[11px] font-semibold">Batal</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => editServiceSchedule(car)}
                    className="mt-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700">
                    Atur data servis
                  </button>
                )}
              </td>
              <td className="py-3.5 px-4"><select value={car.status} onChange={(e) => onUpdateStatus(car.id, e.target.value)} className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold bg-white">
                <option value="AVAILABLE">TERSEDIA</option><option value="RENTED">DISEWA</option><option value="MAINTENANCE">PERAWATAN</option>
              </select></td>
              <td className="py-3.5 px-4 text-right"><button onClick={() => onEditImage(car)} className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"><ImageIcon className="w-3.5 h-3.5" />Ganti Foto</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
