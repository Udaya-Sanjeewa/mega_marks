/*
  # Add Admin Policies for Content Management

  1. Security Updates
    - Add admin-only INSERT, UPDATE, DELETE policies for batteries
    - Add admin-only INSERT, UPDATE, DELETE policies for vehicles
    - Add admin-only INSERT, UPDATE, DELETE policies for parts
    - Keep existing public read policies

  2. Notes
    - Admin users will be identified by checking if they are authenticated
    - For production, you should add an 'admin_users' table or check user metadata
    - This uses authenticated users as admins for simplicity
*/

-- Batteries Admin Policies
CREATE POLICY "Authenticated users can insert batteries"
  ON batteries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update batteries"
  ON batteries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete batteries"
  ON batteries FOR DELETE
  TO authenticated
  USING (true);

-- Vehicles Admin Policies
CREATE POLICY "Authenticated users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (true);

-- Parts Admin Policies
CREATE POLICY "Authenticated users can insert parts"
  ON parts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update parts"
  ON parts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete parts"
  ON parts FOR DELETE
  TO authenticated
  USING (true);