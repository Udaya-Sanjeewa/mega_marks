/*
  # Add Multiple Images Support for Vehicles

  1. Changes
    - Add `images` array field to vehicles table to store multiple image URLs
    - Keep the existing `image_url` field for backwards compatibility (will be the main/first image)
    - Maximum of 5 images can be stored per vehicle

  2. Notes
    - The `images` array will store all vehicle images
    - If `images` is empty or null, the system will fall back to `image_url`
*/

-- Add images column to vehicles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'images'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN images text[] DEFAULT '{}';
  END IF;
END $$;
