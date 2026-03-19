const router = require('express').Router();
const db = require('../db');
const store = require('../data/store');

/** Parse Bearer token "salon-<userId>-<timestamp>" to get userId (number) or null */
function getUserIdFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  const parts = token.split('-');
  if (parts.length < 3 || parts[0] !== 'salon') return null;
  const id = parseInt(parts[1], 10);
  return Number.isFinite(id) ? id : null;
}

function generateBookingNumber(bookingDate, seq) {
  const datePart = (bookingDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  return `BKG-${datePart}-${String(seq).padStart(4, '0')}`;
}

/** True if the given date + time is in the past (cannot book). Uses server local time. */
function isPastBooking(dateStr, timeStr) {
  if (!dateStr || !timeStr) return true;
  const timeNormalized = String(timeStr).trim().length >= 5 ? timeStr : `${timeStr}:00`;
  const bookingLocal = new Date(`${dateStr}T${timeNormalized}`);
  if (Number.isNaN(bookingLocal.getTime())) return true;
  return bookingLocal.getTime() <= Date.now();
}

router.post('/', async (req, res) => {
  const { date, time, serviceId, artistId, guestName, guestEmail, userId } = req.body;
  if (!date || !time || !serviceId || !artistId) {
    return res.status(400).json({ error: 'Missing required fields: date, time, serviceId, artistId' });
  }
  if (isPastBooking(date, time)) {
    return res.status(400).json({ error: 'Cannot book an appointment in the past. Please choose a future date and time.' });
  }
  try {
    if (db.isDbConfigured()) {
      const artistResult = await db.query('SELECT id, name FROM artists WHERE id = $1', [Number(artistId)]);
      const serviceResult = await db.query('SELECT id, name FROM services WHERE id = $1', [Number(serviceId)]);
      if (artistResult.rows.length === 0 || serviceResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid artist or service' });
      }
      const artist = artistResult.rows[0];
      const service = serviceResult.rows[0];
      const insertParams = [userId || null, Number(serviceId), Number(artistId), date, time, guestName || null, guestEmail || null];
      const datePart = date.replace(/-/g, '');
      const numberPrefix = `BKG-${datePart}-`;
      const maxRetries = 5;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const nextResult = await db.query(
          `SELECT (COALESCE(MAX(
            NULLIF(REGEXP_REPLACE(booking_number, '^BKG-[0-9]+-', ''), '')::int
          ), 0) + 1)::int AS next_seq
           FROM appointments WHERE booking_number LIKE $1`,
          [numberPrefix + '%']
        );
        const seq = nextResult.rows[0]?.next_seq ?? 1;
        const bookingNumber = generateBookingNumber(date, seq);
        try {
          await db.query(
            `INSERT INTO appointments (user_id, service_id, artist_id, booking_date, time_slot, booking_number, guest_name, guest_email, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')`,
            [...insertParams.slice(0, 5), bookingNumber, ...insertParams.slice(5)]
          );
          const row = (await db.query(
            "SELECT id, booking_number, TO_CHAR(booking_date, 'YYYY-MM-DD') AS date, time_slot AS time, guest_name AS \"guestName\", guest_email AS \"guestEmail\", status FROM appointments WHERE booking_number = $1",
            [bookingNumber]
          )).rows[0];
          return res.status(201).json({
            message: 'Appointment booked successfully',
            bookingNumber,
            booking: {
              date: row.date,
              time: row.time,
              serviceName: service.name,
              artistName: artist.name,
              guestName: row.guestName,
              guestEmail: row.guestEmail,
              status: row.status,
            },
          });
        } catch (err) {
          if (err.code === '23505' && err.constraint === 'appointments_booking_number_key') {
            if (attempt === maxRetries - 1) {
              return res.status(409).json({ error: 'Booking conflict. Please try again.' });
            }
            continue;
          }
          throw err;
        }
      }
    }
    const artist = store.artists.find((a) => a.id === Number(artistId));
    const service = store.services.find((s) => s.id === Number(serviceId));
    if (!artist || !service) {
      return res.status(400).json({ error: 'Invalid artist or service' });
    }
    const bookingNumber = store.generateBookingNumber();
    const booking = {
      id: store.bookings.length + 1,
      bookingNumber,
      date,
      time,
      serviceId: Number(serviceId),
      serviceName: service.name,
      artistId: Number(artistId),
      artistName: artist.name,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      userId: userId || null,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    store.bookings.push(booking);
    res.status(201).json({
      message: 'Appointment booked successfully',
      bookingNumber,
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        `SELECT a.id, a.booking_number AS "bookingNumber", TO_CHAR(a.booking_date, 'YYYY-MM-DD') AS date, a.time_slot AS time,
                a.guest_name AS "guestName", a.guest_email AS "guestEmail", a.status,
                s.name AS "serviceName", ar.name AS "artistName"
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         JOIN artists ar ON a.artist_id = ar.id
         ORDER BY a.booking_date DESC, a.time_slot`
      );
      const rows = result.rows.map((r) => ({
        id: r.id,
        bookingNumber: r.bookingNumber,
        date: r.date,
        time: r.time,
        serviceName: r.serviceName,
        artistName: r.artistName,
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        status: r.status,
      }));
      return res.json(rows);
    }
    res.json(store.bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

const ALLOWED_STATUSES = ['confirmed', 'in_progress', 'cancelled', 'paid'];

router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!Number.isFinite(id) || !status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid id or status. Use: confirmed, in_progress, cancelled, paid' });
  }
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id, booking_number, TO_CHAR(booking_date, 'YYYY-MM-DD') AS date, time_slot AS time, status",
        [status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      return res.json({ id, status, booking: result.rows[0] });
    }
    const b = store.bookings.find((x) => x.id === id);
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    b.status = status;
    return res.json({ id, status, booking: b });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Logged-in user's own bookings (requires Authorization: Bearer salon-<userId>-<timestamp>)
router.get('/mine', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'Sign in to view your bookings' });
  }
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        `SELECT a.id, a.booking_number AS "bookingNumber", TO_CHAR(a.booking_date, 'YYYY-MM-DD') AS date, a.time_slot AS time,
                a.guest_name AS "guestName", a.guest_email AS "guestEmail", a.status,
                s.name AS "serviceName", ar.name AS "artistName"
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         JOIN artists ar ON a.artist_id = ar.id
         WHERE a.user_id = $1
         ORDER BY a.booking_date DESC, a.time_slot`,
        [userId]
      );
      const rows = result.rows.map((r) => ({
        id: r.id,
        bookingNumber: r.bookingNumber,
        date: r.date,
        time: r.time,
        serviceName: r.serviceName,
        artistName: r.artistName,
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        status: r.status,
      }));
      return res.json(rows);
    }
    const mine = store.bookings.filter((b) => b.userId === userId);
    res.json(mine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load your bookings' });
  }
});

module.exports = router;
