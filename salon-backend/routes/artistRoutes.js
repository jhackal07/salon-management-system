const router = require('express').Router();
const db = require('../db');
const store = require('../data/store');

// Helper: is artist available on a given date (active and not in on-leave range)
function availableOnDate(artist, dateStr) {
  if (artist.status !== 'active') return false;
  if (!artist.on_leave_from || !artist.on_leave_to) return true;
  const d = new Date(dateStr);
  const from = new Date(artist.on_leave_from);
  const to = new Date(artist.on_leave_to);
  return d < from || d > to;
}

// GET /api/artists
// Query: for=team → active only; for=booking&date=YYYY-MM-DD → available that day; no param → all (admin)
router.get('/', async (req, res) => {
  const { for: purpose, date: bookingDate } = req.query;
  try {
    if (db.isDbConfigured()) {
      if (purpose === 'team') {
        const result = await db.query(
          "SELECT id, name, status, gender FROM artists WHERE status = 'active' ORDER BY name"
        );
        return res.json(result.rows.map((r) => ({ id: r.id, name: r.name, gender: r.gender || null })));
      }
      if (purpose === 'booking' && bookingDate) {
        const result = await db.query(
          'SELECT id, name, status, on_leave_from AS "on_leave_from", on_leave_to AS "on_leave_to" FROM artists WHERE status = $1 ORDER BY name',
          ['active']
        );
        const available = result.rows.filter((r) => {
          if (r.status !== 'active') return false;
          if (!r.on_leave_from || !r.on_leave_to) return true;
          const d = new Date(bookingDate);
          const from = new Date(r.on_leave_from);
          const to = new Date(r.on_leave_to);
          return d < from || d > to;
        });
        return res.json(available.map((r) => ({ id: r.id, name: r.name, gender: r.gender || null })));
      }
      const result = await db.query(
        'SELECT id, name, status, gender, on_leave_from AS "on_leave_from", on_leave_to AS "on_leave_to" FROM artists ORDER BY id'
      );
      return res.json(result.rows.map((r) => ({ ...r, gender: r.gender || null })));
    }
    if (purpose === 'team') {
      return res.json(store.artists.filter((a) => a.status === 'active').map((a) => ({ id: a.id, name: a.name, gender: a.gender || null })));
    }
    if (purpose === 'booking' && bookingDate) {
      const list = store.artists.filter((a) => store.isArtistAvailableOnDate(a, bookingDate));
      return res.json(list.map((a) => ({ id: a.id, name: a.name, gender: a.gender || null })));
    }
    res.json(store.artists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load artists' });
  }
});

router.post('/', async (req, res) => {
  const { name, status, gender } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  const genderVal = gender === 'male' || gender === 'female' ? gender : null;
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        'INSERT INTO artists (name, status, gender) VALUES ($1, $2, $3) RETURNING id, name, status, gender, on_leave_from AS "on_leave_from", on_leave_to AS "on_leave_to"',
        [name.trim(), status === 'on_leave' || status === 'inactive' ? status : 'active', genderVal]
      );
      const row = result.rows[0];
      return res.status(201).json({ ...row, gender: row.gender || null });
    }
    const id = store.artists.length ? Math.max(...store.artists.map((a) => a.id)) + 1 : 1;
    const artist = {
      id,
      name: name.trim(),
      status: status === 'on_leave' || status === 'inactive' ? status : 'active',
      gender: genderVal,
      on_leave_from: null,
      on_leave_to: null,
    };
    store.artists.push(artist);
    res.status(201).json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add artist' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, status, gender, on_leave_from, on_leave_to } = req.body;
  const genderVal = gender === 'male' || gender === 'female' ? gender : (gender === null || gender === '') ? null : undefined;
  try {
    if (db.isDbConfigured()) {
      const updates = [
        name != null ? 'name = COALESCE(NULLIF(TRIM($1), \'\'), name)' : 'name = name',
        status != null ? 'status = COALESCE($2, status)' : 'status = status',
        genderVal !== undefined ? 'gender = $5' : 'gender = gender',
        'on_leave_from = $3',
        'on_leave_to = $4',
      ];
      const params = [name, status, on_leave_from ?? null, on_leave_to ?? null, id];
      if (genderVal !== undefined) params.splice(4, 0, genderVal);
      const result = await db.query(
        `UPDATE artists SET name = COALESCE(NULLIF(TRIM($1), ''), name), status = COALESCE($2, status), on_leave_from = $3, on_leave_to = $4${genderVal !== undefined ? ', gender = $5' : ''} WHERE id = ${genderVal !== undefined ? '$6' : '$5'} RETURNING id, name, status, gender, on_leave_from AS "on_leave_from", on_leave_to AS "on_leave_to"`,
        genderVal !== undefined ? [name, status, on_leave_from ?? null, on_leave_to ?? null, genderVal, id] : [name, status, on_leave_from ?? null, on_leave_to ?? null, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
      const row = result.rows[0];
      return res.json({ ...row, gender: row.gender || null });
    }
    const index = store.artists.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Artist not found' });
    if (name && name.trim()) store.artists[index].name = name.trim();
    if (status) store.artists[index].status = status;
    if (genderVal !== undefined) store.artists[index].gender = genderVal;
    if (on_leave_from !== undefined) store.artists[index].on_leave_from = on_leave_from || null;
    if (on_leave_to !== undefined) store.artists[index].on_leave_to = on_leave_to || null;
    res.json(store.artists[index]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

module.exports = router;
