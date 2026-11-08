const API_BASE_URL = 'http://localhost:4000/api/v1';

async function request(endpoint, options = {}) {
  // 1. Ambil token dari memori browser
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 2. Selipkan token ke header jika ada
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json();
  
  if (!response.ok || !payload.success) {
    const error = new Error(payload.message || 'Terjadi kesalahan pada server.');
    error.status = response.status;
    throw error;
  }

  // 3. AUTO-SAVE TOKEN (Sangat Penting)
  // Menangkap token dari backend terlepas dari bagaimana tim Anda memformat datanya
  if (payload.token) {
    localStorage.setItem('token', payload.token);
  } else if (payload.data && payload.data.token) {
    localStorage.setItem('token', payload.data.token);
  }
  
  return payload.data !== undefined ? payload.data : payload;
}

export const apiService = {
  fetchVehicles: () => request('/vehicles'),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicleStatus: (id, status) =>
    request(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateVehicleImage: (id, imageUrl) =>
    request(`/vehicles/${id}/image`, { method: 'PATCH', body: JSON.stringify({ imageUrl }) }),
  updateVehicleServiceSchedule: (id, schedule) =>
    request(`/vehicles/${id}/service-schedule`, { method: 'PATCH', body: JSON.stringify(schedule) }),

  fetchBookings: () => request('/bookings'),
  checkAvailability: (data) => 
    request('/bookings/check-availability', { method: 'POST', body: JSON.stringify(data) }),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (code, status) =>
    request(`/bookings/${code}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancelBooking: (code, userId) =>
    request(`/bookings/${code}/cancel`, { method: 'PATCH', body: JSON.stringify({ userId }) }),
  updateBookingPayment: (code, paidAmount) =>
    request(`/bookings/${code}/payment`, { method: 'PATCH', body: JSON.stringify({ paidAmount }) }),

  fetchCustomers: () => request('/customers'),
  toggleVerifyCustomer: (id, verified) =>
    request(`/customers/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ verified }) }),
  updateCustomerAccountStatus: (id, accountStatus) =>
    request(`/customers/${id}/account-status`, { method: 'PATCH', body: JSON.stringify({ accountStatus }) }),

  loginUser: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  registerUser: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};