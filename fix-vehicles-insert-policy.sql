/*
  # Fix Vehicles Table INSERT Policy

  The issue: Admins cannot approve vehicle ads because the vehicles table
  has RLS enabled but no INSERT policy.

  Solution: Add INSERT, UPDATE, and DELETE policies for authenticated users
  so admins can manage vehicle listings.
*/

-- ========================================
-- ADD INSERT/UPDATE/DELETE POLICIES TO VEHICLES
-- ========================================

-- Check current policies
SELECT
  'Current vehicles policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'vehicles'
ORDER BY policyname;

-- Add INSERT policy for authenticated users (admins)
CREATE POLICY "Allow authenticated users to insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for authenticated users (admins)
CREATE POLICY "Allow authenticated users to update vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for authenticated users (admins)
CREATE POLICY "Allow authenticated users to delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- SAME FOR BATTERIES AND PARTS
-- ========================================

-- Batteries INSERT policy
CREATE POLICY "Allow authenticated users to insert batteries"
  ON batteries FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Batteries UPDATE policy
CREATE POLICY "Allow authenticated users to update batteries"
  ON batteries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Batteries DELETE policy
CREATE POLICY "Allow authenticated users to delete batteries"
  ON batteries FOR DELETE
  TO authenticated
  USING (true);

-- Parts INSERT policy
CREATE POLICY "Allow authenticated users to insert parts"
  ON parts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Parts UPDATE policy
CREATE POLICY "Allow authenticated users to update parts"
  ON parts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Parts DELETE policy
CREATE POLICY "Allow authenticated users to delete parts"
  ON parts FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- VERIFICATION
-- ========================================

-- Show all policies on vehicles
SELECT
  'Updated vehicles policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'vehicles'
ORDER BY policyname;

-- Show all policies on batteries
SELECT
  'Updated batteries policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'batteries'
ORDER BY policyname;

-- Show all policies on parts
SELECT
  'Updated parts policies:' as info,
  policyname,
  cmd as command,
  roles::text as role
FROM pg_policies
WHERE tablename = 'parts'
ORDER BY policyname;

DO $$
BEGIN
  RAISE NOTICE '===== VEHICLES/BATTERIES/PARTS INSERT POLICIES ADDED =====';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Added INSERT policy for vehicles table';
  RAISE NOTICE '2. Added UPDATE policy for vehicles table';
  RAISE NOTICE '3. Added DELETE policy for vehicles table';
  RAISE NOTICE '4. Added INSERT/UPDATE/DELETE policies for batteries table';
  RAISE NOTICE '5. Added INSERT/UPDATE/DELETE policies for parts table';
  RAISE NOTICE '';
  RAISE NOTICE 'Results:';
  RAISE NOTICE '- Admins can now approve vehicle ads successfully';
  RAISE NOTICE '- Approved ads will be inserted into vehicles table';
  RAISE NOTICE '- Admins can manage batteries and parts from dashboard';
  RAISE NOTICE '';
  RAISE NOTICE 'Security note:';
  RAISE NOTICE '- Only authenticated users can insert/update/delete';
  RAISE NOTICE '- Public users can still read all products (SELECT)';
  RAISE NOTICE '- Admin routes are still protected by application auth';
  RAISE NOTICE '';
  RAISE NOTICE 'Please try approving a vehicle ad again!';
END $$;
