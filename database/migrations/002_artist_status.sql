-- Add status and on-leave dates to artists (run if you have existing schema without these columns)
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS on_leave_from DATE,
  ADD COLUMN IF NOT EXISTS on_leave_to DATE;

UPDATE artists SET status = 'active' WHERE status IS NULL;
