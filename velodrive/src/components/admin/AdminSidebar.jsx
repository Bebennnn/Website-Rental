import { BarChart3, Car, FileText, LogOut, Users } from 'lucide-react';

export default function AdminSidebar({ activeTab, pendingCount, onTabChange, onLogout }) {
  const tabs = [
    { id: 'OVERVIEW', label: 'Ringkasan & Statistik', icon: BarChart3 },
    { id: 'BOOKINGS', label: 'Data Pesanan & Verifikasi', icon: FileText },
    { id: 'FLEET', label: 'Data Armada & Foto Unit', icon: Car },
    { id: 'CUSTOMERS', label: 'Data Pelanggan (KTP/SIM)', icon: Users },
  ];

  return (
    <aside className="w-full lg:w-64 bg-zinc-900 text-white shrink-0 flex flex-col justify-between p-5">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base leading-none">VeloDrive Admin</p>
            <p className="text-[11px] text-zinc-400 mt-1">Panel Operasional</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {id === 'BOOKINGS' && pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-zinc-900">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-zinc-800 text-xs text-zinc-400">
        <p className="font-semibold text-sm text-zinc-200">Petugas Shift Aktif:</p>
        <p className="mt-1 text-sm">Admin Operasional Pusat</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 w-full inline-flex items-center justify-center border border-zinc-500 text-zinc-100 hover:border-orange-400 hover:bg-orange-600 hover:text-white px-4 py-3 rounded-lg text-base font-semibold transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
