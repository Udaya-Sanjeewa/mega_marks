-- ============================================================
-- CRITICAL FIX: Apply this in Supabase SQL Editor
-- This fixes the infinite recursion error
-- ============================================================

-- Step 1: Drop all existing policies on admin_users
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert themselves" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;

-- Step 2: Create simple, non-recursive policy for admin_users
-- This allows all authenticated users to READ the admin_users table
-- This is safe because they can only view who is an admin, not modify data
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

-- Step 3: Verify the policies on customer_vehicle_ads
DROP POLICY IF EXISTS "Admins can view all ads" ON customer_vehicle_ads;
DROP POLICY IF EXISTS "Admins can update any ad" ON customer_vehicle_ads;

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

-- Step 4: Verify the policies on customer_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

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

-- Done! The infinite recursion should now be fixed.
