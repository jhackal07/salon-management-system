const { Pool } = require('pg');

function buildConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.PG_HOST;
  const user = process.env.PG_USER;
  const database = process.env.PG_DATABASE || process.env.PG_DB;
  if (!host || !user || !database) return null;
  const port = process.env.PG_PORT || 5432;
  const password = process.env.PG_PASSWORD ? ':' + encodeURIComponent(process.env.PG_PASSWORD) : '';
  return `postgresql://${user}${password}@${host}:${port}/${database}`;
}

const connectionString = buildConnectionString();

const pool = connectionString
  ? new Pool({ connectionString })
  : null;

async function query(text, params) {
  if (!pool) throw new Error('Database not configured. Set DATABASE_URL or PG_* env vars.');
  return pool.query(text, params);
}

async function getClient() {
  if (!pool) throw new Error('Database not configured.');
  return pool.connect();
}

function isDbConfigured() {
  return !!pool;
}

module.exports = { query, getClient, pool, isDbConfigured };
