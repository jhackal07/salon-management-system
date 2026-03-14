const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const store = require('../data/store');

function isHash(str) {
  return typeof str === 'string' && str.startsWith('$2');
}

async function verifyPassword(plain, stored) {
  if (isHash(stored)) return bcrypt.compare(plain, stored);
  return plain === stored;
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (db.isDbConfigured()) {
      const result = await db.query(
        'SELECT id, email, role, password FROM users WHERE email = $1 AND role = $2',
        [email, 'admin']
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const row = result.rows[0];
      const valid = await verifyPassword(password, row.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      return res.json({
        token: `admin-${email}-${Date.now()}`,
        user: { email: row.email, role: row.role },
      });
    }
    const user = store.adminUsers.find((u) => u.email === email && u.role === 'admin');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      token: `admin-${email}-${Date.now()}`,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
