import React from 'react';
import { Fuel, Heart, MapPin, Settings, Users } from 'lucide-react';

export default function VehicleCard({
  vehicle,
  activePrice,
  packageLabel,
  categoryLabel,
  branchName,
  isAvailable,
  isFavorite,
  onToggleFavorite,
  onBook,
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col hover:border-orange-500 transition-colors">
      <div className="relative h-44 bg-zinc-100 overflow-hidden">
        <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-zinc-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">{categoryLabel}</span>
        <button
          onClick={() => onToggleFavorite(vehicle.id)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
            isFavorite ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:text-orange-600'
          }`}
        >
          <Heart className="w-4 h-4" />
        </button>
        {!isAvailable && (
          <div className="absolute inset-0 bg-zinc-900/70 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md">SEDANG DISEWA</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>{vehicle.year} • {vehicle.brand}</span>
            <span className="font-mono">{vehicle.plateNumber}</span>
          </div>
          <h3 className="font-bold text-zinc-900 text-base line-clamp-1">{vehicle.name}</h3>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-orange-600">{activePrice}</span>
            <span className="text-xs text-zinc-500">/ {packageLabel}</span>
          </div>
        </div>
        <div className="space-y-2.5 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
          <div className="grid grid-cols-3 gap-1">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-zinc-400" />{vehicle.seats} Kursi</span>
            <span className="flex items-center gap-1"><Settings className="w-3.5 h-3.5 text-zinc-400" />{vehicle.transmission === 'AT' ? 'Matic' : 'Manual'}</span>
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-zinc-400" />{vehicle.fuel}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-zinc-500"><MapPin className="w-3.5 h-3.5 text-orange-600" />{branchName}</span>
            <button disabled={!isAvailable} onClick={() => onBook(vehicle)} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${isAvailable ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'}`}>
              {isAvailable ? 'Sewa Sekarang' : 'Tidak Tersedia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
