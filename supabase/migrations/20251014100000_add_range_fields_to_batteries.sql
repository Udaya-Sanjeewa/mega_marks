/*
  # Add Range Fields to Batteries Table

  1. Changes
    - Add `range_with_ac` (text) - Driving range with air conditioning
    - Add `range_without_ac` (text) - Driving range without air conditioning

  2. Notes
    - Fields are optional (nullable) to allow existing records
    - Store as text to allow flexible formatting (e.g., "350 km", "350-400 km")
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'batteries' AND column_name = 'range_with_ac'
  ) THEN
    ALTER TABLE batteries ADD COLUMN range_with_ac text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'batteries' AND column_name = 'range_without_ac'
  ) THEN
    ALTER TABLE batteries ADD COLUMN range_without_ac text;
  END IF;
END $$;
