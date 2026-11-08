import React from 'react';
import { FileText, Lock } from 'lucide-react';

export default function BookingHistory({ currentUser, bookings, onLogin, onBrowse, serviceTypes, formatDateTime, formatIDR }) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div><h1 className="text-2xl font-bold text-zinc-900">Pesanan & E-Tiket Saya</h1><p className="text-sm text-zinc-500 mt-0.5">Pantau status verifikasi KTP/SIM oleh Admin dan jadwal pengambilan mobil Anda.</p></div>
        <button onClick={onBrowse} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg self-start">+ Sewa Mobil Lainnya</button>
      </div>
      {!currentUser ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 text-center space-y-4">
          <Lock className="w-8 h-8 text-orange-600 mx-auto" /><div><h3 className="font-bold text-zinc-900 text-base">Anda Belum Masuk ke Akun Penyewa</h3><p className="text-xs text-zinc-500 mt-1">Silakan login terlebih dahulu untuk melihat daftar E-Tiket dan status verifikasi pesanan Anda.</p></div>
          <button onClick={onLogin} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg">Masuk ke Akun Penyewa</button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 text-center space-y-3">
          <FileText className="w-8 h-8 text-zinc-400 mx-auto" /><p className="font-bold text-zinc-800">Belum Ada Riwayat Pesanan</p>
          <button onClick={onBrowse} className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">Pilih Mobil Sekarang</button>
        </div>
      ) : <div className="space-y-4">{bookings.map((bk) => (
        <div key={bk.id} className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5"><span className="font-mono font-bold text-sm px-3 py-1 rounded bg-zinc-900 text-white">{bk.code}</span><span className="text-xs text-zinc-500">Dibuat: {bk.createdAt}</span></div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${bk.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : bk.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' : bk.status === 'ON_TRIP' ? 'bg-orange-100 text-orange-800' : 'bg-zinc-100 text-zinc-700'}`}>
              {bk.status === 'PENDING_VERIFICATION' && 'Menunggu Verifikasi Admin'}{bk.status === 'CONFIRMED' && 'Disetujui Admin (Siap Diambil)'}{bk.status === 'ON_TRIP' && 'Sedang Disewa'}{bk.status === 'COMPLETED' && 'Selesai Dikembalikan'}{bk.status === 'CANCELLED' && 'Dibatalkan'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-zinc-500">Armada & Plat Nomor</p><p className="font-bold text-zinc-900 mt-0.5">{bk.vehicleName}</p><p className="text-xs font-mono text-zinc-600 mt-0.5">{bk.plateNumber} • {serviceTypes[bk.serviceId]?.label}</p></div>
            <div><p className="text-xs text-zinc-500">Jadwal Sewa ({bk.totalHours} Jam)</p><p className="font-semibold text-zinc-800 text-xs mt-0.5">Mulai: {formatDateTime(bk.startDateTime)}</p><p className="font-semibold text-zinc-800 text-xs mt-0.5">Kembali: {formatDateTime(bk.endDateTime)}</p></div>
            <div className="md:text-right"><p className="text-xs text-zinc-500">Total Pembayaran</p><p className="text-lg font-extrabold text-orange-600 mt-0.5">{formatIDR(bk.grandTotal)}</p><p className="text-[11px] text-zinc-500">{bk.pickupHub}</p></div>
          </div>
        </div>
      ))}</div>}
    </main>
  );
}
