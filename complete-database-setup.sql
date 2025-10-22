/*
  # Complete Customer Authentication & Vehicle Ads System Setup

  ## Overview
  This migration creates the complete customer authentication and vehicle ad system.
  It includes admin_users table creation and all necessary security policies.

  ## Tables Created

  ### 1. admin_users (if not exists)
  Tracks admin users who can approve vehicle ads

  ### 2. customer_profiles
  Stores customer information for authenticated users who can post vehicle ads.

  ### 3. customer_vehicle_ads
  Stores vehicle advertisements posted by customers, pending admin approval.

  ## Security
  All tables have RLS enabled with comprehensive security policies.

  ## Important Notes
  - This script is idempotent - safe to run multiple times
  - Creates admin_users table if it doesn't exist
  - All foreign key constraints ensure data integrity
  - RLS policies ensure data security
*/

-- ========================================
-- 1. CREATE ADMIN_USERS TABLE (if not exists)
-- ========================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'editor'))
);

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

-- Create admin_users policies
CREATE POLICY "Admins can view their own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update their own data"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Super admins can manage all admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ========================================
-- 2. CREATE CUSTOMER_PROFILES TABLE
-- ========================================

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

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

-- Create customer_profiles policies
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create indexes for customer_profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);

-- ========================================
-- 3. CREATE CUSTOMER_VEHICLE_ADS TABLE
-- ========================================

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

-- Enable RLS
ALTER TABLE customer_vehicle_ads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can insert own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can update own pending ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can update any ad" ON customer_vehicle_ads;

-- Create customer_vehicle_ads policies
CREATE POLICY "Users can view own ads"
  ON customer_vehicle_ads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ads"
  ON customer_vehicle_ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending ads"
  ON customer_vehicle_ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all ads"
  ON customer_vehicle_ads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update any ad"
  ON customer_vehicle_ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create indexes for customer_vehicle_ads
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_user_id ON customer_vehicle_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_status ON customer_vehicle_ads(status);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_created_at ON customer_vehicle_ads(created_at DESC);

-- ========================================
-- 4. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ========================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for customer_profiles
DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for customer_vehicle_ads
DROP TRIGGER IF EXISTS update_customer_vehicle_ads_updated_at ON customer_vehicle_ads;
CREATE TRIGGER update_customer_vehicle_ads_updated_at
  BEFORE UPDATE ON customer_vehicle_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for admin_users if function doesn't exist
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_admin_users_updated_at ON admin_users;
CREATE TRIGGER trigger_update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- ========================================
-- SETUP COMPLETE
-- ========================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: admin_users, customer_profiles, customer_vehicle_ads';
  RAISE NOTICE 'RLS policies have been applied to all tables';
  RAISE NOTICE 'Triggers created for automatic timestamp updates';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create an admin user in auth.users via Supabase Dashboard';
  RAISE NOTICE '2. Add the admin user to admin_users table';
  RAISE NOTICE '3. Test customer signup and login';
  RAISE NOTICE '4. Test vehicle ad posting workflow';
END $$;
