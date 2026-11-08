import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
} from './constants/rentalData';
import { apiService } from './services/api';
import UserStorefrontPage from './pages/UserStorefrontPage';
import UserAuthPage from './pages/UserAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { updateVehicleStatus } from './utils/vehicleManagement';

export default function App() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      sessionStorage.removeItem('user');
      return null;
    }
  });
  const [pendingVehicleToBook, setPendingVehicleToBook] = useState(null);
  const [initialCheckoutVehicle, setInitialCheckoutVehicle] = useState(null);

  const handleNavigateToAuth = (vehicleToBook = null) => {
    setPendingVehicleToBook(vehicleToBook);
    navigate('/');
  };

  const handleLoginSuccess = async (email, password, role = 'TENANT') => {
    if (role === 'ADMIN') {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@velodrive.id';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'adminvelodrive2026';
      if (!adminEmail || !adminPassword) {
        throw new Error('Konfigurasi akun admin belum tersedia.');
      }
      if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPassword) {
        throw new Error('Email atau password admin tidak sesuai.');
      }
      const adminUser = { id: 'ADMIN-01', name: 'Admin Operasional Pusat', email, role: 'ADMIN' };
      setCurrentUser(adminUser);
      sessionStorage.setItem('user', JSON.stringify(adminUser));

      try {
        const [vData, bData, cData] = await Promise.all([
          apiService.fetchVehicles(),
          apiService.fetchBookings(),
          apiService.fetchCustomers(),
        ]);
        if (vData?.length) setVehicles(vData);
        if (bData?.length) setBookings(bData);
        if (cData?.length) setCustomers(cData);
      } catch (error) {
        console.warn('Gagal tarik data untuk Admin (mungkin karena Token JWT hilang):', error);
      }
      return;
    }

    let loggedUser;
    try {
      // Panggil API Login
      const response = await apiService.loginUser(email, password);
      
      // 1. SIMPAN TOKEN KE LOCAL STORAGE
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }

      loggedUser = response.user || response;

      // 2. AMBIL DATA DARI BACKEND HANYA SETELAH TOKEN TERSIMPAN
      const [vData, bData, cData] = await Promise.all([
        apiService.fetchVehicles(),
        apiService.fetchBookings(),
        apiService.fetchCustomers(),
      ]);
      if (vData?.length) setVehicles(vData);
      if (bData?.length) setBookings(bData);
      if (cData?.length) setCustomers(cData);

    } catch {
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
      const found = customers.find(
        (c) => c.email.trim().toLowerCase() === email.trim().toLowerCase()
      );
      if (!found) {
        throw new Error('Email atau password tidak sesuai.');
      }
      loggedUser = found;
    }

    setCurrentUser(loggedUser);
    sessionStorage.setItem('user', JSON.stringify(loggedUser));
    if (pendingVehicleToBook) {
      setInitialCheckoutVehicle(pendingVehicleToBook);
      setPendingVehicleToBook(null);
    }
  };

  const handleRegisterSuccess = async (regForm) => {
    let createdUser;
    try {
      const response = await apiService.registerUser(regForm);
      
      // SIMPAN TOKEN KE LOCAL STORAGE JIKA REGISTRASI MENGEMBALIKAN TOKEN
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }
      
      createdUser = response.user || response;
    } catch {
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
      createdUser = {
        id: `USR-0${customers.length + 1}`,
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        nik: regForm.nik,
        simA: regForm.simA,
        address: regForm.address,
        verified: false,
        joinedAt: 'Baru Saja',
      };
    }

    const userSession = { ...createdUser };
    delete userSession.password;
    setCustomers((prev) => [userSession, ...prev]);
    setCurrentUser(userSession);
    sessionStorage.setItem('user', JSON.stringify(userSession));
    if (pendingVehicleToBook) {
      setInitialCheckoutVehicle(pendingVehicleToBook);
      setPendingVehicleToBook(null);
    }
  };

  const handleCreateBooking = async (bookingPayload) => {
    try {
      const saved = await apiService.createBooking(bookingPayload);
      setBookings((prev) => [saved, ...prev]);
    } catch (error) {
      if (error.status) throw error;
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
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
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
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

  const handleCancelBooking = async (code, userId) => {
    const updated = await apiService.cancelBooking(code, userId);
    setBookings((prev) => prev.map((booking) => booking.code === code ? updated : booking));
    return updated;
  };

  const handleUpdateBookingPayment = async (code, paidAmount) => {
    const updated = await apiService.updateBookingPayment(code, paidAmount);
    setBookings((prev) => prev.map((booking) => booking.code === code ? updated : booking));
    return updated;
  };

  const handleUpdateCustomerAccountStatus = async (customerId, accountStatus) => {
    const updated = await apiService.updateCustomerAccountStatus(customerId, accountStatus);
    setCustomers((prev) => prev.map((customer) => customer.id === customerId ? updated : customer));
    return updated;
  };

  const handleToggleCustomerVerify = async (customerId, verified) => {
    try {
      const updated = await apiService.toggleVerifyCustomer(customerId, verified);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? updated : c)));
    } catch {
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
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
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? updateVehicleStatus(v, status) : v))
      );
    }
  };

  const handleUpdateVehicleImage = async (vehicleId, imageUrl) => {
    try {
      const updated = await apiService.updateVehicleImage(vehicleId, imageUrl);
      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? updated : v)));
    } catch {
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, imageUrl } : v))
      );
    }
  };

  const handleUpdateVehicleServiceSchedule = async (vehicleId, schedule) => {
    const updated = await apiService.updateVehicleServiceSchedule(vehicleId, schedule);
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? updated : v)));
  };

  const handleCreateVehicle = async (newVehicle) => {
    try {
      const created = await apiService.createVehicle(newVehicle);
      setVehicles((prev) => [created, ...prev]);
    } catch {
      console.warn(
        'Gagal menghubungi server, memuat data lokal sebagai fallback (Mode UTS)'
      );
      setVehicles((prev) => [newVehicle, ...prev]);
    }
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <UserAuthPage
              pendingVehicleToBook={pendingVehicleToBook}
              onLoginSuccess={handleLoginSuccess}
              onRegisterSuccess={handleRegisterSuccess}
            />
          }
        />
        <Route
          path="/home"
          element={
            <UserStorefrontPage
              currentUser={currentUser}
              onLogout={() => {
                setCurrentUser(null);
                sessionStorage.removeItem('user');
                // 2. HAPUS TOKEN SAAT LOGOUT DARI HALAMAN USER
                //localStorage.removeItem('token'); 
                navigate('/');
              }}
              onNavigateToAuth={handleNavigateToAuth}
              vehicles={vehicles}
              bookings={bookings}
              onCreateBooking={handleCreateBooking}
              onCancelBooking={handleCancelBooking}
              initialCheckoutVehicle={initialCheckoutVehicle}
              onClearInitialCheckoutVehicle={() => setInitialCheckoutVehicle(null)}
            />
          }
        />
        <Route
          path="/admin"
          element={
            currentUser?.role === 'ADMIN' ? (
              <AdminDashboardPage
                vehicles={vehicles}
                bookings={bookings}
                customers={customers}
                onLogout={() => {
                  setCurrentUser(null);
                  sessionStorage.removeItem('user');
                  // 3. HAPUS TOKEN SAAT LOGOUT DARI HALAMAN ADMIN
                  localStorage.removeItem('token'); 
                  navigate('/');
                }}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateBookingPayment={handleUpdateBookingPayment}
                onUpdateCustomerAccountStatus={handleUpdateCustomerAccountStatus}
                onToggleCustomerVerify={handleToggleCustomerVerify}
                onUpdateVehicleStatus={handleUpdateVehicleStatus}
                onUpdateVehicleImage={handleUpdateVehicleImage}
                onUpdateVehicleServiceSchedule={handleUpdateVehicleServiceSchedule}
                onCreateVehicle={handleCreateVehicle}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}