import React, { useState, useMemo } from 'react';
import {
  Car,
  Users,
  FileText,
  BarChart3,
  Plus,
  Image as ImageIcon,
  Eye,
  X,
} from 'lucide-react';
import {
  BRANCHES,
  RENTAL_PACKAGES,
  SERVICE_TYPES,
  INDONESIAN_CAR_CATEGORIES,
  POPULAR_BRANDS,
} from '../constants/rentalData';
import { formatIDR, formatDateTime, getCategoryLabel } from '../utils/pricing';

export default function AdminDashboardPage({
  vehicles,
  bookings,
  customers,
  onUpdateBookingStatus,
  onToggleCustomerVerify,
  onUpdateVehicleStatus,
  onUpdateVehicleImage,
  onCreateVehicle,
}) {
  const [adminTab, setAdminTab] = useState('BOOKINGS'); // 'OVERVIEW' | 'BOOKINGS' | 'FLEET' | 'CUSTOMERS'
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [inspectedBooking, setInspectedBooking] = useState(null);
  const [editingImageCarId, setEditingImageCarId] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCar, setNewCar] = useState({
    brand: 'Toyota',
    name: '',
    year: 2024,
    branchId: 'BDG',
    category: 'MPV',
    transmission: 'AT',
    fuel: 'Bensin',
    seats: 7,
    plateNumber: '',
    imageUrl: '',
    rate6h: 200000,
    rate12h: 325000,
    rate24h: 450000,
  });

  const adminMetrics = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((acc, b) => acc + b.grandTotal, 0);
    const pendingCount = bookings.filter((b) => b.status === 'PENDING_VERIFICATION').length;
    const activeRentals = bookings.filter((b) => b.status === 'ON_TRIP').length;
    const availableFleet = vehicles.filter((v) => v.status === 'AVAILABLE').length;
    return { totalRevenue, pendingCount, activeRentals, availableFleet };
  }, [bookings, vehicles]);

  const filteredAdminBookings = useMemo(() => {
    if (adminStatusFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.status === adminStatusFilter);
  }, [bookings, adminStatusFilter]);

  const handleAddCarSubmit = async (e) => {
    e.preventDefault();
    if (!newCar.name || !newCar.plateNumber) return;

    await onCreateVehicle({
      id: `ID-0${vehicles.length + 1}`,
      brand: newCar.brand,
      name: newCar.name,
      year: Number(newCar.year),
      branchId: newCar.branchId,
      category: newCar.category,
      transmission: newCar.transmission,
      fuel: newCar.fuel,
      seats: Number(newCar.seats),
      luggage: 3,
      plateNumber: newCar.plateNumber.toUpperCase(),
      imageUrl:
        newCar.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      rates: {
        PKG_6H: Number(newCar.rate6h),
        PKG_12H: Number(newCar.rate12h),
        PKG_24H: Number(newCar.rate24h),
      },
      status: 'AVAILABLE',
    });

    setShowAddModal(false);
    setNewCar({
      brand: 'Toyota',
      name: '',
      year: 2024,
      branchId: 'BDG',
      category: 'MPV',
      transmission: 'AT',
      fuel: 'Bensin',
      seats: 7,
      plateNumber: '',
      imageUrl: '',
      rate6h: 200000,
      rate12h: 325000,
      rate24h: 450000,
    });
  };

  const handleStatusChange = async (code, nextStatus) => {
    const updated = await onUpdateBookingStatus(code, nextStatus);
    if (inspectedBooking && inspectedBooking.code === code) {
      setInspectedBooking(updated || { ...inspectedBooking, status: nextStatus });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col lg:flex-row">
      {/* SIDEBAR ADMIN TERPISAH */}
      <aside className="w-full lg:w-64 bg-zinc-900 text-white shrink-0 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base leading-none">VeloDrive Admin</p>
              <p className="text-[11px] text-zinc-400 mt-1">Backoffice Operasional</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setAdminTab('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                adminTab === 'OVERVIEW'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Ringkasan & Statistik
            </button>

            <button
              onClick={() => setAdminTab('BOOKINGS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                adminTab === 'BOOKINGS'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                Data Pesanan & Verifikasi
              </span>
              {adminMetrics.pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-zinc-900">
                  {adminMetrics.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab('FLEET')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                adminTab === 'FLEET'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Car className="w-4 h-4" />
              Data Armada & Foto Unit
            </button>

            <button
              onClick={() => setAdminTab('CUSTOMERS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                adminTab === 'CUSTOMERS'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Pelanggan (KTP/SIM)
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800 text-[11px] text-zinc-400">
          <p className="font-semibold text-zinc-200">Petugas Shift Aktif:</p>
          <p>Admin Operasional Pusat</p>
        </div>
      </aside>

      {/* KONTEN UTAMA ADMIN */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">Total Nilai Transaksi</p>
            <p className="text-xl font-extrabold text-zinc-900 mt-1">
              {formatIDR(adminMetrics.totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {bookings.length} Total Reservasi Masuk
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">Perlu Verifikasi KTP/SIM</p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">
              {adminMetrics.pendingCount} Pesanan
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Menunggu persetujuan Admin</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">Unit Sedang Jalan (On-Trip)</p>
            <p className="text-xl font-extrabold text-orange-600 mt-1">
              {adminMetrics.activeRentals} Mobil
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Terpantau aktif di jalan</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">Armada Siap Sewa</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">
              {adminMetrics.availableFleet} / {vehicles.length} Unit
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Tersedia di 4 kota cabang</p>
          </div>
        </div>

        {/* TAB 1: RINGKASAN */}
        {adminTab === 'OVERVIEW' && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">Ringkasan Operasional Hari Ini</h2>
            <p className="text-xs text-zinc-500">
              Berikut adalah daftar pesanan terbaru yang membutuhkan pengecekan dokumen KTP, SIM A,
              dan serah terima kunci.
            </p>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((bk) => (
                <div
                  key={bk.id}
                  className="p-4 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 bg-zinc-900 text-white rounded">
                        {bk.code}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">{bk.customerName}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {bk.vehicleName} ({bk.plateNumber}) • {formatDateTime(bk.startDateTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-orange-600">
                      {formatIDR(bk.grandTotal)}
                    </span>
                    <button
                      onClick={() => {
                        setInspectedBooking(bk);
                        setAdminTab('BOOKINGS');
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-2 rounded-lg"
                    >
                      Periksa Detail Data
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DATA PESANAN & VERIFIKASI */}
        {adminTab === 'BOOKINGS' && (
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
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'PENDING_VERIFICATION', label: 'Perlu Verifikasi' },
                  { id: 'CONFIRMED', label: 'Disetujui' },
                  { id: 'ON_TRIP', label: 'Sedang Jalan' },
                  { id: 'COMPLETED', label: 'Selesai' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setAdminStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      adminStatusFilter === st.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {st.label}
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
                    <th className="py-3.5 px-4">Total Tagihan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {filteredAdminBookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-zinc-50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-zinc-900 block">{bk.code}</span>
                        <span className="text-[11px] text-zinc-400">{bk.createdAt}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-900">{bk.customerName}</p>
                        <p className="text-zinc-500">WA: {bk.customerPhone}</p>
                        <p className="font-mono text-[11px] text-zinc-500">
                          NIK: {bk.customerNik}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-zinc-900">{bk.vehicleName}</p>
                        <p className="font-mono text-zinc-500">
                          {bk.plateNumber} • {SERVICE_TYPES[bk.serviceId]?.label}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-800">{bk.totalHours} Jam</p>
                        <p className="text-zinc-500">{formatDateTime(bk.startDateTime)}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-orange-600">
                        {formatIDR(bk.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            bk.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-100 text-amber-800'
                              : bk.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bk.status === 'ON_TRIP'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {bk.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setInspectedBooking(bk)}
                          className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-orange-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Cek Data & Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DATA ARMADA & FOTO UNIT */}
        {adminTab === 'FLEET' && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Manajemen Armada & Gambar Mobil
                </h2>
                <p className="text-xs text-zinc-500">
                  Kelola ketersediaan unit, tarif 6/12/24 jam, atau ganti URL gambar mobil.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah Armada Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                    <th className="py-3.5 px-4">Foto & Nama Mobil</th>
                    <th className="py-3.5 px-4">Tipe & Cabang</th>
                    <th className="py-3.5 px-4">Tarif 6J / 12J / 24J</th>
                    <th className="py-3.5 px-4">Status Unit</th>
                    <th className="py-3.5 px-4 text-right">Ubah Foto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {vehicles.map((car) => (
                    <tr key={car.id} className="hover:bg-zinc-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={car.imageUrl}
                            alt={car.name}
                            className="w-16 h-11 rounded object-cover border border-zinc-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-zinc-900">{car.name}</p>
                            <p className="font-mono text-zinc-500">{car.plateNumber}</p>
                          </div>
                        </div>
                        {editingImageCarId === car.id && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={tempImageUrl}
                              onChange={(e) => setTempImageUrl(e.target.value)}
                              placeholder="Masukkan URL atau /images/mobil.jpg"
                              className="flex-1 border border-zinc-300 rounded px-2.5 py-1 text-xs"
                            />
                            <button
                              onClick={async () => {
                                if (tempImageUrl.trim()) {
                                  await onUpdateVehicleImage(car.id, tempImageUrl.trim());
                                }
                                setEditingImageCarId(null);
                              }}
                              className="bg-orange-600 text-white px-2.5 py-1 rounded font-semibold"
                            >
                              Simpan
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-800">
                          {getCategoryLabel(car.category)}
                        </p>
                        <p className="text-zinc-500">
                          {car.branchId} • {car.transmission}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {formatIDR(car.rates.PKG_6H)} / {formatIDR(car.rates.PKG_12H)} /{' '}
                        <strong className="text-orange-600">
                          {formatIDR(car.rates.PKG_24H)}
                        </strong>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={car.status}
                          onChange={(e) => onUpdateVehicleStatus(car.id, e.target.value)}
                          className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold bg-white"
                        >
                          <option value="AVAILABLE">AVAILABLE (Siap)</option>
                          <option value="RENTED">RENTED (Disewa)</option>
                          <option value="MAINTENANCE">MAINTENANCE (Servis)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingImageCarId(car.id);
                            setTempImageUrl(car.imageUrl);
                          }}
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Ganti Foto
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DATA PELANGGAN (KTP & SIM A) */}
        {adminTab === 'CUSTOMERS' && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900">
                Database Pelanggan & Verifikasi Identitas (e-KTP / SIM A)
              </h2>
              <p className="text-xs text-zinc-500">
                Admin dapat memeriksa keabsahan nomor NIK e-KTP dan SIM A setiap penyewa yang
                terdaftar.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                    <th className="py-3.5 px-4">ID & Nama Penyewa</th>
                    <th className="py-3.5 px-4">Kontak & Domisili</th>
                    <th className="py-3.5 px-4">Nomor NIK e-KTP</th>
                    <th className="py-3.5 px-4">Nomor SIM A</th>
                    <th className="py-3.5 px-4">Riwayat Sewa</th>
                    <th className="py-3.5 px-4">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {customers.map((cust) => {
                    const custBookingsCount = bookings.filter(
                      (b) => b.userId === cust.id
                    ).length;
                    return (
                      <tr key={cust.id} className="hover:bg-zinc-50">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] text-zinc-400 block">
                            {cust.id}
                          </span>
                          <span className="font-bold text-zinc-900">{cust.name}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-zinc-800">
                            {cust.email} • {cust.phone}
                          </p>
                          <p className="text-zinc-500">{cust.address}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800">
                          {cust.nik}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800">
                          {cust.simA}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-800">
                          {custBookingsCount} Pesanan
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onToggleCustomerVerify(cust.id, !cust.verified)}
                            className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                              cust.verified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {cust.verified
                              ? '✓ KTP & SIM Valid'
                              : 'Belum Diverifikasi (Klik Validasi)'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER PEMERIKSAAN DETAIL PESANAN OLEH ADMIN */}
      {inspectedBooking && (
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
              <button
                onClick={() => setInspectedBooking(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div className="space-y-1.5">
                  <p className="font-bold text-zinc-900 uppercase text-[11px]">
                    1. Identitas & Dokumen Penyewa
                  </p>
                  <p>
                    <strong>Nama Lengkap:</strong> {inspectedBooking.customerName}
                  </p>
                  <p>
                    <strong>Email:</strong> {inspectedBooking.customerEmail}
                  </p>
                  <p>
                    <strong>No. WhatsApp:</strong> {inspectedBooking.customerPhone}
                  </p>
                  <p className="font-mono">
                    <strong>NIK e-KTP:</strong> {inspectedBooking.customerNik}
                  </p>
                  <p className="font-mono">
                    <strong>No. SIM A:</strong> {inspectedBooking.customerSim}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-zinc-900 uppercase text-[11px]">
                    2. Unit & Jadwal Pemakaian
                  </p>
                  <p>
                    <strong>Unit Armada:</strong> {inspectedBooking.vehicleName}
                  </p>
                  <p>
                    <strong>Plat Nomor:</strong> {inspectedBooking.plateNumber}
                  </p>
                  <p>
                    <strong>Layanan:</strong>{' '}
                    {SERVICE_TYPES[inspectedBooking.serviceId]?.label}
                  </p>
                  <p>
                    <strong>Waktu Ambil:</strong>{' '}
                    {formatDateTime(inspectedBooking.startDateTime)}
                  </p>
                  <p>
                    <strong>Waktu Kembali:</strong>{' '}
                    {formatDateTime(inspectedBooking.endDateTime)}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1.5">
                <p className="font-bold text-zinc-900 uppercase text-[11px]">
                  3. Lokasi Serah Terima & Tujuan Sewa
                </p>
                <p>
                  <strong>Titik Pengambilan / Pengantaran:</strong>{' '}
                  {inspectedBooking.pickupHub}
                </p>
                <p>
                  <strong>Tujuan Penggunaan Kendaraan:</strong> {inspectedBooking.purpose}
                </p>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1">
                <p className="font-bold text-zinc-900 uppercase text-[11px] mb-2">
                  4. Rincian Tagihan & Deposit
                </p>
                <div className="flex justify-between">
                  <span>
                    Biaya Sewa Pokok ({inspectedBooking.totalHours} Jam)
                  </span>
                  <span className="font-semibold">
                    {formatIDR(inspectedBooking.baseCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Supir</span>
                  <span className="font-semibold">
                    {formatIDR(inspectedBooking.driverCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengantaran</span>
                  <span className="font-semibold">
                    {formatIDR(inspectedBooking.deliveryCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Jaminan</span>
                  <span className="font-semibold">
                    {formatIDR(inspectedBooking.depositCost)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-extrabold text-orange-600">
                  <span>Total Pembayaran</span>
                  <span>{formatIDR(inspectedBooking.grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-zinc-900 uppercase text-[11px]">
                  5. Keputusan Verifikasi & Status Pesanan
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(inspectedBooking.code, 'CONFIRMED')
                    }
                    className={`px-3.5 py-2 rounded-lg font-bold ${
                      inspectedBooking.status === 'CONFIRMED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    1. Setujui Dokumen (CONFIRMED)
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(inspectedBooking.code, 'ON_TRIP')
                    }
                    className={`px-3.5 py-2 rounded-lg font-bold ${
                      inspectedBooking.status === 'ON_TRIP'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}
                  >
                    2. Serahkan Kunci / Jalan (ON_TRIP)
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(inspectedBooking.code, 'COMPLETED')
                    }
                    className={`px-3.5 py-2 rounded-lg font-bold ${
                      inspectedBooking.status === 'COMPLETED'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                    }`}
                  >
                    3. Selesai & Kembalikan Deposit
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(inspectedBooking.code, 'CANCELLED')
                    }
                    className={`px-3.5 py-2 rounded-lg font-bold ${
                      inspectedBooking.status === 'CANCELLED'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    Batalkan Pesanan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ARMADA BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Armada Mobil Indonesia</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCarSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Merek</label>
                  <select
                    value={newCar.brand}
                    onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  >
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Tipe Mobil
                  </label>
                  <select
                    value={newCar.category}
                    onChange={(e) => setNewCar({ ...newCar, category: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  >
                    {INDONESIAN_CAR_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Nama Lengkap Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={newCar.name}
                    onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                    placeholder="Daihatsu Sigra 1.2 R"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    required
                    value={newCar.plateNumber}
                    onChange={(e) =>
                      setNewCar({ ...newCar, plateNumber: e.target.value })
                    }
                    placeholder="D 1928 VLD"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  URL Gambar Mobil (atau path lokal /images/mobil.jpg)
                </label>
                <input
                  type="text"
                  value={newCar.imageUrl}
                  onChange={(e) => setNewCar({ ...newCar, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Tarif 6 Jam
                  </label>
                  <input
                    type="number"
                    value={newCar.rate6h}
                    onChange={(e) => setNewCar({ ...newCar, rate6h: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Tarif 12 Jam
                  </label>
                  <input
                    type="number"
                    value={newCar.rate12h}
                    onChange={(e) => setNewCar({ ...newCar, rate12h: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Tarif 24 Jam
                  </label>
                  <input
                    type="number"
                    value={newCar.rate24h}
                    onChange={(e) => setNewCar({ ...newCar, rate24h: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Simpan Armada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}