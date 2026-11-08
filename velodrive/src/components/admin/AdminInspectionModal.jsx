import { useState } from 'react';

function PaymentEditor({ inspectedBooking, onPaymentChange, formatIDR }) {
  const [paidAmount, setPaidAmount] = useState(
    String(inspectedBooking.paidAmount || 0)
  );
  const [paymentError, setPaymentError] = useState('');

  const savePayment = async () => {
    try {
      await onPaymentChange(inspectedBooking.code, Number(paidAmount));
      setPaymentError('');
    } catch (error) {
      setPaymentError(error.message || 'Gagal memperbarui pembayaran.');
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <span>Sudah Dibayar</span>
        <strong>{formatIDR(inspectedBooking.paidAmount || 0)}</strong>
      </div>
      <div className="flex justify-between">
        <span>Sisa Tagihan</span>
        <strong>
          {formatIDR(
            inspectedBooking.remainingAmount ??
            (inspectedBooking.grandTotal - (inspectedBooking.paidAmount || 0))
          )}
        </strong>
      </div>
      <div className="flex justify-between">
        <span>Status Pembayaran</span>
        <strong>{inspectedBooking.paymentStatus || 'UNPAID'}</strong>
      </div>
      <div className="pt-3 border-t border-zinc-200 flex flex-wrap gap-2 items-end">
        <label className="text-xs font-semibold flex-1 min-w-40">
          Perbarui total pembayaran diterima
          <input
            type="number"
            min="0"
            max={inspectedBooking.grandTotal}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={savePayment}
          className="bg-zinc-900 text-white rounded-lg px-3 py-2 font-semibold"
        >
          Simpan Pembayaran
        </button>
      </div>
      {paymentError && <p className="text-red-600">{paymentError}</p>}
    </>
  );
}

export default function AdminInspectionModal({
  inspectedBooking,
  onClose,
  onStatusChange,
  onPaymentChange,
  serviceTypes,
  formatDateTime,
  formatIDR,
  CloseIcon,
}) {
  if (!inspectedBooking) return null;

  const statusButton = (status, className, activeClass, label) => (
    <button
      onClick={() => onStatusChange(inspectedBooking.code, status)}
      className={`px-3.5 py-2 rounded-lg font-bold ${
        inspectedBooking.status === status ? activeClass : className
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-zinc-200 max-w-2xl w-full overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Lembar Pemeriksaan Data Pesanan (Admin)
            </span>
            <h3 className="font-bold text-lg">
              {inspectedBooking.code} — {inspectedBooking.customerName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="space-y-1.5">
              <p className="font-bold text-zinc-900 uppercase text-[11px]">1. Identitas & Dokumen Penyewa</p>
              <p><strong>Nama Lengkap:</strong> {inspectedBooking.customerName}</p>
              <p><strong>Email:</strong> {inspectedBooking.customerEmail}</p>
              <p><strong>No. WhatsApp:</strong> {inspectedBooking.customerPhone}</p>
              <p className="font-mono"><strong>NIK e-KTP:</strong> {inspectedBooking.customerNik}</p>
              <p className="font-mono"><strong>No. SIM A:</strong> {inspectedBooking.customerSim}</p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-zinc-900 uppercase text-[11px]">2. Unit & Jadwal Pemakaian</p>
              <p><strong>Unit Armada:</strong> {inspectedBooking.vehicleName}</p>
              <p><strong>Plat Nomor:</strong> {inspectedBooking.plateNumber}</p>
              <p><strong>Layanan:</strong> {serviceTypes[inspectedBooking.serviceId]?.label}</p>
              <p><strong>Waktu Ambil:</strong> {formatDateTime(inspectedBooking.startDateTime)}</p>
              <p><strong>Waktu Kembali:</strong> {formatDateTime(inspectedBooking.endDateTime)}</p>
            </div>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1.5">
            <p className="font-bold text-zinc-900 uppercase text-[11px]">3. Lokasi Serah Terima & Tujuan Sewa</p>
            <p><strong>Titik Pengambilan / Pengantaran:</strong> {inspectedBooking.pickupHub}</p>
            <p><strong>Tujuan Penggunaan Kendaraan:</strong> {inspectedBooking.purpose}</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1">
            <p className="font-bold text-zinc-900 uppercase text-[11px] mb-2">4. Rincian Tagihan & Deposit</p>
            {[
              [`Biaya Sewa Pokok (${inspectedBooking.totalHours} Jam)`, inspectedBooking.baseCost],
              ['Biaya Supir', inspectedBooking.driverCost],
              ['Biaya Pengantaran', inspectedBooking.deliveryCost],
              ['Deposit Jaminan', inspectedBooking.depositCost],
            ].map(([label, amount]) => (
              <div className="flex justify-between" key={label}>
                <span>{label}</span>
                <span className="font-semibold">{formatIDR(amount)}</span>
              </div>
            ))}

            <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-extrabold text-orange-600">
              <span>Total Tagihan</span>
              <span>{formatIDR(inspectedBooking.grandTotal)}</span>
            </div>

            <PaymentEditor
              key={inspectedBooking.code}
              inspectedBooking={inspectedBooking}
              onPaymentChange={onPaymentChange}
              formatIDR={formatIDR}
            />
          </div>

          <div className="space-y-2">
            <p className="font-bold text-zinc-900 uppercase text-[11px]">5. Keputusan Verifikasi & Status Pesanan</p>
            <div className="flex flex-wrap gap-2">
              {statusButton('CONFIRMED', 'bg-emerald-50 text-emerald-800 border border-emerald-200', 'bg-emerald-600 text-white', '1. Setujui Dokumen (DISETUJUI)')}
              {statusButton('ON_TRIP', 'bg-orange-50 text-orange-800 border border-orange-200', 'bg-orange-600 text-white', '2. Serahkan Kunci / Mulai Sewa')}
              {statusButton('COMPLETED', 'bg-zinc-100 text-zinc-800 border border-zinc-300', 'bg-zinc-900 text-white', '3. Selesai & Kembalikan Deposit')}
              {statusButton('CANCELLED', 'bg-red-50 text-red-700 border border-red-200', 'bg-red-600 text-white', 'Batalkan Pesanan')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}