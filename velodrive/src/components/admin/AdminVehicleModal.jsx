import React from 'react';

export default function AdminVehicleModal({ open, car, onChange, onClose, onSubmit, brands, categories, CloseIcon }) {
  if (!open) return null;
  const field = (key) => ({ value: car[key], onChange: (e) => onChange({ ...car, [key]: e.target.value }) });
  return <div className="fixed inset-0 z-50 bg-zinc-900/60 flex items-center justify-center p-4 overflow-y-auto"><div className="bg-white rounded-xl border border-zinc-200 max-w-lg w-full overflow-hidden shadow-xl">
    <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between"><h3 className="font-bold text-base">Tambah Armada Mobil Indonesia</h3><button onClick={onClose} className="text-zinc-400 hover:text-white"><CloseIcon className="w-5 h-5" /></button></div>
    <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3"><label className="block font-semibold text-zinc-700">Merek<select {...field('brand')} className="w-full rounded-lg border border-zinc-300 px-3 py-2">{brands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}</select></label>
      <label className="block font-semibold text-zinc-700">Tipe Mobil<select {...field('category')} className="w-full rounded-lg border border-zinc-300 px-3 py-2">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <div className="grid grid-cols-2 gap-3"><label className="block font-semibold text-zinc-700">Nama Lengkap Unit<input required {...field('name')} placeholder="Daihatsu Sigra 1.2 R" className="w-full rounded-lg border border-zinc-300 px-3 py-2" /></label><label className="block font-semibold text-zinc-700">Plat Nomor<input required {...field('plateNumber')} placeholder="D 1928 VLD" className="w-full rounded-lg border border-zinc-300 px-3 py-2" /></label></div>
      <label className="block font-semibold text-zinc-700">URL Gambar Mobil<input {...field('imageUrl')} placeholder="Masukkan tautan gambar mobil (misal: https://...)" className="w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
      <div className="grid grid-cols-3 gap-3">{[['rate6h','Tarif 6 Jam'],['rate12h','Tarif 12 Jam'],['rate24h','Tarif 24 Jam']].map(([key,label]) => <label key={key} className="block font-semibold text-zinc-700">{label}<input type="number" {...field(key)} className="w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>)}</div>
      <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-zinc-300 font-semibold">Batal</button><button type="submit" className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold">Simpan Armada</button></div>
    </form>
  </div></div>;
}
