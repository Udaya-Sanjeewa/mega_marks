/*
  # Add Featured Flags to Product Tables

  1. Changes
    - Add `is_featured` column to batteries table
    - Add `is_featured` column to vehicles table
    - Add `is_featured` column to parts table

  2. Notes
    - Default value is false
    - Allows admins to mark products as featured for home page display
*/

-- Add is_featured column to batteries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'batteries' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE batteries ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add is_featured column to vehicles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add is_featured column to parts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parts' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE parts ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;
