
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import StorefrontHeader from '../components/storefront/StorefrontHeader';
import HeroSection from '../components/storefront/HeroSection';
import CatalogFilter from '../components/storefront/CatalogFilter';
import VehicleCard from '../components/storefront/VehicleCard';
import BookingHistory from '../components/storefront/BookingHistory';
import CheckoutModal from '../components/storefront/CheckoutModal';
import BrowseSection from '../components/storefront/BrowseSection';

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
  calculateRentalPrice,
  getCategoryLabel,
} from '../utils/pricing';
import { filterVehiclesByCategory } from '../utils/filter';
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
  const [userSubView, setUserSubView] = useState('HOME');

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
  const [selectedVehicle, setSelectedVehicle] = useState(
    initialCheckoutVehicle || null
  );
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [deliveryId, setDeliveryId] = useState('PICKUP_GARAGE');

  // Menghasilkan waktu lokal untuk penyewaan
  const getCurrentLocalDateTime = () => {
    const now = new Date();

    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() + 1);

    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);
  };

  const [startDateTime, setStartDateTime] = useState(
    () => getCurrentLocalDateTime()
  );

  const [pickupHub, setPickupHub] = useState(
    'Garasi Pasteur & Stasiun Bandung'
  );

  const [rentalPurpose, setRentalPurpose] = useState(
    'Kebutuhan Perjalanan Dalam Kota / Keluarga'
  );

  const [formError, setFormError] = useState('');

  // Filter kendaraan
  const filteredVehicles = useMemo(() => {
    const categoryVehicles =
      selectedCategory === 'ALL'
        ? vehicles
        : filterVehiclesByCategory(vehicles, selectedCategory);

    return categoryVehicles.filter((v) => {
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

      return (
        matchBrand &&
        matchCategory &&
        matchBranch &&
        matchTrans &&
        matchBudget &&
        matchQuery
      );
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

  // Riwayat booking pengguna
  const myBookings = useMemo(() => {
    if (!currentUser) return [];

    return bookings.filter((b) => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  // Perhitungan estimasi biaya sewa
  const activeQuote = useMemo(() => {
    if (!selectedVehicle) return null;
    const quote = calculateRentalQuote({
      vehicle: selectedVehicle,
      packageId: activePackageId,
      multiplier,
      serviceId: activeServiceId,
      deliveryId,
    });

    if (!quote) return null;

    const baseCost = calculateRentalPrice(quote.unitRate, Number(multiplier));
    return {
      ...quote,
      baseCost,
      grandTotal: baseCost + quote.driverCost + quote.deliveryCost + quote.depositCost,
    };
  }, [selectedVehicle, activePackageId, multiplier, activeServiceId, deliveryId]);
  const estimatedEndDateTime = useMemo(() => {
    if (!activeQuote) return '';

    return computeEndDateTime(
      startDateTime,
      activeQuote.totalHours
    );
  }, [startDateTime, activeQuote]);

  // Membuka formulir pemesanan kendaraan
  const handleBookVehicleClick = (vehicle) => {
    setFormError('');

    // Perbarui waktu setiap kali checkout dibuka
    setStartDateTime(getCurrentLocalDateTime());

    const branchObj = BRANCHES.find(
      (b) => b.id === vehicle.branchId
    );

    if (branchObj) {
      setPickupHub(branchObj.hubName);
    }

    if (!currentUser) {
      onNavigateToAuth(vehicle);
      return;
    }

    setSelectedVehicle(vehicle);
    setCheckoutStep(1);
  };

  // Menutup formulir checkout
  const closeCheckoutModal = () => {
    setSelectedVehicle(null);

    if (onClearInitialCheckoutVehicle) {
      onClearInitialCheckoutVehicle();
    }
  };

  // Validasi sebelum melanjutkan checkout
  const handleCheckoutStepChange = (nextStep) => {
    setFormError('');

    if (nextStep === 2) {
      const start = new Date(startDateTime);

      // Validasi tanggal kosong atau tidak valid
      if (
        !startDateTime ||
        Number.isNaN(start.getTime())
      ) {
        setFormError(
          'Waktu mulai penyewaan tidak valid.'
        );
        return;
      }

      // Validasi waktu mulai tidak boleh di masa lalu
      if (start.getTime() <= Date.now()) {
        setFormError(
          'Waktu mulai penyewaan harus lebih dari waktu sekarang.'
        );
        return;
      }

      // Validasi durasi penyewaan
      if (!activeQuote || activeQuote.totalHours <= 0) {
        setFormError(
          'Durasi penyewaan tidak valid.'
        );
        return;
      }
    }

    setCheckoutStep(nextStep);
  };

  // Konfirmasi pemesanan kendaraan
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!currentUser || !selectedVehicle || !activeQuote) {
      return;
    }

    if (!rentalPurpose.trim()) {
      setFormError(
        'Mohon isi tujuan pemakaian kendaraan untuk verifikasi admin.'
      );
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

  // Mengaktifkan atau menonaktifkan favorit
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Mengatur ulang filter kendaraan
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

      <StorefrontHeader
        currentUser={currentUser}
        userSubView={userSubView}
        bookingCount={myBookings.length}
        onHome={() => setUserSubView('HOME')}
        onBookings={() => setUserSubView('MY_BOOKINGS')}
        onNavigateToAuth={onNavigateToAuth}
        onLogout={onLogout}
      />

      {/* SUB-VIEW 1: BERANDA & KATALOG */}
      {userSubView === 'HOME' && (
        <main>

          {/* HERO SECTION */}
          <HeroSection
            currentUser={currentUser}
            onViewBookings={() => setUserSubView('MY_BOOKINGS')}
            onNavigateToAuth={onNavigateToAuth}
            featuredVehicle={vehicles[3] || vehicles[0]}
            onBookVehicle={handleBookVehicleClick}
          />

          <CatalogFilter
            searchTab={searchTab}
            onSearchTabChange={(tab) => {
              setSearchTab(tab);
              setSelectedCategory(
                tab === 'ALL' ? 'ALL' : tab
              );
            }}
            activePackageId={activePackageId}
            packages={RENTAL_PACKAGES}
            onPackageChange={setActivePackageId}
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTransmission={selectedTransmission}
            onTransmissionChange={setSelectedTransmission}
            maxBudget={maxBudget}
            onBudgetChange={setMaxBudget}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            brands={POPULAR_BRANDS}
            categories={INDONESIAN_CAR_CATEGORIES}
            branches={BRANCHES}
          />

          {/* KATALOG MOBIL */}
          <section
            id="katalog-mobil"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  Pilihan Mobil Siap Jalan
                </h2>

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
                {filteredVehicles.map((car) => (
                  <VehicleCard
                    key={car.id}
                    vehicle={car}
                    activePrice={formatIDR(
                      car.rates[activePackageId] || car.rates.PKG_24H
                    )}
                    packageLabel={
                      RENTAL_PACKAGES[activePackageId].shortLabel
                    }
                    categoryLabel={getCategoryLabel(car.category)}
                    branchName={
                      BRANCHES.find((b) => b.id === car.branchId)?.city ||
                      car.branchId
                    }
                    isAvailable={car.status === 'AVAILABLE'}
                    isFavorite={favorites.includes(car.id)}
                    onToggleFavorite={toggleFavorite}
                    onBook={handleBookVehicleClick}
                  />
                ))}
              </div>
            )}
          </section>

          <BrowseSection
            brands={POPULAR_BRANDS}
            categories={INDONESIAN_CAR_CATEGORIES}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onBrandChange={setSelectedBrand}
            onCategoryChange={setSelectedCategory}
          />

        </main>
      )}

      {/* SUB-VIEW 2: PESANAN SAYA */}
      {userSubView === 'MY_BOOKINGS' && (
        <BookingHistory
          currentUser={currentUser}
          bookings={myBookings}
          onLogin={() => onNavigateToAuth(null)}
          onBrowse={() => setUserSubView('HOME')}
          serviceTypes={SERVICE_TYPES}
          formatDateTime={formatDateTime}
          formatIDR={formatIDR}
        />
      )}

      {/* MODAL CHECKOUT */}
      <CheckoutModal
        vehicle={selectedVehicle}
        quote={activeQuote}
        user={currentUser}
        step={checkoutStep}
        packages={RENTAL_PACKAGES}
        services={SERVICE_TYPES}
        deliveryModes={DELIVERY_MODES}
        activePackageId={activePackageId}
        activeServiceId={activeServiceId}
        multiplier={multiplier}
        deliveryId={deliveryId}
        startDateTime={startDateTime}
        pickupHub={pickupHub}
        rentalPurpose={rentalPurpose}
        estimatedEndDateTime={estimatedEndDateTime}
        formError={formError}
        onClose={closeCheckoutModal}
        onSubmit={handleConfirmBooking}
        onPackageChange={setActivePackageId}
        onServiceChange={setActiveServiceId}
        onMultiplierChange={setMultiplier}
        onStartChange={setStartDateTime}
        onDeliveryChange={setDeliveryId}
        onPickupChange={setPickupHub}
        onPurposeChange={setRentalPurpose}
        onStepChange={handleCheckoutStepChange}
        formatIDR={formatIDR}
        formatDateTime={formatDateTime}
      />

    </div>
  );
}
