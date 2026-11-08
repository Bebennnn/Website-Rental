import React from 'react';
import { BadgeDollarSign, Car, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HeroSection({ currentUser, onViewBookings, onNavigateToAuth, featuredVehicle, onBookVehicle }) {
  return (
    <section className="bg-zinc-50 border-b border-zinc-200 pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sewa Mobil Harian & Jam-Jaman (6 Jam / 12 Jam / 24 Jam)
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Temukan Mobil Pilihan, <br />
              <span className="text-orange-600">Siap Jalan Kapan Saja</span>
            </h1>
            <p className="text-zinc-600 text-base leading-relaxed max-w-xl">
              Pilihan lengkap armada populer Indonesia mulai dari Avanza, Xpander, Brio, Innova
              Zenix, hingga Pajero Sport. Tersedia layanan Lepas Kunci maupun Dengan Supir.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#katalog-mobil" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Pilih & Sewa Mobil
              </a>
              <button
                onClick={() => (currentUser ? onViewBookings() : onNavigateToAuth(null))}
                className="bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                {currentUser ? 'Lihat Pesanan Saya' : 'Login Penyewa'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 max-w-lg">
              {[
                [Car, '150+ Armada', 'Tahun Muda & Bersih'],
                [ShieldCheck, 'Resmi & Aman', 'Terverifikasi Admin'],
                [BadgeDollarSign, 'Harga Jujur', 'Mulai Rp150rb / 6 Jam'],
              ].map(([Icon, title, description]) => (
                <div key={title} className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{title}</p>
                    <p className="text-xs text-zinc-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 shadow-lg">
              <img src="/images/mobil/innova.jpg" alt="Armada Unggulan VeloDrive" className="w-full h-80 sm:h-96 object-cover" />
              <div className="bg-white p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Unit Terpopuler Minggu Ini</span>
                  <h3 className="font-bold text-zinc-900 text-base">Toyota Kijang Innova Zenix Hybrid</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">Mulai dari</span>
                    <span className="text-lg font-extrabold text-orange-600">Rp 380.000</span>
                    <span className="text-xs text-zinc-500"> / 6 Jam</span>
                  </div>
                  <button onClick={() => onBookVehicle(featuredVehicle)} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg">
                    Sewa Unit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
