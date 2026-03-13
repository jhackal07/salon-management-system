# PostgreSQL setup for Salon Management System

## 1. Install PostgreSQL on Windows

1. **Download** the Windows installer from:  
   https://www.postgresql.org/download/windows/  
   (Use the official EDB installer, e.g. PostgreSQL 17 or 18.)

2. **Run the installer:**
   - Set installation directory (default is fine).
   - Select components: **PostgreSQL Server**, **pgAdmin 4** (optional), **Command Line Tools**.
   - Set a **password for the `postgres` superuser** and remember it.
   - Keep default port **5432** unless you need another.

3. **Finish** the installer. PostgreSQL runs as a Windows service and starts automatically.

---

## If "psql is not found"

The installer may not add PostgreSQL to your PATH. Use one of these:

**Option A – Use the full path every time**  
Replace `18` with your PostgreSQL version if different (e.g. `17`). Common location:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE salon_db;"
```

**Option B – Add to PATH for this PowerShell session only**

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -c "CREATE DATABASE salon_db;"
```

(Replace `18` with your version. Check `C:\Program Files\PostgreSQL\` for the folder name.)

**Option C – Add to PATH permanently (so `psql` works in any new terminal)**

1. Press **Win**, type **environment**, open **Edit the system environment variables**.
2. Click **Environment Variables**.
3. Under **User variables** or **System variables**, select **Path** → **Edit** → **New**.
4. Add: `C:\Program Files\PostgreSQL\18\bin` (use your version number).
5. OK out, then **close and reopen** PowerShell.

---

## 2. Check that PostgreSQL is running

- **Services:** Open `services.msc` → find **postgresql-x64-18** (or your version) → Status should be **Running**.
- **Or in PowerShell (as Administrator):**
  ```powershell
  Get-Service -Name "postgresql*"
  ```

---

## 3. Create the database

Open **PowerShell** or **Command Prompt** and run:

```powershell
psql -U postgres -c "CREATE DATABASE salon_db;"
```

When prompted, enter the `postgres` user password you set during installation.

If `psql` is not in your PATH, use the full path, for example:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE salon_db;"
```

(Replace `18` with your PostgreSQL version if different.)

---

## 4. Run the schema (create tables)

From the **project root** `d:\Projects\salon-management-system`:

```powershell
psql -U postgres -d salon_db -f database\schema.sql
```

With full path to `psql`:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d salon_db -f "d:\Projects\salon-management-system\database\schema.sql"
```

You should see `CREATE TABLE` for `users`, `services`, and `appointments`.

---

## 5. (Optional) Add sample services

To match the frontend dropdown (Nail Treatment, Hair Treatment, Facial), run the seed file:

```powershell
psql -U postgres -d salon_db -f "d:\Projects\salon-management-system\database\seed.sql"
```

If `psql` is not in PATH:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d salon_db -f "d:\Projects\salon-management-system\database\seed.sql"
```

---

## 6. Verify setup

Connect and list tables:

```powershell
psql -U postgres -d salon_db -c "\dt"
```

Expected output: `users`, `services`, `appointments`.

---

## Connection details (for later backend use)

| Setting   | Value        |
|----------|--------------|
| Host     | `localhost`  |
| Port     | `5432`       |
| Database | `salon_db`   |
| User     | `postgres`   |
| Password | (the one you set) |

Once the backend is updated to use PostgreSQL, you’ll use these in environment variables or a config file (e.g. `DATABASE_URL` or `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).
