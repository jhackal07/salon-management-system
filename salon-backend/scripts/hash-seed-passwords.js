/**
 * One-time script: replace plain-text passwords in users table with bcrypt hashes.
 * Run after applying schema with plain passwords: node scripts/hash-seed-passwords.js
 * Requires: DATABASE_URL or PG_* env vars (and .env loaded via dotenv from parent).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const db = require('../db');

const SEED_USERS = [
  { email: 'admin@salon.com', password: 'admin123' },
  { email: 'customer@example.com', password: 'customer123' },
];

async function main() {
  if (!db.isDbConfigured()) {
    console.error('Database not configured. Set DATABASE_URL or PG_* env vars.');
    process.exit(1);
  }
  for (const { email, password } of SEED_USERS) {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query('UPDATE users SET password = $1 WHERE email = $2 RETURNING id', [hash, email]);
    if (result.rowCount > 0) {
      console.log(`Updated password for ${email}`);
    } else {
      console.log(`No user found for ${email} (skip or add user first)`);
    }
  }
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
