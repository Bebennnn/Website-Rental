import React from 'react';

export default function AdminFleetTable({
  vehicles,
  editingImageCarId,
  tempImageUrl,
  onImageUrlChange,
  onSaveImage,
  onEditImage,
  onUpdateStatus,
  formatIDR,
  getCategoryLabel,
  ImageIcon,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead><tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
          <th className="py-3.5 px-4">Foto & Nama Mobil</th><th className="py-3.5 px-4">Tipe & Cabang</th>
          <th className="py-3.5 px-4">Tarif 6J / 12J / 24J</th><th className="py-3.5 px-4">Status Unit</th>
          <th className="py-3.5 px-4 text-right">Ubah Foto</th>
        </tr></thead>
        <tbody className="divide-y divide-zinc-200 text-xs">
          {vehicles.map((car) => (
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
              <td className="py-3.5 px-4"><select value={car.status} onChange={(e) => onUpdateStatus(car.id, e.target.value)} className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold bg-white">
                <option value="AVAILABLE">TERSEDIA</option><option value="RENTED">DISEWA</option><option value="MAINTENANCE">PERAWATAN</option>
              </select></td>
              <td className="py-3.5 px-4 text-right"><button onClick={() => onEditImage(car)} className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"><ImageIcon className="w-3.5 h-3.5" />Ganti Foto</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
