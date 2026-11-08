import { ArrowRight, X } from 'lucide-react';

function setMinimumDateTime(input) {
  if (!input) return;

  const minimumTime = new Date(Date.now() + 60000);

  const localTime = new Date(
    minimumTime.getTime() -
    minimumTime.getTimezoneOffset() * 60000
  );

  input.min = localTime.toISOString().slice(0, 16);
}

export default function CheckoutModal({
  vehicle,
  quote,
  user,
  step,
  packages,
  services,
  deliveryModes,
  activePackageId,
  activeServiceId,
  multiplier,
  deliveryId,
  startDateTime,
  pickupHub,
  rentalPurpose,
  promoCode,
  estimatedEndDateTime,
  formError,
  onClose,
  onSubmit,
  onPackageChange,
  onServiceChange,
  onMultiplierChange,
  onStartChange,
  onDeliveryChange,
  onPickupChange,
  onPurposeChange,
  onPromoChange,
  onStepChange,
  formatIDR,
  formatDateTime,
}) {


  if (!vehicle || !quote || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-900/60 p-4">
      <div className="my-8 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 px-6 py-4 text-white">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Formulir Pemesanan Mobil — Langkah {step} dari 2
            </span>

            <h3 className="text-lg font-bold">
              {vehicle.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          {step === 1 ? (
            <>
              {/* Paket dan layanan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">
                    Paket Durasi
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(packages).map((pkg) => (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => onPackageChange(pkg.id)}
                        className={`rounded-lg border px-2 py-2 text-xs font-bold ${activePackageId === pkg.id
                            ? 'border-orange-600 bg-orange-600 text-white'
                            : 'border-zinc-300 bg-white text-zinc-700'
                          }`}
                      >
                        {pkg.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">
                    Tipe Layanan
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(services).map((srv) => (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => onServiceChange(srv.id)}
                        className={`rounded-lg border px-2 py-2 text-xs font-bold ${activeServiceId === srv.id
                            ? 'border-orange-600 bg-orange-600 text-white'
                            : 'border-zinc-300 bg-white text-zinc-700'
                          }`}
                      >
                        {srv.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Jadwal penyewaan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <Field label="Kelipatan Paket">
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={multiplier}
                    onChange={(e) =>
                      onMultiplierChange(Number(e.target.value))
                    }
                    className="field"
                  />
                </Field>

                <Field label="Waktu Mulai Ambil">
                  <input
                    ref={setMinimumDateTime}
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => onStartChange(e.target.value)}
                    className="field"
                  />
                </Field>

                <Field label={`Waktu Selesai (${quote.totalHours} Jam)`}>
                  <input
                    type="text"
                    readOnly
                    value={formatDateTime(estimatedEndDateTime)}
                    className="field bg-zinc-100 text-zinc-600"
                  />
                </Field>
              </div>

              {/* Metode serah terima */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field label="Metode Serah Terima Unit">
                  <select
                    value={deliveryId}
                    onChange={(e) =>
                      onDeliveryChange(e.target.value)
                    }
                    className="field bg-white"
                  >
                    {Object.values(deliveryModes).map((mode) => (
                      <option
                        key={mode.id}
                        value={mode.id}
                      >
                        {mode.label} (
                        {mode.fee === 0
                          ? 'Gratis'
                          : formatIDR(mode.fee)}
                        )
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Titik Garasi / Lokasi Pengantaran">
                  <input
                    type="text"
                    value={pickupHub}
                    onChange={(e) =>
                      onPickupChange(e.target.value)
                    }
                    className="field"
                  />
                </Field>
              </div>

              {/* Kode promo */}
              <Field label="Kode Promo (Opsional)">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => onPromoChange(e.target.value)}
                  placeholder="Contoh: VELO10, MAHASISWA, WEEKEND20"
                  className="field uppercase"
                />
                {quote.promoError && (
                  <p className="mt-1 text-[11px] font-semibold text-red-600">
                    {quote.promoError}
                  </p>
                )}
                {quote.discountAmount > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                    Kode {quote.discountCode} berhasil dipakai: diskon {quote.discountPercent}%.
                  </p>
                )}
              </Field>
            </>
          ) : (
            <>
              {/* Informasi penyewa */}
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs">

                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">
                    Data Penyewa Terhubung (Otomatis dari Akun Anda)
                  </span>

                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                    Terautentikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 border-t border-zinc-200 pt-2 text-zinc-700 sm:grid-cols-2">
                  <p>
                    <strong>Nama:</strong> {user.name}
                  </p>

                  <p>
                    <strong>WhatsApp:</strong> {user.phone}
                  </p>

                  <p>
                    <strong>NIK e-KTP:</strong> {user.nik}
                  </p>

                  <p>
                    <strong>No. SIM A:</strong> {user.simA}
                  </p>
                </div>
              </div>

              <Field label="Tujuan Penggunaan Mobil (Diperiksa oleh Admin)">
                <input
                  type="text"
                  value={rentalPurpose}
                  onChange={(e) =>
                    onPurposeChange(e.target.value)
                  }
                  placeholder="Contoh: Perjalanan Dinas / Wisata Keluarga Bandung"
                  className="field"
                />
              </Field>
            </>
          )}

          {/* Rincian pembayaran */}
          <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs">

            <Line
              label={`Sewa Pokok (${quote.packageLabel} x ${multiplier})`}
              value={formatIDR(quote.baseCost)}
            />

            {quote.discountAmount > 0 && (
              <Line
                label={`Diskon ${quote.discountCode} (${quote.discountPercent}%)`}
                value={`- ${formatIDR(quote.discountAmount)}`}
              />
            )}

            {quote.driverCost > 0 && (
              <Line
                label="Jasa Supir Profesional"
                value={formatIDR(quote.driverCost)}
              />
            )}

            {quote.deliveryCost > 0 && (
              <Line
                label="Biaya Antar Unit"
                value={formatIDR(quote.deliveryCost)}
              />
            )}

            {quote.depositCost > 0 && (
              <Line
                label="Deposit Jaminan Lepas Kunci (Refundable)"
                value={formatIDR(quote.depositCost)}
              />
            )}

            <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold text-zinc-900">
              <span>Total Pembayaran</span>

              <span className="text-base text-orange-600">
                {formatIDR(quote.grandTotal)}
              </span>
            </div>
          </div>

          {/* Pesan error */}
          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {formError}
            </p>
          )}

          {/* Tombol navigasi */}
          <div className="flex items-center justify-end gap-3 pt-2">

            {step === 2 && (
              <button
                type="button"
                onClick={() => onStepChange(1)}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700"
              >
                Kembali ke Jadwal
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-700"
              >
                Lanjut Verifikasi Data
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-700"
              >
                Konfirmasi & Terbitkan E-Tiket
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Komponen Field
function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-zinc-700">
        {label}
      </label>

      {children}
    </div>
  );
}

// Komponen rincian pembayaran
function Line({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-600">
      <span>{label}</span>

      <span className="font-semibold text-zinc-900">
        {value}
      </span>
    </div>
  );
}