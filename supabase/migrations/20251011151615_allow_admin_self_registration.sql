/*
  # Allow Admin Self-Registration

  1. Policy Updates
    - Add policy to allow authenticated users to insert their own admin_users record
    - This enables the signup process to create the admin profile automatically

  2. Security Notes
    - Users can only insert records with their own user ID
    - Default role is enforced at table level (admin)
    - Super admin privileges still require manual promotion
*/

CREATE POLICY "Users can create their own admin profile"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
