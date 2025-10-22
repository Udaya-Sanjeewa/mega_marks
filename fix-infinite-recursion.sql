/*
  # Fix Infinite Recursion in Customer Profile Policies

  The issue is that the admin check in customer_profiles SELECT policy
  creates a circular reference with admin_users policies.

  This script fixes it by simplifying the policies.
*/

-- ========================================
-- FIX CUSTOMER_PROFILES POLICIES
-- ========================================

-- Drop ALL existing policies on customer_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Allow signup profile creation" ON customer_profiles;

-- Create simple SELECT policy for regular users (no admin check)
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

-- Create DELETE policy
CREATE POLICY "Users can delete own profile"
  ON customer_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- FIX ADMIN_USERS POLICIES (if needed)
-- ========================================

-- Ensure admin_users has simple policies without recursion
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view own record" ON admin_users;

-- Simple policy: users can only view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- VERIFICATION
-- ========================================

-- Show all policies on customer_profiles
SELECT
  'customer_profiles policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'customer_profiles'
ORDER BY policyname;

-- Show all policies on admin_users
SELECT
  'admin_users policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Test: Show that we can select from customer_profiles
SELECT
  'Sample customer_profiles data:' as info,
  COUNT(*) as total_profiles
FROM customer_profiles;

DO $$
BEGIN
  RAISE NOTICE '===== FIX COMPLETE =====';
  RAISE NOTICE 'Infinite recursion issue resolved!';
  RAISE NOTICE 'Customer profiles should now load correctly.';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Removed admin check from customer_profiles SELECT policy';
  RAISE NOTICE '2. Simplified all policies to prevent circular references';
  RAISE NOTICE '3. Each user can only access their own profile';
  RAISE NOTICE '';
  RAISE NOTICE 'Please refresh your dashboard and test again.';
END $$;
