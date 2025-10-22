/*
  # Fix Vehicles Table Schema

  The issue: The vehicles table is missing several columns that exist in
  customer_vehicle_ads table, causing errors when approving ads.

  Solution: Add missing columns to vehicles table to match the structure.
*/

-- ========================================
-- ADD MISSING COLUMNS TO VEHICLES TABLE
-- ========================================

-- Add 'make' column (currently only has 'model')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'make'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN make text NOT NULL DEFAULT 'Unknown';
    RAISE NOTICE 'Added make column to vehicles';
  END IF;
END $$;

-- Add 'description' column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'description'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN description text;
    RAISE NOTICE 'Added description column to vehicles';
  END IF;
END $$;

-- Add 'images' column (to replace/complement image_url)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'images'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN images text[];
    RAISE NOTICE 'Added images column to vehicles';
  END IF;
END $$;

-- Add 'is_featured' column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN is_featured boolean DEFAULT false;
    RAISE NOTICE 'Added is_featured column to vehicles';
  END IF;
END $$;

-- ========================================
-- SAME FOR PARTS TABLE
-- ========================================

-- Add 'is_featured' column to parts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parts' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE parts ADD COLUMN is_featured boolean DEFAULT false;
    RAISE NOTICE 'Added is_featured column to parts';
  END IF;
END $$;

-- ========================================
-- SAME FOR BATTERIES TABLE
-- ========================================

-- Add 'is_featured' column to batteries (if not exists from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'batteries' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE batteries ADD COLUMN is_featured boolean DEFAULT false;
    RAISE NOTICE 'Added is_featured column to batteries';
  END IF;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

-- Show vehicles table structure
SELECT
  'Vehicles table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- Show parts table structure
SELECT
  'Parts table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'parts'
ORDER BY ordinal_position;

-- Show batteries table structure
SELECT
  'Batteries table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'batteries'
ORDER BY ordinal_position;

DO $$
BEGIN
  RAISE NOTICE '===== VEHICLES/PARTS/BATTERIES SCHEMA UPDATED =====';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Added make, description, images, is_featured columns to vehicles';
  RAISE NOTICE '2. Added is_featured column to parts';
  RAISE NOTICE '3. Added is_featured column to batteries (if not exists)';
  RAISE NOTICE '';
  RAISE NOTICE 'Results:';
  RAISE NOTICE '- Admin can now approve vehicle ads without column errors';
  RAISE NOTICE '- Vehicles table now matches customer_vehicle_ads structure';
  RAISE NOTICE '- All product tables support featured flag';
  RAISE NOTICE '';
  RAISE NOTICE 'Please try approving a vehicle ad again!';
END $$;
