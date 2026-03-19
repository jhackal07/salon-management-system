require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bookingRoutes = require('./routes/bookingRoutes');
const artistRoutes = require('./routes/artistRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/health', healthRoutes);

const db = require('./db');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Salon API running on port ${port}`);
  if (db.isDbConfigured()) {
    console.log('Database: connected (PostgreSQL)');
  } else {
    console.log('Database: using in-memory store (set DATABASE_URL or PG_* for PostgreSQL)');
  }
});
