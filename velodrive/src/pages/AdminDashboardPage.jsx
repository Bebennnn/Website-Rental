import React, { useState, useMemo } from 'react';
import {
  Plus,
  Image as ImageIcon,
  Eye,
  X,
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminBookingTable from '../components/admin/AdminBookingTable';
import AdminInspectionModal from '../components/admin/AdminInspectionModal';
import AdminFleetTable from '../components/admin/AdminFleetTable';
import AdminCustomerTable from '../components/admin/AdminCustomerTable';
import AdminVehicleModal from '../components/admin/AdminVehicleModal';
import { translateStatus } from '../components/admin/statusLabels';

import {
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
  onUpdateBookingPayment,
  onUpdateCustomerAccountStatus,
  onToggleCustomerVerify,
  onUpdateVehicleStatus,
  onUpdateVehicleImage,
  onUpdateVehicleServiceSchedule,
  onCreateVehicle,
  onLogout,
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
      .reduce((acc, b) => acc + Number(b.paidAmount || 0), 0);
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
        '/images/mobil/default-car.svg',
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

  const handlePaymentChange = async (code, paidAmount) => {
    const updated = await onUpdateBookingPayment(code, paidAmount);
    if (inspectedBooking?.code === code) setInspectedBooking(updated);
    return updated;
  };

  const handleStatusChange = async (code, nextStatus) => {
    const updated = await onUpdateBookingStatus(code, nextStatus);
    if (inspectedBooking && inspectedBooking.code === code) {
      setInspectedBooking(updated || { ...inspectedBooking, status: nextStatus });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar
        activeTab={adminTab}
        pendingCount={adminMetrics.pendingCount}
        onTabChange={setAdminTab}
        onLogout={onLogout}
      />

      {/* KONTEN UTAMA ADMIN */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">Total Pembayaran Diterima</p>
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
            <p className="text-xs text-zinc-500 font-medium">Unit Sedang Disewa</p>
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

        {adminTab === 'BOOKINGS' && (
          <AdminBookingTable
            bookings={filteredAdminBookings}
            statusFilter={adminStatusFilter}
            onStatusFilterChange={setAdminStatusFilter}
            onInspect={setInspectedBooking}
            serviceTypes={SERVICE_TYPES}
            translateStatus={translateStatus}
            formatDateTime={formatDateTime}
            formatIDR={formatIDR}
            EyeIcon={Eye}
          />
        )}

        {adminTab === 'FLEET' && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
              <div><h2 className="text-lg font-bold text-zinc-900">Manajemen Armada & Gambar Mobil</h2>
                <p className="text-xs text-zinc-500">Kelola unit dan tarif. Jadwal servis dihitung dari kilometer atau tanggal servis jika datanya tersedia.</p></div>
              <button onClick={() => setShowAddModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5"><Plus className="w-4 h-4" />Tambah Armada Baru</button>
            </div>
            <AdminFleetTable vehicles={vehicles} editingImageCarId={editingImageCarId} tempImageUrl={tempImageUrl}
              onImageUrlChange={setTempImageUrl} onSaveImage={async (id) => { if (tempImageUrl.trim()) await onUpdateVehicleImage(id, tempImageUrl.trim()); setEditingImageCarId(null); }}
              onEditImage={(car) => { setEditingImageCarId(car.id); setTempImageUrl(car.imageUrl); }}
              onUpdateServiceSchedule={onUpdateVehicleServiceSchedule}
              onUpdateStatus={onUpdateVehicleStatus} formatIDR={formatIDR} getCategoryLabel={getCategoryLabel} ImageIcon={ImageIcon} />
          </div>
        )}

        {adminTab === 'CUSTOMERS' && (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200"><h2 className="text-lg font-bold text-zinc-900">Database Pelanggan & Verifikasi Identitas (e-KTP / SIM A)</h2>
              <p className="text-xs text-zinc-500">Admin dapat memeriksa keabsahan nomor NIK e-KTP dan SIM A setiap penyewa yang terdaftar.</p></div>
            <AdminCustomerTable customers={customers} bookings={bookings} onToggleVerify={onToggleCustomerVerify} onUpdateAccountStatus={onUpdateCustomerAccountStatus} />
          </div>
        )}

      </div>

      <AdminInspectionModal
        inspectedBooking={inspectedBooking}
        onClose={() => setInspectedBooking(null)}
        onStatusChange={handleStatusChange}
        onPaymentChange={handlePaymentChange}
        serviceTypes={SERVICE_TYPES}
        formatDateTime={formatDateTime}
        formatIDR={formatIDR}
        CloseIcon={X}
      />

      <AdminVehicleModal open={showAddModal} car={newCar} onChange={setNewCar}
        onClose={() => setShowAddModal(false)} onSubmit={handleAddCarSubmit}
        brands={POPULAR_BRANDS} categories={INDONESIAN_CAR_CATEGORIES} CloseIcon={X} />

    </div>
  );
}