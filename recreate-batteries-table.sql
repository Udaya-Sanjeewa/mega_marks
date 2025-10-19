/*
  # Recreate Batteries Table

  1. Drop existing table (if any remnants exist)
  2. Create batteries table with all required columns
  3. Set up Row Level Security (RLS)
  4. Add policies for public read and authenticated write access

  This includes the range_with_ac and range_without_ac columns that were missing.
*/

-- Drop the table if it exists (to clean up any remnants)
DROP TABLE IF EXISTS batteries CASCADE;

-- Create the batteries table with all necessary columns
CREATE TABLE batteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity text NOT NULL,
  brand text NOT NULL DEFAULT 'CATL',
  price numeric NOT NULL,
  description text,
  image_url text,
  in_stock boolean DEFAULT true,
  warranty_years integer DEFAULT 2,
  range_with_ac text,
  range_without_ac text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access to batteries"
  ON batteries FOR SELECT
  TO public
  USING (true);

-- Policies for authenticated users (admins)
CREATE POLICY "Authenticated users can insert batteries"
  ON batteries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update batteries"
  ON batteries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete batteries"
  ON batteries FOR DELETE
  TO authenticated
  USING (true);
