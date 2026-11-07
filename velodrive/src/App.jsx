import React, { useState, useEffect } from 'react';
import {
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
} from './constants/rentalData';
import { apiService } from './services/api';
import UserStorefrontPage from './pages/UserStorefrontPage';
import UserAuthPage from './pages/UserAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  // 'USER_PAGE' | 'AUTH_PAGE' | 'ADMIN_PAGE'
  const [currentRoute, setCurrentRoute] = useState('USER_PAGE');

  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  const [currentUser, setCurrentUser] = useState(null);
  const [pendingVehicleToBook, setPendingVehicleToBook] = useState(null);
  const [initialCheckoutVehicle, setInitialCheckoutVehicle] = useState(null);

  // Sinkronisasi otomatis dengan Backend Node.js + PostgreSQL jika server aktif
  useEffect(() => {
    async function loadFromBackend() {
      try {
        const [vData, bData, cData] = await Promise.all([
          apiService.fetchVehicles(),
          apiService.fetchBookings(),
          apiService.fetchCustomers(),
        ]);
        if (vData?.length) setVehicles(vData);
        if (bData?.length) setBookings(bData);
        if (cData?.length) setCustomers(cData);
      } catch {
        // Jika backend belum dinyalakan, otomatis gunakan state lokal
      }
    }
    loadFromBackend();
  }, []);

  const handleNavigateToAuth = (vehicleToBook = null) => {
    setPendingVehicleToBook(vehicleToBook);
    setCurrentRoute('AUTH_PAGE');
  };

  const handleLoginSuccess = async (email, password) => {
    let loggedUser = null;
    try {
      loggedUser = await apiService.loginUser(email, password);
    } catch {
      const found = customers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) {
        throw new Error('Email atau password tidak sesuai.');
      }
      loggedUser = found;
    }

    setCurrentUser(loggedUser);
    if (pendingVehicleToBook) {
      setInitialCheckoutVehicle(pendingVehicleToBook);
      setPendingVehicleToBook(null);
    }
    setCurrentRoute('USER_PAGE');
  };

  const handleRegisterSuccess = async (regForm) => {
    let createdUser = null;
    try {
      createdUser = await apiService.registerUser(regForm);
    } catch {
      createdUser = {
        id: `USR-0${customers.length + 1}`,
        ...regForm,
        verified: false,
        joinedAt: 'Baru Saja',
      };
    }

    setCustomers((prev) => [createdUser, ...prev]);
    setCurrentUser(createdUser);
    if (pendingVehicleToBook) {
      setInitialCheckoutVehicle(pendingVehicleToBook);
      setPendingVehicleToBook(null);
    }
    setCurrentRoute('USER_PAGE');
  };

  const handleCreateBooking = async (bookingPayload) => {
    try {
      const saved = await apiService.createBooking(bookingPayload);
      setBookings((prev) => [saved, ...prev]);
    } catch {
      const localBooking = {
        id: `BK-0${bookings.length + 1}`,
        code: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        ...bookingPayload,
        status: 'PENDING_VERIFICATION',
        createdAt: 'Baru Saja',
      };
      setBookings((prev) => [localBooking, ...prev]);
    }
  };

  const handleUpdateBookingStatus = async (bookingCode, nextStatus) => {
    try {
      const updated = await apiService.updateBookingStatus(bookingCode, nextStatus);
      setBookings((prev) => prev.map((b) => (b.code === bookingCode ? updated : b)));
      return updated;
    } catch {
      let targetBooking = null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.code === bookingCode) {
            targetBooking = { ...b, status: nextStatus };
            return targetBooking;
          }
          return b;
        })
      );
      if (targetBooking) {
        if (nextStatus === 'ON_TRIP') {
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === targetBooking.vehicleId ? { ...v, status: 'RENTED' } : v
            )
          );
        } else if (nextStatus === 'COMPLETED' || nextStatus === 'CANCELLED') {
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === targetBooking.vehicleId ? { ...v, status: 'AVAILABLE' } : v
            )
          );
        }
      }
      return targetBooking;
    }
  };

  const handleToggleCustomerVerify = async (customerId, verified) => {
    try {
      const updated = await apiService.toggleVerifyCustomer(customerId, verified);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));
    } catch {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, verified } : c))
      );
    }
  };

  const handleUpdateVehicleStatus = async (vehicleId, status) => {
    try {
      const updated = await apiService.updateVehicleStatus(vehicleId, status);
      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? updated : v)));
    } catch {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
      );
    }
  };

  const handleUpdateVehicleImage = async (vehicleId, imageUrl) => {
    try {
      const updated = await apiService.updateVehicleImage(vehicleId, imageUrl);
      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? updated : v)));
    } catch {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, imageUrl } : v))
      );
    }
  };

  const handleCreateVehicle = async (newVehicle) => {
    try {
      const created = await apiService.createVehicle(newVehicle);
      setVehicles((prev) => [created, ...prev]);
    } catch {
      setVehicles((prev) => [newVehicle, ...prev]);
    }
  };

  return (
    <div>
      {/* BAR SIMULASI NAVIGASI ANTAR HALAMAN TERPISAH */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-600 font-bold text-[10px] uppercase">
              Mode Halaman
            </span>
            <span className="text-zinc-300">
              Pilih halaman yang ingin diuji (Pelanggan, Login User, atau Halaman Khusus Admin):
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentRoute('USER_PAGE')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                currentRoute === 'USER_PAGE'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              1. Halaman Pelanggan (User)
            </button>
            <button
              onClick={() => setCurrentRoute('AUTH_PAGE')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                currentRoute === 'AUTH_PAGE'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              2. Halaman Login / Daftar User
            </button>
            <button
              onClick={() => setCurrentRoute('ADMIN_PAGE')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                currentRoute === 'ADMIN_PAGE'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              3. Halaman Khusus Admin (Terpisah)
            </button>
          </div>
        </div>
      </div>

      {currentRoute === 'USER_PAGE' && (
        <UserStorefrontPage
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onNavigateToAuth={handleNavigateToAuth}
          vehicles={vehicles}
          bookings={bookings}
          onCreateBooking={handleCreateBooking}
          initialCheckoutVehicle={initialCheckoutVehicle}
          onClearInitialCheckoutVehicle={() => setInitialCheckoutVehicle(null)}
        />
      )}

      {currentRoute === 'AUTH_PAGE' && (
        <UserAuthPage
          pendingVehicleToBook={pendingVehicleToBook}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          onBackToStorefront={() => setCurrentRoute('USER_PAGE')}
        />
      )}

      {currentRoute === 'ADMIN_PAGE' && (
        <AdminDashboardPage
          vehicles={vehicles}
          bookings={bookings}
          customers={customers}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onToggleCustomerVerify={handleToggleCustomerVerify}
          onUpdateVehicleStatus={handleUpdateVehicleStatus}
          onUpdateVehicleImage={handleUpdateVehicleImage}
          onCreateVehicle={handleCreateVehicle}
        />
      )}
    </div>
  );
}