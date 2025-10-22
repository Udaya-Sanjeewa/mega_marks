-- ============================================================
-- FINAL FIX FOR VEHICLE ADS - NO DUPLICATE ERRORS
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Check existing policies (optional - just to see what you have)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admin_users';

-- Step 2: Drop ALL existing policies on admin_users to start fresh
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'admin_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Create simple, non-recursive policies for admin_users
CREATE POLICY "Allow authenticated read on admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own data"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert own record"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 4: Fix customer_vehicle_ads policies
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'customer_vehicle_ads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON customer_vehicle_ads', policy_record.policyname);
    END LOOP;
END $$;

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

-- Step 5: Fix customer_profiles policies
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'customer_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON customer_profiles', policy_record.policyname);
    END LOOP;
END $$;

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

-- Step 6: Sync existing auth users to admin_users table
INSERT INTO admin_users (id, email, full_name, role, is_active, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
  'admin' as role,
  true as is_active,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_active = true;

-- Step 7: Verify everything worked
SELECT 'Admin Users:' as info;
SELECT id, email, role, is_active FROM admin_users;

SELECT 'RLS Policies on admin_users:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admin_users';

SELECT 'RLS Policies on customer_vehicle_ads:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'customer_vehicle_ads';

SELECT 'Vehicle Ads Count:' as info;
SELECT COUNT(*) as total_ads FROM customer_vehicle_ads;

-- Done!
SELECT '✓ Fix completed successfully!' as status;
