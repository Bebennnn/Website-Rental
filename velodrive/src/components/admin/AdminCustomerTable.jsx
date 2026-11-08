import React from 'react';

export default function AdminCustomerTable({ customers, bookings, onToggleVerify }) {
  return (
    <div className="overflow-x-auto"><table className="w-full text-left border-collapse">
      <thead><tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
        <th className="py-3.5 px-4">ID & Nama Penyewa</th><th className="py-3.5 px-4">Kontak & Domisili</th>
        <th className="py-3.5 px-4">Nomor NIK e-KTP</th><th className="py-3.5 px-4">Nomor SIM A</th>
        <th className="py-3.5 px-4">Riwayat Sewa</th><th className="py-3.5 px-4">Status Verifikasi</th>
      </tr></thead>
      <tbody className="divide-y divide-zinc-200 text-xs">{customers.map((cust) => {
        const count = bookings.filter((booking) => booking.userId === cust.id).length;
        return <tr key={cust.id} className="hover:bg-zinc-50">
          <td className="py-3.5 px-4"><span className="font-mono text-[11px] text-zinc-400 block">{cust.id}</span><span className="font-bold text-zinc-900">{cust.name}</span></td>
          <td className="py-3.5 px-4"><p className="text-zinc-800">{cust.email} • {cust.phone}</p><p className="text-zinc-500">{cust.address}</p></td>
          <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800">{cust.nik}</td><td className="py-3.5 px-4 font-mono font-semibold text-zinc-800">{cust.simA}</td>
          <td className="py-3.5 px-4 font-bold text-zinc-800">{count} Pesanan</td>
          <td className="py-3.5 px-4"><button onClick={() => onToggleVerify(cust.id, !cust.verified)} className={`px-3 py-1 rounded-full font-bold text-[11px] ${cust.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{cust.verified ? '✓ KTP & SIM Valid' : 'Belum Diverifikasi (Klik Validasi)'}</button></td>
        </tr>;
      })}</tbody>
    </table></div>
  );
}
