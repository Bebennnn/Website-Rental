import React, { useState, useMemo } from 'react';
import {
  Car,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Settings,
  CheckCircle2,
  X,
  Phone,
  Fuel,
  Heart,
  BadgeDollarSign,
  Headphones,
  ArrowRight,
  UserCheck,
  LogOut,
  FileText,
  Lock,
} from 'lucide-react';
import {
  BRANCHES,
  RENTAL_PACKAGES,
  SERVICE_TYPES,
  DELIVERY_MODES,
  INDONESIAN_CAR_CATEGORIES,
  POPULAR_BRANDS,
} from '../constants/rentalData';
import {
  formatIDR,
  formatDateTime,
  computeEndDateTime,
  calculateRentalQuote,
  getCategoryLabel,
} from '../utils/pricing';

export default function UserStorefrontPage({
  currentUser,
  onLogout,
  onNavigateToAuth,
  vehicles,
  bookings,
  onCreateBooking,
  initialCheckoutVehicle,
  onClearInitialCheckoutVehicle,
}) {
  const [userSubView, setUserSubView] = useState('HOME'); // 'HOME' | 'MY_BOOKINGS'

  // Filter State
  const [searchTab, setSearchTab] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedTransmission, setSelectedTransmission] = useState('ALL');
  const [maxBudget, setMaxBudget] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Konfigurasi Paket Aktif
  const [activePackageId, setActivePackageId] = useState('PKG_24H');
  const [activeServiceId, setActiveServiceId] = useState('SELF_DRIVE');
  const [favorites, setFavorites] = useState(['ID-01', 'ID-04']);

  // State Modal Checkout
  const [selectedVehicle, setSelectedVehicle] = useState(initialCheckoutVehicle || null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [deliveryId, setDeliveryId] = useState('PICKUP_GARAGE');
  const [startDateTime, setStartDateTime] = useState('2025-05-20T09:00');
  const [pickupHub, setPickupHub] = useState('Garasi Pasteur & Stasiun Bandung');
  const [rentalPurpose, setRentalPurpose] = useState('Kebutuhan Perjalanan Dalam Kota / Keluarga');
  const [formError, setFormError] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchBrand = selectedBrand === 'ALL' || v.brand === selectedBrand;
      const matchCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
      const matchBranch = selectedBranch === 'ALL' || v.branchId === selectedBranch;
      const matchTrans = selectedTransmission === 'ALL' || v.transmission === selectedTransmission;
      const currentRate = v.rates[activePackageId] || v.rates.PKG_24H;
      const matchBudget = maxBudget === 'ALL' || currentRate <= Number(maxBudget);
      const matchQuery =
        searchQuery.trim() === '' ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase());

      return matchBrand && matchCategory && matchBranch && matchTrans && matchBudget && matchQuery;
    });
  }, [
    vehicles,
    selectedBrand,
    selectedCategory,
    selectedBranch,
    selectedTransmission,
    maxBudget,
    searchQuery,
    activePackageId,
  ]);

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  const activeQuote = useMemo(() => {
    if (!selectedVehicle) return null;
    return calculateRentalQuote({
      vehicle: selectedVehicle,
      packageId: activePackageId,
      multiplier,
      serviceId: activeServiceId,
      deliveryId,
    });
  }, [selectedVehicle, activePackageId, multiplier, activeServiceId, deliveryId]);

  const estimatedEndDateTime = useMemo(() => {
    if (!activeQuote) return '';
    return computeEndDateTime(startDateTime, activeQuote.totalHours);
  }, [startDateTime, activeQuote]);

  const handleBookVehicleClick = (vehicle) => {
    setFormError('');
    const branchObj = BRANCHES.find((b) => b.id === vehicle.branchId);
    if (branchObj) setPickupHub(branchObj.hubName);

    if (!currentUser) {
      onNavigateToAuth(vehicle);
      return;
    }

    setSelectedVehicle(vehicle);
    setCheckoutStep(1);
  };

  const closeCheckoutModal = () => {
    setSelectedVehicle(null);
    if (onClearInitialCheckoutVehicle) onClearInitialCheckoutVehicle();
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!currentUser || !selectedVehicle || !activeQuote) return;

    if (!rentalPurpose.trim()) {
      setFormError('Mohon isi tujuan pemakaian kendaraan untuk verifikasi admin.');
      return;
    }

    await onCreateBooking({
      userId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
      customerNik: currentUser.nik,
      customerSim: currentUser.simA,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      plateNumber: selectedVehicle.plateNumber,
      branchId: selectedVehicle.branchId,
      pickupHub,
      purpose: rentalPurpose.trim(),
      packageId: activePackageId,
      multiplier,
      totalHours: activeQuote.totalHours,
      serviceId: activeServiceId,
      deliveryId,
      startDateTime,
      endDateTime: estimatedEndDateTime,
      baseCost: activeQuote.baseCost,
      driverCost: activeQuote.driverCost,
      deliveryCost: activeQuote.deliveryCost,
      depositCost: activeQuote.depositCost,
      grandTotal: activeQuote.grandTotal,
    });

    closeCheckoutModal();
    setUserSubView('MY_BOOKINGS');
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const resetFilters = () => {
    setSelectedBrand('ALL');
    setSelectedCategory('ALL');
    setSelectedBranch('ALL');
    setSelectedTransmission('ALL');
    setMaxBudget('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* NAVBAR PELANGGAN */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div
            onClick={() => setUserSubView('HOME')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-zinc-900">VeloDrive</span>
              <span className="block text-[11px] font-medium text-zinc-500 -mt-1">
                Rental Mobil Indonesia
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
            <button
              onClick={() => setUserSubView('HOME')}
              className={`py-1 transition-colors ${
                userSubView === 'HOME'
                  ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                  : 'hover:text-zinc-900'
              }`}
            >
              Beranda & Katalog
            </button>
            <a
              href="#katalog-mobil"
              onClick={() => setUserSubView('HOME')}
              className="hover:text-zinc-900 transition-colors"
            >
              Armada Indonesia
            </a>
            <button
              onClick={() => setUserSubView('MY_BOOKINGS')}
              className={`py-1 flex items-center gap-1.5 transition-colors ${
                userSubView === 'MY_BOOKINGS'
                  ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                  : 'hover:text-zinc-900'
              }`}
            >
              Pesanan Saya
              {myBookings.length > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-bold bg-orange-600 text-white rounded-full">
                  {myBookings.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserSubView('MY_BOOKINGS')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-zinc-900 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {currentUser.verified ? 'KTP & SIM Terverifikasi' : 'Menunggu Verifikasi'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Keluar Akun"
                  className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToAuth(null)}
                  className="text-sm font-semibold text-zinc-700 hover:text-orange-600 px-3 py-2"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onNavigateToAuth(null)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Daftar Akun
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SUB-VIEW 1: BERANDA & KATALOG */}
      {userSubView === 'HOME' && (
        <main>
          {/* HERO SECTION */}
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
                    <a
                      href="#katalog-mobil"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                    >
                      Pilih & Sewa Mobil
                    </a>
                    <button
                      onClick={() =>
                        currentUser ? setUserSubView('MY_BOOKINGS') : onNavigateToAuth(null)
                      }
                      className="bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                    >
                      {currentUser ? 'Lihat Pesanan Saya' : 'Login Penyewa'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 max-w-lg">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">150+ Armada</p>
                        <p className="text-xs text-zinc-500">Tahun Muda & Bersih</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">Resmi & Aman</p>
                        <p className="text-xs text-zinc-500">Terverifikasi Admin</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <BadgeDollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">Harga Jujur</p>
                        <p className="text-xs text-zinc-500">Mulai Rp150rb / 6 Jam</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                      alt="Armada Unggulan VeloDrive"
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                    <div className="bg-white p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                          Unit Terpopuler Minggu Ini
                        </span>
                        <h3 className="font-bold text-zinc-900 text-base">
                          Toyota Kijang Innova Zenix Hybrid
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-zinc-500 block">Mulai dari</span>
                          <span className="text-lg font-extrabold text-orange-600">
                            Rp 380.000
                          </span>
                          <span className="text-xs text-zinc-500"> / 6 Jam</span>
                        </div>
                        <button
                          onClick={() => handleBookVehicleClick(vehicles[3] || vehicles[0])}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg"
                        >
                          Sewa Unit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FLOATING SEARCH & FILTER BAR */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-md p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-200">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'ALL', label: 'Cari Mobil' },
                    { id: 'MPV', label: 'MPV Keluarga' },
                    { id: 'SUV', label: 'SUV Tangguh' },
                    { id: 'CITY_LCGC', label: 'City Car & LCGC' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSearchTab(tab.id);
                        setSelectedCategory(tab.id === 'ALL' ? 'ALL' : tab.id);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        searchTab === tab.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-500">Paket Durasi:</span>
                  <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-100">
                    {Object.values(RENTAL_PACKAGES).map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setActivePackageId(pkg.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                          activePackageId === pkg.id
                            ? 'bg-orange-600 text-white'
                            : 'text-zinc-700 hover:text-zinc-900'
                        }`}
                      >
                        {pkg.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Merek Mobil
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600"
                  >
                    <option value="ALL">Semua Merek</option>
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Tipe Mobil Indonesia
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600"
                  >
                    <option value="ALL">Semua Tipe</option>
                    {INDONESIAN_CAR_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Transmisi
                  </label>
                  <select
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600"
                  >
                    <option value="ALL">Semua Transmisi</option>
                    <option value="AT">Automatic (Matic)</option>
                    <option value="MT">Manual (MT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Batas Harga ({RENTAL_PACKAGES[activePackageId].shortLabel})
                  </label>
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600"
                  >
                    <option value="ALL">Tanpa Batas</option>
                    <option value="350000">Di bawah Rp 350.000</option>
                    <option value="550000">Di bawah Rp 550.000</option>
                    <option value="900000">Di bawah Rp 900.000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Lokasi Cabang
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-600"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <a
                    href="#katalog-mobil"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Cari Mobil
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURED LISTINGS (KATALOG MOBIL INDONESIA) */}
          <section id="katalog-mobil" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Pilihan Mobil Siap Jalan</h2>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Menampilkan tarif untuk{' '}
                  <strong className="text-zinc-800">
                    {RENTAL_PACKAGES[activePackageId].label}
                  </strong>{' '}
                  • Klik tombol Sewa Sekarang untuk memesan
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik Avanza, Brio, Zenix..."
                    className="pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Lihat Semua ({vehicles.length})
                </button>
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-12 text-center">
                <p className="font-bold text-zinc-800 text-base">
                  Tidak ada mobil yang sesuai dengan filter pencarian.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredVehicles.map((car) => {
                  const activePrice = car.rates[activePackageId] || car.rates.PKG_24H;
                  const branchName =
                    BRANCHES.find((b) => b.id === car.branchId)?.city || car.branchId;
                  const isAvailable = car.status === 'AVAILABLE';
                  const isFav = favorites.includes(car.id);

                  return (
                    <div
                      key={car.id}
                      className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col hover:border-orange-500 transition-colors"
                    >
                      <div className="relative h-44 bg-zinc-100 overflow-hidden">
                        <img
                          src={car.imageUrl}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-zinc-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          {getCategoryLabel(car.category)}
                        </span>
                        <button
                          onClick={() => toggleFavorite(car.id)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                            isFav
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:text-orange-600'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-zinc-900/70 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md">
                              SEDANG DISEWA
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                            <span>
                              {car.year} • {car.brand}
                            </span>
                            <span className="font-mono">{car.plateNumber}</span>
                          </div>
                          <h3 className="font-bold text-zinc-900 text-base line-clamp-1">
                            {car.name}
                          </h3>

                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-orange-600">
                              {formatIDR(activePrice)}
                            </span>
                            <span className="text-xs text-zinc-500">
                              / {RENTAL_PACKAGES[activePackageId].shortLabel}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                          <div className="grid grid-cols-3 gap-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-zinc-400" />
                              {car.seats} Kursi
                            </span>
                            <span className="flex items-center gap-1">
                              <Settings className="w-3.5 h-3.5 text-zinc-400" />
                              {car.transmission === 'AT' ? 'Matic' : 'Manual'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-zinc-400" />
                              {car.fuel}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="flex items-center gap-1 text-zinc-500">
                              <MapPin className="w-3.5 h-3.5 text-orange-600" />
                              {branchName}
                            </span>

                            <button
                              disabled={!isAvailable}
                              onClick={() => handleBookVehicleClick(car)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                isAvailable
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                              }`}
                            >
                              {isAvailable ? 'Sewa Sekarang' : 'Tidak Tersedia'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* BROWSE BY BRAND & BROWSE BY CATEGORY */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Cari Berdasarkan Merek</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pabrikan mobil terpopuler di Indonesia
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {POPULAR_BRANDS.map((brand) => {
                      const active = selectedBrand === brand.name;
                      return (
                        <button
                          key={brand.name}
                          onClick={() =>
                            setSelectedBrand(active ? 'ALL' : brand.name)
                          }
                          className={`p-3.5 rounded-lg border text-left transition-colors ${
                            active
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'bg-white border-zinc-200 hover:border-orange-500 text-zinc-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-900 font-extrabold text-xs flex items-center justify-center mb-2">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="font-bold text-sm">{brand.name}</p>
                          <p
                            className={`text-[11px] ${
                              active ? 'text-orange-100' : 'text-zinc-400'
                            }`}
                          >
                            {brand.origin}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-orange-600 rounded-xl p-6 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold">Cari Berdasarkan Tipe Mobil</h3>
                  <p className="text-xs text-orange-100 mt-1">
                    Kategori kendaraan sesuai medan jalan & jumlah penumpang di Indonesia
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                    {INDONESIAN_CAR_CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setSelectedCategory(active ? 'ALL' : cat.id)
                          }
                          className={`p-3.5 rounded-lg border text-left transition-colors ${
                            active
                              ? 'bg-white text-orange-600 border-white'
                              : 'bg-orange-700 border-orange-500 hover:bg-orange-800 text-white'
                          }`}
                        >
                          <Car className="w-5 h-5 mb-2" />
                          <p className="font-bold text-sm leading-tight">{cat.name}</p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              active ? 'text-zinc-600' : 'text-orange-200'
                            }`}
                          >
                            {cat.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* SUB-VIEW 2: PESANAN SAYA & E-TIKET */}
      {userSubView === 'MY_BOOKINGS' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Pesanan & E-Tiket Saya</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Pantau status verifikasi KTP/SIM oleh Admin dan jadwal pengambilan mobil Anda.
              </p>
            </div>
            <button
              onClick={() => setUserSubView('HOME')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg self-start"
            >
              + Sewa Mobil Lainnya
            </button>
          </div>

          {!currentUser ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 text-center space-y-4">
              <Lock className="w-8 h-8 text-orange-600 mx-auto" />
              <div>
                <h3 className="font-bold text-zinc-900 text-base">
                  Anda Belum Masuk ke Akun Penyewa
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Silakan login terlebih dahulu untuk melihat daftar E-Tiket dan status verifikasi
                  pesanan Anda.
                </p>
              </div>
              <button
                onClick={() => onNavigateToAuth(null)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg"
              >
                Masuk ke Akun Penyewa
              </button>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 text-center space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="font-bold text-zinc-800">Belum Ada Riwayat Pesanan</p>
              <button
                onClick={() => setUserSubView('HOME')}
                className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Pilih Mobil Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm px-3 py-1 rounded bg-zinc-900 text-white">
                        {bk.code}
                      </span>
                      <span className="text-xs text-zinc-500">Dibuat: {bk.createdAt}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        bk.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bk.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-100 text-amber-800'
                          : bk.status === 'ON_TRIP'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {bk.status === 'PENDING_VERIFICATION' && 'Menunggu Verifikasi Admin'}
                      {bk.status === 'CONFIRMED' && 'Disetujui Admin (Siap Diambil)'}
                      {bk.status === 'ON_TRIP' && 'Sedang Disewa (On-Trip)'}
                      {bk.status === 'COMPLETED' && 'Selesai Dikembalikan'}
                      {bk.status === 'CANCELLED' && 'Dibatalkan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500">Armada & Plat Nomor</p>
                      <p className="font-bold text-zinc-900 mt-0.5">{bk.vehicleName}</p>
                      <p className="text-xs font-mono text-zinc-600 mt-0.5">
                        {bk.plateNumber} • {SERVICE_TYPES[bk.serviceId]?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Jadwal Sewa ({bk.totalHours} Jam)</p>
                      <p className="font-semibold text-zinc-800 text-xs mt-0.5">
                        Mulai: {formatDateTime(bk.startDateTime)}
                      </p>
                      <p className="font-semibold text-zinc-800 text-xs mt-0.5">
                        Kembali: {formatDateTime(bk.endDateTime)}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs text-zinc-500">Total Pembayaran</p>
                      <p className="text-lg font-extrabold text-orange-600 mt-0.5">
                        {formatIDR(bk.grandTotal)}
                      </p>
                      <p className="text-[11px] text-zinc-500">{bk.pickupHub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* MODAL CHECKOUT PEMESANAN 2-LANGKAH */}
      {selectedVehicle && activeQuote && currentUser && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-2xl w-full overflow-hidden shadow-xl my-8">
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  Formulir Pemesanan Mobil — Langkah {checkoutStep} dari 2
                </span>
                <h3 className="font-bold text-lg">{selectedVehicle.name}</h3>
              </div>
              <button
                onClick={closeCheckoutModal}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
              {checkoutStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Paket Durasi
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(RENTAL_PACKAGES).map((pkg) => (
                          <button
                            type="button"
                            key={pkg.id}
                            onClick={() => setActivePackageId(pkg.id)}
                            className={`py-2 px-2 rounded-lg text-xs font-bold border ${
                              activePackageId === pkg.id
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {pkg.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Tipe Layanan
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(SERVICE_TYPES).map((srv) => (
                          <button
                            type="button"
                            key={srv.id}
                            onClick={() => setActiveServiceId(srv.id)}
                            className={`py-2 px-2 rounded-lg text-xs font-bold border ${
                              activeServiceId === srv.id
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {srv.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Kelipatan Paket
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={multiplier}
                        onChange={(e) => setMultiplier(Number(e.target.value))}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Waktu Mulai Ambil
                      </label>
                      <input
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Waktu Selesai ({activeQuote.totalHours} Jam)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formatDateTime(estimatedEndDateTime)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Metode Serah Terima Unit
                      </label>
                      <select
                        value={deliveryId}
                        onChange={(e) => setDeliveryId(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm bg-white"
                      >
                        {Object.values(DELIVERY_MODES).map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.label} ({mode.fee === 0 ? 'Gratis' : formatIDR(mode.fee)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Titik Garasi / Lokasi Pengantaran
                      </label>
                      <input
                        type="text"
                        value={pickupHub}
                        onChange={(e) => setPickupHub(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">
                        Data Penyewa Terhubung (Otomatis dari Akun Anda)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Terautentikasi
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-200 text-zinc-700">
                      <p>
                        <strong>Nama:</strong> {currentUser.name}
                      </p>
                      <p>
                        <strong>WhatsApp:</strong> {currentUser.phone}
                      </p>
                      <p>
                        <strong>NIK e-KTP:</strong> {currentUser.nik}
                      </p>
                      <p>
                        <strong>No. SIM A:</strong> {currentUser.simA}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Tujuan Penggunaan Mobil (Diperiksa oleh Admin)
                    </label>
                    <input
                      type="text"
                      value={rentalPurpose}
                      onChange={(e) => setRentalPurpose(e.target.value)}
                      placeholder="Contoh: Perjalanan Dinas / Wisata Keluarga Bandung"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>
                    Sewa Pokok ({activeQuote.packageLabel} x {multiplier})
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {formatIDR(activeQuote.baseCost)}
                  </span>
                </div>
                {activeQuote.driverCost > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Jasa Supir Profesional</span>
                    <span className="font-semibold text-zinc-900">
                      {formatIDR(activeQuote.driverCost)}
                    </span>
                  </div>
                )}
                {activeQuote.deliveryCost > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Biaya Antar Unit</span>
                    <span className="font-semibold text-zinc-900">
                      {formatIDR(activeQuote.deliveryCost)}
                    </span>
                  </div>
                )}
                {activeQuote.depositCost > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Deposit Jaminan Lepas Kunci (Refundable)</span>
                    <span className="font-semibold text-zinc-900">
                      {formatIDR(activeQuote.depositCost)}
                    </span>
                  </div>
                )}
                <div className="border-t border-zinc-200 pt-2 flex justify-between items-center text-sm font-extrabold text-zinc-900">
                  <span>Total Pembayaran</span>
                  <span className="text-orange-600 text-base">
                    {formatIDR(activeQuote.grandTotal)}
                  </span>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                {checkoutStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="px-4 py-2.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700"
                  >
                    Kembali ke Jadwal
                  </button>
                )}
                {checkoutStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(2)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-1.5"
                  >
                    Lanjut Verifikasi Data
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg"
                  >
                    Konfirmasi & Terbitkan E-Tiket
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}