import React from 'react';
import { Search } from 'lucide-react';

export default function CatalogFilter({
  searchTab,
  onSearchTabChange,
  activePackageId,
  packages,
  onPackageChange,
  selectedBrand,
  onBrandChange,
  selectedCategory,
  onCategoryChange,
  selectedTransmission,
  onTransmissionChange,
  maxBudget,
  onBudgetChange,
  selectedBranch,
  onBranchChange,
  brands,
  categories,
  branches,
}) {
  const tabs = [
    { id: 'ALL', label: 'Cari Mobil' },
    { id: 'MPV', label: 'MPV Keluarga' },
    { id: 'SUV', label: 'SUV Tangguh' },
    { id: 'CITY_LCGC', label: 'City Car & LCGC' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-md p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-200">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => onSearchTabChange(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${searchTab === tab.id ? 'bg-orange-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Paket Durasi:</span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-100">
              {Object.values(packages).map((pkg) => (
                <button key={pkg.id} onClick={() => onPackageChange(pkg.id)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activePackageId === pkg.id ? 'bg-orange-600 text-white' : 'text-zinc-700 hover:text-zinc-900'}`}>
                  {pkg.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <FilterSelect label="Merek Mobil" value={selectedBrand} onChange={onBrandChange}>
            <option value="ALL">Semua Merek</option>
            {brands.map((brand) => <option key={brand.name} value={brand.name}>{brand.name}</option>)}
          </FilterSelect>
          <FilterSelect label="Tipe Mobil Indonesia" value={selectedCategory} onChange={onCategoryChange}>
            <option value="ALL">Semua Tipe</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </FilterSelect>
          <FilterSelect label="Transmisi" value={selectedTransmission} onChange={onTransmissionChange}>
            <option value="ALL">Semua Transmisi</option>
            <option value="AT">Automatic (Matic)</option>
            <option value="MT">Manual (MT)</option>
          </FilterSelect>
          <FilterSelect label={`Batas Harga (${packages[activePackageId].shortLabel})`} value={maxBudget} onChange={onBudgetChange}>
            <option value="ALL">Tanpa Batas</option>
            <option value="350000">Di bawah Rp 350.000</option>
            <option value="550000">Di bawah Rp 550.000</option>
            <option value="900000">Di bawah Rp 900.000</option>
          </FilterSelect>
          <FilterSelect label="Lokasi Cabang" value={selectedBranch} onChange={onBranchChange}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
          </FilterSelect>
          <a href="#katalog-mobil" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
            <Search className="w-4 h-4" />Cari Mobil
          </a>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600">
        {children}
      </select>
    </div>
  );
}
