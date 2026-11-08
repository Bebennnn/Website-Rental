import React from 'react';
import { Car } from 'lucide-react';

export default function BrowseSection({ brands, categories, selectedBrand, selectedCategory, onBrandChange, onCategoryChange }) {
  return <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14"><div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200 rounded-xl p-6"><h3 className="text-lg font-bold text-zinc-900">Cari Berdasarkan Merek</h3><p className="text-xs text-zinc-500 mt-1">Pabrikan mobil terpopuler di Indonesia</p><div className="grid grid-cols-3 gap-3 mt-5">
      {brands.map((brand) => { const active = selectedBrand === brand.name; return <button key={brand.name} onClick={() => onBrandChange(active ? 'ALL' : brand.name)} className={`p-3.5 rounded-lg border text-left transition-colors ${active ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-zinc-200 hover:border-orange-500 text-zinc-800'}`}><div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-900 font-extrabold text-xs flex items-center justify-center mb-2">{brand.name.slice(0, 2).toUpperCase()}</div><p className="font-bold text-sm">{brand.name}</p><p className={`text-[11px] ${active ? 'text-orange-100' : 'text-zinc-400'}`}>{brand.origin}</p></button>; })}
    </div></div>
    <div className="lg:col-span-6 bg-orange-600 rounded-xl p-6 text-white"><h3 className="text-lg font-bold">Cari Berdasarkan Tipe Mobil</h3><p className="text-xs text-orange-100 mt-1">Kategori kendaraan sesuai medan jalan & jumlah penumpang di Indonesia</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
      {categories.map((cat) => { const active = selectedCategory === cat.id; return <button key={cat.id} onClick={() => onCategoryChange(active ? 'ALL' : cat.id)} className={`p-3.5 rounded-lg border text-left transition-colors ${active ? 'bg-white text-orange-600 border-white' : 'bg-orange-700 border-orange-500 hover:bg-orange-800 text-white'}`}><Car className="w-5 h-5 mb-2" /><p className="font-bold text-sm leading-tight">{cat.name}</p><p className={`text-[11px] mt-0.5 ${active ? 'text-zinc-600' : 'text-orange-200'}`}>{cat.desc}</p></button>; })}
    </div></div>
  </div></section>;
}
