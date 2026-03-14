const router = require('express').Router();
const db = require('../db');
const store = require('../data/store');

router.get('/', async (req, res) => {
  try {
    if (db.isDbConfigured()) {
      const result = await db.query('SELECT id, name, duration, price FROM services ORDER BY id');
      return res.json(result.rows);
    }
    res.json(store.services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

router.post('/', async (req, res) => {
  const { name, duration, price } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        'INSERT INTO services (name, duration, price) VALUES ($1, $2, $3) RETURNING id, name, duration, price',
        [name, duration || 60, price ?? 0]
      );
      return res.status(201).json(result.rows[0]);
    }
    const id = store.services.length ? Math.max(...store.services.map((s) => s.id)) + 1 : 1;
    const service = { id, name, duration: duration || 60, price: price ?? 0 };
    store.services.push(service);
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add service' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, duration, price } = req.body;
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        `UPDATE services SET
          name = COALESCE($1, name),
          duration = COALESCE($2, duration),
          price = COALESCE($3, price)
        WHERE id = $4 RETURNING id, name, duration, price`,
        [name, duration != null ? duration : null, price != null ? price : null, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
      return res.json(result.rows[0]);
    }
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Service not found' });
    if (name) store.services[index].name = name;
    if (duration != null) store.services[index].duration = duration;
    if (price != null) store.services[index].price = price;
    res.json(store.services[index]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (db.isDbConfigured()) {
      const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
      return res.status(204).send();
    }
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Service not found' });
    store.services.splice(index, 1);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
