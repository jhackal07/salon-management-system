# Salon Management System – Run Guide

## Codebase overview

| Part | Tech | Purpose |
|------|------|--------|
| **database/** | PostgreSQL | Schema: `users`, `services`, `appointments` |
| **salon-backend/** | Node.js + Express | REST API on port **5000**, CORS enabled; `/api/bookings` |
| **salon-frontend/** | Angular (partial) | Booking UI; expects API at `http://localhost:5000/api` |

**Note:** The backend does **not** connect to the database yet (no `pg` or ORM). It accepts booking requests and echoes them back. The frontend is only **partial** Angular (no `package.json` or `angular.json`); you need to create an Angular app and copy the provided `src/app` files into it.

---

## Run order

1. **Database** – PostgreSQL running, schema applied  
2. **Backend** – API on port 5000  
3. **Frontend** – Angular app pointing at the API  

---

## 1. Database (PostgreSQL)

- Install [PostgreSQL](https://www.postgresql.org/download/windows/) if needed.
- Create a database, e.g. `salon_db`.
- Apply the schema:

```bash
psql -U postgres -d salon_db -f database/schema.sql
```

Or in `psql`:

```sql
\i d:/Projects/salon-management-system/database/schema.sql
```

---

## 2. Backend

From the project root:

```bash
cd salon-backend
npm install
npm start
```

Expected: `Salon API running on port 5000`.

- **API base:** `http://localhost:5000`
- **Bookings:** `POST http://localhost:5000/api/bookings` (JSON body echoed back; no DB persistence yet).

---

## 3. Frontend (Angular)

The repo only has partial Angular sources under `salon-frontend/src/app/`. To run a full app:

1. **Create a new Angular app** (one level up or in a new folder):

   ```bash
   npx -y @angular/cli@latest new salon-app --routing --style=css
   cd salon-app
   ```

2. **Copy the provided app code over the new app’s `src/app`:**

   - Copy `salon-frontend/src/app/services/api.service.ts` into `src/app/services/`.
   - Copy `salon-frontend/src/app/pages/booking/` into `src/app/pages/booking/` (or under `src/app/` as in the repo).
   - Ensure `app.module.ts` (or standalone config) declares the booking component and imports `HttpClientModule`, `FormsModule`, and your routing so the booking route works.

3. **Add a route** for the booking page (e.g. `path: 'book', component: BookingComponent`).

4. **Run the app:**

   ```bash
   npm start
   ```

   Default Angular dev server: `http://localhost:4200`. The existing `ApiService` already uses `http://localhost:5000/api`.

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
curl -X POST http://localhost:5000/api/bookings -H "Content-Type: application/json" -d "{\"date\":\"2025-03-15\",\"service\":\"Hair Treatment\"}"
```

You should get a JSON response with the echoed booking and a success message.
