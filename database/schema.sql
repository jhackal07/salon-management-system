-- Salon Management System – PostgreSQL schema
-- Run: psql -U postgres -d salon_db -f database/schema.sql

-- Drop in reverse dependency order
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS artists;

-- Users (customers + admin). Passwords are stored hashed (bcrypt) by the app.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(200),
  role VARCHAR(20) DEFAULT 'customer'
);

-- Artists / staff (status: active, on_leave, inactive; inactive = soft delete)
-- gender: male/female for default avatar on Team page
CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  on_leave_from DATE,
  on_leave_to DATE
);

-- Services / treatments
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price FLOAT DEFAULT 0,
  duration INT DEFAULT 60
);

-- Appointments (bookings)
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  service_id INT NOT NULL REFERENCES services(id),
  artist_id INT NOT NULL REFERENCES artists(id),
  booking_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  guest_name VARCHAR(100),
  guest_email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_date ON appointments(booking_date);
CREATE INDEX idx_appointments_booking_number ON appointments(booking_number);

-- Seed artists (all active; gender for Team page avatar)
INSERT INTO artists (name, status, gender) VALUES
  ('Jane Doe', 'active', 'female'),
  ('Maria Garcia', 'active', 'female'),
  ('Sarah Lee', 'active', 'female'),
  ('Emma Wilson', 'active', 'female');

-- Seed services
INSERT INTO services (name, duration, price) VALUES
  ('Facial', 60, 80),
  ('Hair Styling', 45, 50),
  ('Nail Care', 45, 40),
  ('Makeup', 60, 70),
  ('Massage', 90, 120),
  ('Waxing', 30, 35);

-- Seed users with PLAIN passwords. After first run, execute from salon-backend:
--   node scripts/hash-seed-passwords.js
-- to replace them with bcrypt hashes so login works.
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@salon.com', 'admin123', 'admin'),
  ('Jane Customer', 'customer@example.com', 'customer123', 'customer');
