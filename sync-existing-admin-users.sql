-- ============================================================
-- SYNC EXISTING AUTH USERS TO ADMIN_USERS TABLE
-- Run this in Supabase SQL Editor to add existing users
-- ============================================================

-- First, let's see what users exist in auth.users
-- (Uncomment to view)
-- SELECT id, email, created_at FROM auth.users;

-- Option 1: Insert ALL existing auth users as admins
-- (Use this if you want all your existing users to be admins)
INSERT INTO admin_users (id, email, full_name, role, is_active, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
  'admin' as role,
  true as is_active,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Option 2: Insert SPECIFIC users as admins
-- (Replace the email addresses with your actual admin emails)
/*
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT 
  id,
  email,
  split_part(email, '@', 1) as full_name,
  'admin' as role,
  true as is_active
FROM auth.users
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com'
  -- Add more admin emails here
)
ON CONFLICT (id) DO NOTHING;
*/

-- Verify the sync worked
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  au.created_at
FROM admin_users au
ORDER BY au.created_at DESC;
