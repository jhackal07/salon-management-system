const router = require('express').Router();
const db = require('../db');
const store = require('../data/store');

function today() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', async (req, res) => {
  const from = req.query.from || today();
  const to = req.query.to || today();
  try {
    if (db.isDbConfigured()) {
      const bookingsResult = await db.query(
        `SELECT a.id, a.booking_number AS "bookingNumber", TO_CHAR(a.booking_date, 'YYYY-MM-DD') AS date, a.time_slot AS time,
                a.guest_name AS "guestName", a.guest_email AS "guestEmail", a.status, a.user_id AS "userId",
                s.name AS "serviceName", s.price, ar.name AS "artistName"
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         JOIN artists ar ON a.artist_id = ar.id
         WHERE a.booking_date >= $1 AND a.booking_date <= $2
         ORDER BY a.booking_date, a.time_slot`,
        [from, to]
      );
      const statsResult = await db.query(
        `SELECT
           COUNT(*) FILTER (WHERE a.user_id IS NULL) AS "guestCount",
           COUNT(*) FILTER (WHERE a.user_id IS NOT NULL) AS "accountCount",
           COALESCE(SUM(s.price) FILTER (WHERE a.status = 'paid'), 0)::float AS earnings
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         WHERE a.booking_date >= $1 AND a.booking_date <= $2`,
        [from, to]
      );
      const stats = statsResult.rows[0];
      const bookings = bookingsResult.rows.map((r) => ({
        id: r.id,
        bookingNumber: r.bookingNumber,
        date: r.date,
        time: r.time,
        serviceName: r.serviceName,
        artistName: r.artistName,
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        status: r.status,
        price: r.price,
        isGuest: r.userId == null,
      }));
      return res.json({
        from,
        to,
        bookings,
        earnings: Number(stats.earnings) || 0,
        guestCount: parseInt(stats.guestCount, 10) || 0,
        accountCount: parseInt(stats.accountCount, 10) || 0,
      });
    }
    const fromD = from;
    const toD = to;
    const inRange = store.bookings.filter((b) => b.date >= fromD && b.date <= toD);
    const withPrice = inRange.map((b) => {
      const service = store.services.find((s) => s.id === b.serviceId);
      return { ...b, price: service ? service.price : 0, isGuest: b.userId == null };
    });
    const earnings = withPrice.filter((b) => b.status === 'paid').reduce((sum, b) => sum + (b.price || 0), 0);
    const guestCount = withPrice.filter((b) => b.isGuest).length;
    const accountCount = withPrice.filter((b) => !b.isGuest).length;
    res.json({
      from,
      to,
      bookings: withPrice.map(({ id, bookingNumber, date, time, serviceName, artistName, guestName, guestEmail, status, price, isGuest }) => ({
        id,
        bookingNumber,
        date,
        time,
        serviceName,
        artistName,
        guestName,
        guestEmail,
        status,
        price,
        isGuest,
      })),
      earnings,
      guestCount,
      accountCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

module.exports = router;
