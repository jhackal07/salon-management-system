// In-memory store (replace with DB when ready)
// status: active | on_leave | inactive (soft delete)
const artists = [
  { id: 1, name: 'Jane Doe', status: 'active', gender: 'female', on_leave_from: null, on_leave_to: null },
  { id: 2, name: 'Maria Garcia', status: 'active', gender: 'female', on_leave_from: null, on_leave_to: null },
  { id: 3, name: 'Sarah Lee', status: 'active', gender: 'female', on_leave_from: null, on_leave_to: null },
  { id: 4, name: 'Emma Wilson', status: 'active', gender: 'female', on_leave_from: null, on_leave_to: null },
];

function isArtistAvailableOnDate(artist, dateStr) {
  if (artist.status !== 'active') return false;
  if (!artist.on_leave_from || !artist.on_leave_to) return true;
  const d = new Date(dateStr);
  const from = new Date(artist.on_leave_from);
  const to = new Date(artist.on_leave_to);
  return d < from || d > to;
}

const services = [
  { id: 1, name: 'Facial', duration: 60, price: 80 },
  { id: 2, name: 'Hair Styling', duration: 45, price: 50 },
  { id: 3, name: 'Nail Care', duration: 45, price: 40 },
  { id: 4, name: 'Makeup', duration: 60, price: 70 },
  { id: 5, name: 'Massage', duration: 90, price: 120 },
  { id: 6, name: 'Waxing', duration: 30, price: 35 },
];

const bookings = [];
let bookingCounter = 0;

function generateBookingNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  bookingCounter += 1;
  const seq = String(bookingCounter).padStart(4, '0');
  return `BKG-${date}-${seq}`;
}

// Users for login (in-memory; passwords hashed with bcrypt)
const bcrypt = require('bcrypt');
const users = [
  { id: 1, name: 'Admin', email: 'admin@salon.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, name: 'Jane Customer', email: 'customer@example.com', password: bcrypt.hashSync('customer123', 10), role: 'customer' },
];
const adminUsers = users; // backward compatibility for admin routes

module.exports = {
  artists,
  services,
  bookings,
  users,
  adminUsers,
  generateBookingNumber,
  isArtistAvailableOnDate,
};
