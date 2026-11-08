import React from 'react';

export default function AdminBookingTable({
  bookings,
  statusFilter,
  onStatusFilterChange,
  onInspect,
  serviceTypes,
  translateStatus,
  formatDateTime,
  formatIDR,
  EyeIcon,
}) {
  const statuses = [
    { id: 'ALL', label: translateStatus('ALL') },
    { id: 'PENDING_VERIFICATION', label: translateStatus('PENDING_VERIFICATION') },
    { id: 'CONFIRMED', label: translateStatus('CONFIRMED') },
    { id: 'ON_TRIP', label: translateStatus('ON_TRIP') },
    { id: 'COMPLETED', label: translateStatus('COMPLETED') },
    { id: 'CANCELLED', label: translateStatus('CANCELLED') },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="p-5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            Data Pesanan Masuk & Pemeriksaan Dokumen
          </h2>
          <p className="text-xs text-zinc-500">
            Klik tombol <strong>Cek Data & Verifikasi</strong> untuk memeriksa NIK KTP, SIM A,
            tujuan sewa, dan rincian biaya.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={() => onStatusFilterChange(status.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === status.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
              <th className="py-3.5 px-4">Kode & Waktu</th>
              <th className="py-3.5 px-4">Penyewa (NIK & SIM A)</th>
              <th className="py-3.5 px-4">Unit Mobil</th>
              <th className="py-3.5 px-4">Durasi & Jadwal</th>
              <th className="py-3.5 px-4">Pembayaran</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-xs">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-zinc-50">
                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-zinc-900 block">{booking.code}</span>
                  <span className="text-[11px] text-zinc-400">{booking.createdAt}</span>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-zinc-900">{booking.customerName}</p>
                  <p className="text-zinc-500">WA: {booking.customerPhone}</p>
                  <p className="font-mono text-[11px] text-zinc-500">NIK: {booking.customerNik}</p>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-zinc-900">{booking.vehicleName}</p>
                  <p className="font-mono text-zinc-500">
                    {booking.plateNumber} • {serviceTypes[booking.serviceId]?.label}
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-zinc-800">{booking.totalHours} Jam</p>
                  <p className="text-zinc-500">{formatDateTime(booking.startDateTime)}</p>
                </td>
                <td className="py-3.5 px-4 text-xs"><p className="font-bold text-orange-600">{formatIDR(booking.grandTotal)}</p><p className="text-zinc-600">{booking.paymentStatus || 'UNPAID'}</p><p className="text-zinc-500">Dibayar: {formatIDR(booking.paidAmount || 0)}</p></td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    booking.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-100 text-amber-800'
                      : booking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : booking.status === 'ON_TRIP'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {translateStatus(booking.status)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onInspect(booking)}
                    className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-orange-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    Cek Data & Verifikasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
