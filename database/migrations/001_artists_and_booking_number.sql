-- Run only if you already have the OLD schema (users, services, appointments without artists/booking_number).
-- New setups: use schema.sql instead.

-- Add artists table if not exists
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO artists (name) VALUES
  ('Jane Doe'), ('Maria Garcia'), ('Sarah Lee'), ('Emma Wilson');

-- Add new columns to appointments (adjust if your table differs)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS artist_id INT REFERENCES artists(id),
  ADD COLUMN IF NOT EXISTS booking_number VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS booking_date DATE,
  ADD COLUMN IF NOT EXISTS time_slot VARCHAR(10),
  ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(100),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Backfill booking_number for existing rows if needed
-- UPDATE appointments SET booking_number = 'BKG-' || id WHERE booking_number IS NULL;
