/*
  # Fix Customer Profile Issues

  This migration fixes the customer profile creation and RLS policies.

  ## Changes
  1. Update RLS policies to allow profile insertion during signup
  2. Create a trigger to automatically create customer profiles
  3. Manually create missing profiles for existing users
*/

-- ========================================
-- 1. UPDATE RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;

-- Recreate the insert policy with proper permissions
CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also allow anon users to insert during signup
CREATE POLICY IF NOT EXISTS "Allow signup profile creation"
  ON customer_profiles FOR INSERT
  TO anon
  WITH CHECK (true);

-- ========================================
-- 2. CREATE TRIGGER FOR AUTO PROFILE CREATION
-- ========================================

-- Function to automatically create customer profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user metadata has the required fields
  IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    INSERT INTO public.customer_profiles (user_id, full_name, email, phone, address)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'address', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. MANUALLY CREATE MISSING PROFILES
-- ========================================

-- Create profiles for any existing users who don't have one
INSERT INTO customer_profiles (user_id, full_name, email, phone, address)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  u.email,
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  COALESCE(u.raw_user_meta_data->>'address', '')
FROM auth.users u
LEFT JOIN customer_profiles cp ON cp.user_id = u.id
WHERE cp.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- SETUP COMPLETE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Customer profile fixes applied successfully!';
  RAISE NOTICE '1. RLS policies updated to allow profile creation';
  RAISE NOTICE '2. Auto-creation trigger installed for new signups';
  RAISE NOTICE '3. Missing profiles created for existing users';
END $$;
