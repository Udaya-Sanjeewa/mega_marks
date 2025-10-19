/*
  # Complete Batteries Table Setup with Sample Data

  1. Drop existing table (if any remnants exist)
  2. Create batteries table with all required columns
  3. Set up Row Level Security (RLS)
  4. Add policies for public read and authenticated write access
  5. Insert sample battery data

  This includes the range_with_ac and range_without_ac columns.
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

-- Insert sample battery data
INSERT INTO batteries (name, capacity, brand, price, description, image_url, in_stock, warranty_years, range_with_ac, range_without_ac) VALUES
  ('CATL LFP Battery Pack 53kWh', '53kWh', 'CATL', 450000, 'High-performance lithium iron phosphate battery pack with excellent thermal stability and long cycle life. Ideal for urban EVs.', 'https://images.pexels.com/photos/12986350/pexels-photo-12986350.jpeg', true, 8, '280 km', '320 km'),
  ('BYD Blade Battery 62kWh', '62kWh', 'BYD', 525000, 'Revolutionary blade battery technology with superior safety features and space efficiency. Perfect for mid-range electric vehicles.', 'https://images.pexels.com/photos/17485792/pexels-photo-17485792.jpeg', true, 8, '340 km', '385 km'),
  ('CATL Ternary Battery 75kWh', '75kWh', 'CATL', 680000, 'High energy density ternary lithium battery with excellent performance in all weather conditions. Suitable for long-range EVs.', 'https://images.pexels.com/photos/12986352/pexels-photo-12986352.jpeg', true, 8, '420 km', '470 km'),
  ('BYD LFP Battery 50kWh', '50kWh', 'BYD', 420000, 'Compact and efficient battery pack designed for city commuting. Features fast charging capability and robust construction.', 'https://images.pexels.com/photos/17485795/pexels-photo-17485795.jpeg', true, 6, '265 km', '305 km'),
  ('CATL NCM Battery 100kWh', '100kWh', 'CATL', 950000, 'Premium high-capacity battery for luxury electric vehicles. Offers exceptional range and fast charging capabilities.', 'https://images.pexels.com/photos/12986348/pexels-photo-12986348.jpeg', true, 10, '550 km', '620 km'),
  ('Lishen LFP Battery 45kWh', '45kWh', 'Lishen', 380000, 'Budget-friendly battery solution with reliable performance. Perfect for entry-level electric vehicles.', 'https://images.pexels.com/photos/17485793/pexels-photo-17485793.jpeg', false, 5, '240 km', '275 km');
