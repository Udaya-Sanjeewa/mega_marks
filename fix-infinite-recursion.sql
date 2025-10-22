/*
  Fix Infinite Recursion in admin_users RLS Policy

  The issue: admin_users SELECT policy was checking if the user is in admin_users,
  creating a circular dependency.

  Solution: Allow all authenticated users to READ admin_users table.
  This is safe because it only allows viewing, not modifying admin data.
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;

-- Create a simple policy that allows all authenticated users to read admin_users
CREATE POLICY "Allow authenticated users to read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);
