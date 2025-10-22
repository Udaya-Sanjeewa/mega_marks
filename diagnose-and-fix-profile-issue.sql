/*
  # Diagnose and Fix Customer Profile Loading Issue

  This script will:
  1. Check if customer_profiles table exists
  2. Check if profiles exist in the table
  3. Verify RLS policies are correct
  4. Fix any permission issues
*/

-- ========================================
-- STEP 1: CHECK TABLE AND DATA
-- ========================================

-- Check if the table exists and has data
DO $$
DECLARE
  profile_count INTEGER;
  user_count INTEGER;
BEGIN
  -- Count profiles
  SELECT COUNT(*) INTO profile_count FROM customer_profiles;

  -- Count auth users
  SELECT COUNT(*) INTO user_count FROM auth.users;

  RAISE NOTICE '===== DIAGNOSTIC RESULTS =====';
  RAISE NOTICE 'Total customer profiles: %', profile_count;
  RAISE NOTICE 'Total auth users: %', user_count;

  IF profile_count < user_count THEN
    RAISE NOTICE 'WARNING: Some users do not have profiles!';
  END IF;
END $$;

-- Show sample profile data (without sensitive info)
SELECT
  id,
  user_id,
  full_name,
  email,
  created_at
FROM customer_profiles
LIMIT 5;

-- ========================================
-- STEP 2: VERIFY RLS IS ENABLED
-- ========================================

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'customer_profiles';

-- ========================================
-- STEP 3: CHECK EXISTING POLICIES
-- ========================================

SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'customer_profiles';

-- ========================================
-- STEP 4: FIX RLS POLICIES
-- ========================================

-- Ensure RLS is enabled
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Allow signup profile creation" ON customer_profiles;

-- Recreate SELECT policy (most important for loading data)
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin view policy
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
-- STEP 5: VERIFY POLICIES WERE CREATED
-- ========================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'customer_profiles';

  RAISE NOTICE '===== POLICY CHECK =====';
  RAISE NOTICE 'Total policies on customer_profiles: %', policy_count;

  IF policy_count >= 4 THEN
    RAISE NOTICE 'SUCCESS: All policies created correctly!';
  ELSE
    RAISE NOTICE 'WARNING: Expected 4 policies, found %', policy_count;
  END IF;
END $$;

-- Show all policies
SELECT
  policyname,
  cmd as command,
  CASE
    WHEN roles = '{authenticated}' THEN 'authenticated'
    WHEN roles = '{anon}' THEN 'anon'
    ELSE roles::text
  END as role
FROM pg_policies
WHERE tablename = 'customer_profiles'
ORDER BY policyname;

-- ========================================
-- STEP 6: TEST QUERY (as authenticated user)
-- ========================================

-- This shows what data is visible
-- Note: This runs as the postgres role, so it sees everything
-- The actual user will only see their own profile when logged in
SELECT
  'TEST: Profile data structure' as test_name,
  id,
  user_id,
  full_name,
  email,
  phone,
  address,
  created_at
FROM customer_profiles
LIMIT 1;

-- ========================================
-- FINAL SUMMARY
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '===== SETUP COMPLETE =====';
  RAISE NOTICE '1. RLS is enabled on customer_profiles';
  RAISE NOTICE '2. All necessary policies have been created';
  RAISE NOTICE '3. Users should now be able to view their own profiles';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '- Log in to your customer account';
  RAISE NOTICE '- Navigate to the dashboard';
  RAISE NOTICE '- Your profile should now load correctly';
  RAISE NOTICE '';
  RAISE NOTICE 'If the issue persists, check browser console for errors';
END $$;
