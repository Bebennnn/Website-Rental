import { Car, LogOut } from 'lucide-react';

export default function StorefrontHeader({
  currentUser,
  userSubView,
  bookingCount,
  onHome,
  onBookings,
  onNavigateToAuth,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <button onClick={onHome} className="flex items-center gap-2.5 cursor-pointer text-left">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">VeloDrive</span>
            <span className="block text-[11px] font-medium text-zinc-500 -mt-1">
              Rental Mobil Indonesia
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
          <button
            onClick={onHome}
            className={`py-1 transition-colors ${
              userSubView === 'HOME'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-zinc-900'
            }`}
          >
            Beranda & Katalog
          </button>
          <a href="#katalog-mobil" onClick={onHome} className="hover:text-zinc-900 transition-colors">
            Armada Indonesia
          </a>
          <button
            onClick={onBookings}
            className={`py-1 flex items-center gap-1.5 transition-colors ${
              userSubView === 'MY_BOOKINGS'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-zinc-900'
            }`}
          >
            Pesanan Saya
            {bookingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-orange-600 text-white rounded-full">
                {bookingCount}
              </span>
            )}
          </button>
        </nav>

        {currentUser ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBookings}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none">
                  Halo, {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  {currentUser.verified ? 'KTP & SIM Terverifikasi' : 'Menunggu Verifikasi'}
                </p>
              </div>
            </button>
            <button
              onClick={onLogout}
              title="Keluar Akun"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-200 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigateToAuth(null)}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Masuk
          </button>
        )}
      </div>
    </header>
  );
}
