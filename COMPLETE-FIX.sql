-- ============================================================
-- COMPLETE FIX FOR VEHICLE ADS AND CUSTOMER PROFILES
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Step 1: Fix admin_users policies (remove infinite recursion)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert themselves" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated read on admin_users" ON admin_users;

-- Allow ALL authenticated users to read admin_users (prevents recursion)
CREATE POLICY "Allow authenticated read on admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to update their own data
CREATE POLICY "Admins can update own data"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to insert themselves
CREATE POLICY "Admins can insert own record"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 2: Fix customer_vehicle_ads policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can insert own ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can update own pending ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can view all ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can update any ad" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON customer_vehicle_ads;

-- Allow users to view their own ads
CREATE POLICY "Users can view own ads"
  ON customer_vehicle_ads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own ads
CREATE POLICY "Users can insert own ads"
  ON customer_vehicle_ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pending ads
CREATE POLICY "Users can update own pending ads"
  ON customer_vehicle_ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Allow admins to view all ads
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

-- Allow admins to update any ad (for approval/rejection)
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

-- Step 3: Fix customer_profiles policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all customer profiles
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

-- ============================================================
-- Step 4: IMPORTANT - Verify your admin user exists
-- ============================================================
-- Run this query to check if your admin user is in admin_users table:
-- SELECT * FROM admin_users WHERE email = 'your-admin-email@example.com';
--
-- If no results, you need to add yourself:
-- INSERT INTO admin_users (id, email, full_name, role, is_active)
-- VALUES (
--   'your-user-id-from-auth.users',
--   'your-admin-email@example.com',
--   'Your Name',
--   'admin',
--   true
-- );

-- ============================================================
-- Done! Now test your vehicle ads page
-- ============================================================
