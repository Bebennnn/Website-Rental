import React from 'react';
import { ArrowRight, X } from 'lucide-react';

export default function CheckoutModal({
  vehicle, quote, user, step, packages, services, deliveryModes, activePackageId, activeServiceId,
  multiplier, deliveryId, startDateTime, pickupHub, rentalPurpose, estimatedEndDateTime, formError,
  onClose, onSubmit, onPackageChange, onServiceChange, onMultiplierChange, onStartChange,
  onDeliveryChange, onPickupChange, onPurposeChange, onStepChange, formatIDR, formatDateTime,
}) {
  if (!vehicle || !quote || !user) return null;
  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-zinc-200 max-w-2xl w-full overflow-hidden shadow-xl my-8">
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between"><div><span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Formulir Pemesanan Mobil — Langkah {step} dari 2</span><h3 className="font-bold text-lg">{vehicle.name}</h3></div><button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {step === 1 ? <><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-zinc-700 mb-1.5">Paket Durasi</label><div className="grid grid-cols-3 gap-2">{Object.values(packages).map((pkg) => <button type="button" key={pkg.id} onClick={() => onPackageChange(pkg.id)} className={`py-2 px-2 rounded-lg text-xs font-bold border ${activePackageId === pkg.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-zinc-700 border-zinc-300'}`}>{pkg.shortLabel}</button>)}</div></div>
            <div><label className="block text-xs font-bold text-zinc-700 mb-1.5">Tipe Layanan</label><div className="grid grid-cols-2 gap-2">{Object.values(services).map((srv) => <button type="button" key={srv.id} onClick={() => onServiceChange(srv.id)} className={`py-2 px-2 rounded-lg text-xs font-bold border ${activeServiceId === srv.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-zinc-700 border-zinc-300'}`}>{srv.label}</button>)}</div></div>
          </div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Kelipatan Paket"><input type="number" min={1} max={14} value={multiplier} onChange={(e) => onMultiplierChange(Number(e.target.value))} className="field" /></Field>
            <Field label="Waktu Mulai Ambil"><input type="datetime-local" value={startDateTime} onChange={(e) => onStartChange(e.target.value)} className="field" /></Field>
            <Field label={`Waktu Selesai (${quote.totalHours} Jam)`}><input type="text" readOnly value={formatDateTime(estimatedEndDateTime)} className="field bg-zinc-100 text-zinc-600" /></Field>
          </div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Metode Serah Terima Unit"><select value={deliveryId} onChange={(e) => onDeliveryChange(e.target.value)} className="field bg-white">{Object.values(deliveryModes).map((mode) => <option key={mode.id} value={mode.id}>{mode.label} ({mode.fee === 0 ? 'Gratis' : formatIDR(mode.fee)})</option>)}</select></Field>
            <Field label="Titik Garasi / Lokasi Pengantaran"><input type="text" value={pickupHub} onChange={(e) => onPickupChange(e.target.value)} className="field" /></Field>
          </div></> : <><div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 text-xs"><div className="flex items-center justify-between"><span className="font-bold text-zinc-900">Data Penyewa Terhubung (Otomatis dari Akun Anda)</span><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Terautentikasi</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-200 text-zinc-700"><p><strong>Nama:</strong> {user.name}</p><p><strong>WhatsApp:</strong> {user.phone}</p><p><strong>NIK e-KTP:</strong> {user.nik}</p><p><strong>No. SIM A:</strong> {user.simA}</p></div></div><Field label="Tujuan Penggunaan Mobil (Diperiksa oleh Admin)"><input type="text" value={rentalPurpose} onChange={(e) => onPurposeChange(e.target.value)} placeholder="Contoh: Perjalanan Dinas / Wisata Keluarga Bandung" className="field" /></Field></>}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-1.5 text-xs"><Line label={`Sewa Pokok (${quote.packageLabel} x ${multiplier})`} value={formatIDR(quote.baseCost)} />{quote.driverCost > 0 && <Line label="Jasa Supir Profesional" value={formatIDR(quote.driverCost)} />}{quote.deliveryCost > 0 && <Line label="Biaya Antar Unit" value={formatIDR(quote.deliveryCost)} />}{quote.depositCost > 0 && <Line label="Deposit Jaminan Lepas Kunci (Refundable)" value={formatIDR(quote.depositCost)} />}<div className="border-t border-zinc-200 pt-2 flex justify-between items-center text-sm font-extrabold text-zinc-900"><span>Total Pembayaran</span><span className="text-orange-600 text-base">{formatIDR(quote.grandTotal)}</span></div></div>
          {formError && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex items-center justify-end gap-3 pt-2">{step === 2 && <button type="button" onClick={() => onStepChange(1)} className="px-4 py-2.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700">Kembali ke Jadwal</button>}{step === 1 ? <button type="button" onClick={() => onStepChange(2)} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-1.5">Lanjut Verifikasi Data<ArrowRight className="w-4 h-4" /></button> : <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg">Konfirmasi & Terbitkan E-Tiket</button>}</div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) { return <div><label className="block text-xs font-semibold text-zinc-700 mb-1">{label}</label>{children}</div>; }
function Line({ label, value }) { return <div className="flex justify-between text-zinc-600"><span>{label}</span><span className="font-semibold text-zinc-900">{value}</span></div>; }
