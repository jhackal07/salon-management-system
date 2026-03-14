# Salon Management System – Run Guide

## Codebase overview

| Part | Tech | Purpose |
|------|------|--------|
| **database/** | PostgreSQL | Schema: `users`, `artists` (status, on_leave_from/to), `services`, `appointments` |
| **salon-backend/** | Node.js + Express + pg | REST API on port **5000**; uses PostgreSQL when configured, else in-memory store |
| **salon-frontend/salon-app/** | Angular | Full app: booking UI; expects API at `http://localhost:5000/api` |

**Note:** The backend **supports PostgreSQL**. Set `DATABASE_URL` (or `PG_HOST`, `PG_USER`, `PG_DATABASE`, etc.) to use the DB; otherwise it runs with an in-memory store.

---

## Run order

1. **Database** – PostgreSQL running, schema applied  
2. **Backend** – API on port 5000  
3. **Frontend** – Angular app pointing at the API  

---

## 1. Database (PostgreSQL) – optional but recommended

- Install [PostgreSQL](https://www.postgresql.org/download/windows/) if needed.
- Create a database, e.g. `salon_db`.
- Apply the schema (creates `users`, `artists`, `services`, `appointments` and seed data):

```bash
psql -U postgres -d salon_db -f database/schema.sql
```

Or in `psql`:

```sql
\i d:/Projects/salon-management-system/database/schema.sql
```

If you already had an older schema: run `database/migrations/001_artists_and_booking_number.sql` then `database/migrations/002_artist_status.sql` to add artist status and on-leave dates.

**Registration & passwords:** New accounts are created via **Register** (frontend `/register` → `POST /api/auth/register`). Passwords are stored hashed (bcrypt). If you applied the schema with seed users that have plain passwords, from `salon-backend` run:

```bash
node scripts/hash-seed-passwords.js
```

so existing seed users (e.g. admin@salon.com, customer@example.com) can sign in with bcrypt verification.

---

## 2. Backend

From the project root:

```bash
cd salon-backend
npm install
npm start
```

Expected: `Salon API running on port 5000`, and either `Database: connected (PostgreSQL)` or `Database: using in-memory store`.

**Using PostgreSQL:** set one of the following before `npm start`:

- **Option A (recommended on Windows)** – use a `.env` file in `salon-backend/` so special characters in the password (`%`, `<`, `>`) are not interpreted by CMD:
  ```bash
  cd salon-backend
  copy .env.example .env
  # Edit .env and set DATABASE_URL=... or PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE
  npm install
  npm start
  ```
- **Option B** – set in CMD (passwords with `%` must be doubled as `%%`, and `<`/`>` can cause issues):
  ```bash
  set PG_HOST=localhost
  set PG_USER=postgres
  set PG_PASSWORD=yourpassword
  set PG_DATABASE=salon_db
  npm start
  ```
  Using separate `PG_*` vars avoids putting the whole URL in CMD, so a password like `3TE%IMy<QFqj` only needs `%` escaped as `%%`:  
  `set "PG_PASSWORD=3TE%%IMy<QFqj"` then set the others and run `npm start`.

If none of these are set, the API uses an **in-memory store** (no DB required; data is lost on restart).

- **API base:** `http://localhost:5000`
- **Artists:** `GET /api/artists` – all (admin). `GET /api/artists?for=team` – active only (Team page). `GET /api/artists?for=booking&date=YYYY-MM-DD` – available on that date. Admin can `POST` and `PUT /api/artists/:id` (status: active, on_leave, inactive; on_leave_from, on_leave_to).
- **Services:** `GET /api/services` – list services; admin can `POST/PUT/DELETE /api/services`.
- **Bookings:** `POST /api/bookings` – body: `date`, `time`, `serviceId`, `artistId`, optional `guestName`, `guestEmail`; returns **booking number**. `GET /api/bookings` – list all (for admin).
- **Admin login:** `POST /api/admin/login` – body: `email`, `password`; returns token. With DB: use seeded user `admin@salon.com` / `admin123` (change password in production).

---

## 3. Frontend (Angular)

The frontend is a **full** Angular app under `salon-frontend/salon-app/` with:

- **`src/app/services/`** – `ApiService` for the backend API
- **`src/app/pages/booking/`** – booking page: form (Date, Time, Service, Artist), option to book as guest (name + email) or with account; confirmation shows **booking number**.
- **`src/app/admin/`** – admin area (Booking, Artist, Service, Payment management). **Artist management:** add artists, set status (active / on leave / inactive), set on-leave date range; inactive = soft delete (hidden from Team and Booking). Team page and Booking show only active artists; Booking shows only artists available on the selected date (respects on-leave range).

From the project root:

```bash
cd salon-frontend/salon-app
npm install
npm start
```

- Dev server: **`http://localhost:4200`**
- Home: **`http://localhost:4200/home`**; Booking: **`http://localhost:4200/book`**; Admin: **`http://localhost:4200/admin`** (redirects to login if not signed in).
- `ApiService` uses **`http://localhost:5000/api`** (ensure the backend is running).

---

## Quick test (backend only)

From project root:

```bash
cd salon-backend
npm install
npm start
```

Then in another terminal:

```bash
curl -X POST http://localhost:5000/api/bookings -H "Content-Type: application/json" -d "{\"date\":\"2025-03-15\",\"time\":\"10:00\",\"serviceId\":1,\"artistId\":1,\"guestName\":\"Jane\",\"guestEmail\":\"jane@example.com\"}"
```

You should get a JSON response with `bookingNumber` (e.g. `BKG-20250315-0001`) and the saved booking.
