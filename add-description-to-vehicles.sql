-- Add description column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description text;
