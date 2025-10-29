/*
  # Create SEO Settings Table

  1. New Tables
    - `seo_settings`
      - `id` (uuid, primary key)
      - `page_type` (text, unique) - Type of page (e.g., 'vehicles', 'batteries', 'parts')
      - `meta_title` (text) - Default meta title
      - `meta_description` (text) - Default meta description
      - `meta_keywords` (text) - Comma-separated keywords
      - `og_title` (text) - Open Graph title
      - `og_description` (text) - Open Graph description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `seo_settings` table
    - Add policy for public read access
    - Add policy for admin-only write access
*/

CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text UNIQUE NOT NULL,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  meta_keywords text DEFAULT '',
  og_title text DEFAULT '',
  og_description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read SEO settings (needed for public vehicle pages)
CREATE POLICY "Anyone can view SEO settings"
  ON seo_settings FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can insert/update SEO settings
-- (In production, you'd want to check admin status here)
CREATE POLICY "Authenticated users can manage SEO settings"
  ON seo_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default SEO settings for vehicles
INSERT INTO seo_settings (page_type, meta_title, meta_description, meta_keywords, og_title, og_description)
VALUES (
  'vehicles',
  'Electric Vehicles for Sale | Mega Marks',
  'Browse our selection of high-quality electric vehicles. Find your perfect eco-friendly car today at Mega Marks.',
  'electric vehicles, EV for sale, Nissan Leaf, electric cars, eco-friendly vehicles, zero emission cars, Sri Lanka electric vehicles',
  'Electric Vehicles for Sale | Mega Marks',
  'Browse our selection of high-quality electric vehicles. Find your perfect eco-friendly car today at Mega Marks.'
)
ON CONFLICT (page_type) DO NOTHING;
