const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const store = require('../data/store');

const SALT_ROUNDS = 10;

function isHash(str) {
  return typeof str === 'string' && str.startsWith('$2');
}

async function verifyPassword(plain, stored) {
  if (isHash(stored)) return bcrypt.compare(plain, stored);
  return plain === stored;
}

// Single login for both admin and customer – returns user with role so frontend can redirect
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    if (db.isDbConfigured()) {
      const result = await db.query('SELECT id, email, name, role, password FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const row = result.rows[0];
      const valid = await verifyPassword(password, row.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const user = { id: row.id, email: row.email, name: row.name, role: row.role || 'customer' };
      return res.json({
        token: `salon-${row.id}-${Date.now()}`,
        user,
      });
    }
    const found = store.users.find((u) => u.email === email);
    if (!found) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await verifyPassword(password, found.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      token: `salon-${found.id}-${Date.now()}`,
      user: { id: found.id, email: found.email, name: found.name, role: found.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new customer account – password is hashed before storing
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const trimmedEmail = String(email).trim().toLowerCase();
  const trimmedName = name ? String(name).trim() : null;
  try {
    if (db.isDbConfigured()) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [trimmedName, trimmedEmail, hash, 'customer']
      );
      return res.status(201).json({ message: 'Account created. You can now sign in.' });
    }
    if (store.users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    const id = store.users.length ? Math.max(...store.users.map((u) => u.id || 0)) + 1 : 1;
    store.users.push({
      id,
      name: trimmedName,
      email: trimmedEmail,
      password: hash,
      role: 'customer',
    });
    res.status(201).json({ message: 'Account created. You can now sign in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
