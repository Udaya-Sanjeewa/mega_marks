/*
  # Ensure Customer Tables and Admin Access Policies

  1. Tables Created (if not exist)
    - `customer_profiles` - Customer information
    - `customer_vehicle_ads` - Customer vehicle advertisements
    - `admin_users` - Admin user records

  2. Security Policies
    - Admins can view all customer profiles
    - Admins can view and manage all vehicle ads
    - Customers can manage their own data

  3. Important Notes
    - This migration is idempotent and safe to run multiple times
    - Ensures admin users can access customer data for approval workflow
*/

-- ========================================
-- 1. CREATE ADMIN_USERS TABLE
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

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate admin_users policies
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert themselves" ON admin_users;

CREATE POLICY "Admins can view their own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update their own data"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert themselves"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate customer_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

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

ALTER TABLE customer_vehicle_ads ENABLE ROW LEVEL SECURITY;

-- Drop and recreate customer_vehicle_ads policies
DROP POLICY IF EXISTS "Users can view own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can insert own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can update own pending ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can update any ad" ON customer_vehicle_ads;

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

-- ========================================
-- 4. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_user_id ON customer_vehicle_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicle_ads_status ON customer_vehicle_ads(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
