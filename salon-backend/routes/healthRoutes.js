const router = require('express').Router();
const db = require('../db');

router.get('/', async (_req, res) => {
  const payload = { status: 'ok' };

  if (!db.isDbConfigured()) {
    payload.database = 'not configured';
    return res.status(200).json(payload);
  }

  try {
    await db.query('SELECT 1');
    payload.database = 'connected';
    return res.status(200).json(payload);
  } catch (err) {
    payload.status = 'degraded';
    payload.database = 'error';
    payload.error = err.message;
    return res.status(503).json(payload);
  }
});

module.exports = router;
