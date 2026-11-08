const API_BASE_URL = 'http://localhost:4000/api/v1';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    const error = new Error(payload.message || 'Terjadi kesalahan pada server.');
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

export const apiService = {
  fetchVehicles: () => request('/vehicles'),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicleStatus: (id, status) =>
    request(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateVehicleImage: (id, imageUrl) =>
    request(`/vehicles/${id}/image`, { method: 'PATCH', body: JSON.stringify({ imageUrl }) }),
  updateVehicleServiceSchedule: (id, schedule) =>
    request(`/vehicles/${id}/service-schedule`, {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    }),

  fetchBookings: () => request('/bookings'),
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