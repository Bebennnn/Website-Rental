const STATUS_LABELS = {
  ALL: 'Semua',
  PENDING_VERIFICATION: 'Perlu Verifikasi',
  CONFIRMED: 'Disetujui',
  ON_TRIP: 'Sedang Disewa',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  AVAILABLE: 'Tersedia',
  RENTED: 'Disewa',
  MAINTENANCE: 'Perawatan',
};

export function translateStatus(status) {
  return STATUS_LABELS[status] || 'Status tidak diketahui';
}

export default STATUS_LABELS;
