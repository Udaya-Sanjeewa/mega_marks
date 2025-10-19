/*
  # Mega Mask EV Shop Database Schema

  1. New Tables
    - `batteries`
      - `id` (uuid, primary key)
      - `name` (text) - Battery model name
      - `capacity` (text) - Battery capacity (e.g., "53kWh", "62kWh")
      - `brand` (text) - Manufacturer brand
      - `price` (numeric) - Price in currency
      - `description` (text) - Product description
      - `image_url` (text) - Product image URL
      - `in_stock` (boolean) - Availability status
      - `warranty_years` (integer) - Warranty period
      - `created_at` (timestamptz)
      
    - `vehicles`
      - `id` (uuid, primary key)
      - `model` (text) - Vehicle model name
      - `year` (integer) - Manufacturing year
      - `battery_capacity` (text) - Battery capacity
      - `condition` (text) - Vehicle condition (New/Used/Certified)
      - `mileage` (integer) - Mileage in km
      - `price` (numeric) - Price in currency
      - `color` (text) - Vehicle color
      - `image_url` (text) - Vehicle image URL
      - `features` (text[]) - Array of features
      - `available` (boolean) - Availability status
      - `created_at` (timestamptz)
      
    - `parts`
      - `id` (uuid, primary key)
      - `name` (text) - Part name
      - `category` (text) - Part category
      - `price` (numeric) - Price in currency
      - `description` (text) - Part description
      - `image_url` (text) - Part image URL
      - `in_stock` (boolean) - Availability status
      - `stock_quantity` (integer) - Available quantity
      - `compatible_models` (text[]) - Compatible vehicle models
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

CREATE TABLE IF NOT EXISTS batteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity text NOT NULL,
  brand text NOT NULL DEFAULT 'CATL',
  price numeric NOT NULL,
  description text,
  image_url text,
  in_stock boolean DEFAULT true,
  warranty_years integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  year integer NOT NULL,
  battery_capacity text NOT NULL,
  condition text NOT NULL,
  mileage integer DEFAULT 0,
  price numeric NOT NULL,
  color text,
  image_url text,
  features text[],
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  description text,
  image_url text,
  in_stock boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  compatible_models text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to batteries"
  ON batteries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to vehicles"
  ON vehicles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to parts"
  ON parts FOR SELECT
  TO public
  USING (true);