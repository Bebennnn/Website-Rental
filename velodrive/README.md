# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Fitur Anggota 4 — Manajemen Booking dan Penyewa

Implementasi mencakup Backend Express/PostgreSQL dan Frontend React:

1. **Ubah Status Booking (Admin):** transisi status divalidasi oleh service backend. Alur yang didukung: `PENDING_VERIFICATION` → `CONFIRMED` → `ON_TRIP` → `COMPLETED`. Status `CANCELLED` dapat dicapai dari status menunggu atau disetujui.
2. **Batalkan Booking (Penyewa):** penyewa hanya dapat membatalkan booking miliknya sendiri ketika status masih menunggu verifikasi atau disetujui dan kendaraan belum digunakan.
3. **Cek Pembayaran:** admin dapat memperbarui jumlah pembayaran yang diterima. Backend menghitung `UNPAID`, `PARTIAL`, atau `PAID` dan sisa tagihan.
4. **Validasi Data Penyewa:** backend memeriksa kelengkapan nama, email, telepon, NIK 16 digit, SIM A 8–16 digit, alamat, serta verifikasi admin sebelum booking dibuat.
5. **Cek Status User:** admin dapat mengaktifkan atau memblokir akun. Akun terblokir tidak dapat membuat booking.

### Menjalankan migrasi database

Jalankan file `backend/migrations/dbvelo.sql` pada database PostgreSQL `velodrive_db`. Untuk database yang sudah pernah dibuat, bagian `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` menambahkan kolom `users.account_status`, `bookings.paid_amount`, dan `bookings.payment_status`.

### Endpoint tambahan

- `PATCH /api/v1/bookings/:code/cancel` — body `{ "userId": "USR-01" }`
- `PATCH /api/v1/bookings/:code/payment` — body `{ "paidAmount": 150000 }`
- `PATCH /api/v1/customers/:id/account-status` — body `{ "accountStatus": "ACTIVE" }` atau `BLOCKED`

Endpoint admin masih mengikuti pola otorisasi frontend yang sudah ada pada project awal. Untuk deployment produksi, seluruh endpoint admin perlu dilindungi middleware autentikasi dan role di backend; jangan menganggap pemeriksaan role pada React sebagai pengamanan server.
