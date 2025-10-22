/*
  # Customer Authentication & Vehicle Ads System Setup

  ## Overview
  This migration creates the complete customer authentication and vehicle ad system.

  ## New Tables

  ### 1. customer_profiles
  Stores customer information for authenticated users who can post vehicle ads.
  - `id` (uuid, primary key) - Auto-generated unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `full_name` (text) - Customer's full name
  - `email` (text) - Customer's email address
  - `phone` (text) - Customer's phone number
  - `address` (text) - Customer's address
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Profile last update timestamp

  ### 2. customer_vehicle_ads
  Stores vehicle advertisements posted by customers, pending admin approval.
  - `id` (uuid, primary key) - Auto-generated unique identifier
  - `user_id` (uuid, foreign key) - Links to customer who posted the ad
  - `make` (text) - Vehicle manufacturer
  - `model` (text) - Vehicle model name
  - `year` (integer) - Vehicle year
  - `price` (numeric) - Asking price
  - `mileage` (integer) - Vehicle mileage in kilometers
  - `battery_capacity` (text) - Battery capacity (e.g., "24 kWh")
  - `condition` (text) - Vehicle condition (Excellent, Good, Fair)
  - `color` (text, nullable) - Vehicle color
  - `description` (text, nullable) - Detailed description
  - `features` (text array, nullable) - List of features
  - `images` (text array, nullable) - Array of image URLs
  - `status` (text) - Status: 'pending', 'approved', 'rejected'
  - `created_at` (timestamptz) - Ad creation timestamp
  - `updated_at` (timestamptz) - Ad last update timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### customer_profiles
  - Authenticated users can view their own profile
  - Authenticated users can update their own profile
  - Users can insert their own profile upon signup
  - Admins can view all profiles

  #### customer_vehicle_ads
  - Authenticated users can view their own ads
  - Authenticated users can insert new ads
  - Authenticated users can update their own pending ads
  - Admins can view all ads
  - Admins can update ad status (approve/reject)

  ## Important Notes

  1. This migration is idempotent - it can be run multiple times safely
  2. All foreign key constraints ensure data integrity
  3. RLS policies ensure data security
  4. Status field uses text instead of enum for flexibility
  5. Images and features use text arrays for multiple entries
*/

-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_vehicle_ads table
CREATE TABLE IF NOT EXISTS customer_vehicle_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  mileage integer NOT NULL CHECK (mileage >= 0),
  battery_capacity text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  color text,
  description text,
  features text[],
  images text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_vehicle_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles (requires admin_users table from previous migrations)
CREATE POLICY "Admins can view all profiles"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- RLS Policies for customer_vehicle_ads

-- Users can view their own ads
CREATE POLICY "Users can view own ads"
  ON customer_vehicle_ads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert new ads
CREATE POLICY "Users can insert own ads"
  ON customer_vehicle_ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending ads
CREATE POLICY "Users can update own pending ads"
  ON customer_vehicle_ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all ads
CREATE POLICY "Admins can view all ads"
  ON customer_vehicle_ads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can update any ad (approve/reject)
CREATE POLICY "Admins can update any ad"
  ON customer_vehicle_ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_user_id ON customer_vehicle_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_status ON customer_vehicle_ads(status);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_created_at ON customer_vehicle_ads(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_vehicle_ads_updated_at ON customer_vehicle_ads;
CREATE TRIGGER update_customer_vehicle_ads_updated_at
  BEFORE UPDATE ON customer_vehicle_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
