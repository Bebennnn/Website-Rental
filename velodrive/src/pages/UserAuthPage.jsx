import React, { useState } from 'react';
import { Car, CheckCircle2 } from 'lucide-react';
import { formatIDR } from '../utils/pricing';

export default function UserAuthPage({
  pendingVehicleToBook,
  onLoginSuccess,
  onRegisterSuccess,
  onBackToStorefront,
}) {
  const [authTab, setAuthTab] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [loginEmail, setLoginEmail] = useState('rizky@mahasiswa.ac.id');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [authError, setAuthError] = useState('');

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nik: '',
    simA: '',
    address: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await onLoginSuccess(loginEmail, loginPassword);
    } catch (err) {
      setAuthError(err.message || 'Email atau password tidak sesuai.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regForm.name || !regForm.email || !regForm.phone || !regForm.nik || !regForm.simA) {
      setAuthError('Harap lengkapi seluruh data profil, NIK e-KTP, dan Nomor SIM A.');
      return;
    }
    try {
      await onRegisterSuccess(regForm);
    } catch (err) {
      setAuthError(err.message || 'Gagal mendaftarkan akun.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Panel Kiri: Informasi Alur Sewa */}
        <div className="lg:col-span-5 bg-zinc-900 text-white p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">VeloDrive Indonesia</span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Portal Akun Penyewa
              </span>
              <h2 className="text-2xl font-extrabold mt-1 leading-snug">
                Satu Akun untuk Sewa Mobil di Seluruh Kota
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Data e-KTP dan SIM A Anda tersimpan aman agar proses pemesanan berikutnya tidak
                perlu mengisi ulang dokumen.
              </p>
            </div>

            {pendingVehicleToBook && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Mobil yang Akan Anda Sewa:
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={pendingVehicleToBook.imageUrl}
                    alt={pendingVehicleToBook.name}
                    className="w-16 h-12 rounded object-cover bg-zinc-700 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-xs text-white">{pendingVehicleToBook.name}</p>
                    <p className="text-xs text-orange-400 font-bold">
                      {formatIDR(pendingVehicleToBook.rates.PKG_24H)} / 24 Jam
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Begitu berhasil masuk, Anda langsung diarahkan ke formulir checkout mobil ini.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> Verifikasi e-KTP & SIM A cepat
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> E-Tiket resmi langsung terbit
            </p>
          </div>
        </div>

        {/* Panel Kanan: Form Login / Registrasi */}
        <div className="lg:col-span-7 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex rounded-lg bg-zinc-100 p-1 border border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('LOGIN');
                  setAuthError('');
                }}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                  authTab === 'LOGIN' ? 'bg-orange-600 text-white' : 'text-zinc-600'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('REGISTER');
                  setAuthError('');
                }}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                  authTab === 'REGISTER' ? 'bg-orange-600 text-white' : 'text-zinc-600'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            <button
              type="button"
              onClick={onBackToStorefront}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
            >
              ← Kembali ke Katalog
            </button>
          </div>

          {authTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Masuk sebagai Penyewa</h3>
                <p className="text-xs text-zinc-500">
                  Gunakan akun demo yang sudah disiapkan atau akun yang baru Anda daftarkan.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-orange-900">Akun Demo Mahasiswa (Siap Pakai):</p>
                  <p className="text-orange-800">
                    Email: <strong>rizky@mahasiswa.ac.id</strong> | Pass: <strong>123456</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('rizky@mahasiswa.ac.id');
                    setLoginPassword('123456');
                  }}
                  className="bg-orange-600 text-white font-semibold px-3 py-1.5 rounded text-[11px]"
                >
                  Isi Otomatis
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              {authError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                {pendingVehicleToBook ? 'Masuk & Lanjut Sewa Mobil' : 'Masuk ke Akun Penyewa'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Registrasi Penyewa Baru</h3>
                <p className="text-xs text-zinc-500">
                  Isi identitas sesuai e-KTP & SIM A untuk kelancaran verifikasi lepas kunci.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nama Lengkap (Sesuai KTP)
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="0812xxxxxxx"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email Aktif
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Buat Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nomor NIK e-KTP (16 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.nik}
                    onChange={(e) => setRegForm({ ...regForm, nik: e.target.value })}
                    placeholder="3273xxxxxxxxxxxx"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nomor SIM A
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.simA}
                    onChange={(e) => setRegForm({ ...regForm, simA: e.target.value })}
                    placeholder="1205xxxxxxxx"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Alamat Domisili Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Jl. Sukabirus No. 12, Bandung"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>

              {authError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Daftar & Masuk Sekarang
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}