-- Add gender for default avatar on Team page (male -> default_man.png, female -> default_woman.png)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female'));

-- Optional: set seed artists (Jane, Maria, Sarah, Emma as female; adjust if needed)
-- UPDATE artists SET gender = 'female' WHERE name IN ('Jane Doe', 'Maria Garcia', 'Sarah Lee', 'Emma Wilson');
