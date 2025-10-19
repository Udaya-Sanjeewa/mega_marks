/*
  # Add Storage Policy for Vehicle Listing Uploads

  ## Overview
  This migration adds RLS policies to allow anonymous users to upload images 
  when submitting vehicle listing requests through the public form.

  ## Changes
  
  ### Storage Policies
  - Allow anonymous users to upload images to the 'vehicle-listings/' folder
  - This enables customers to submit vehicle listings with photos without authentication
  - Images are stored in a separate folder for organization and potential moderation

  ## Security Considerations
  - Anonymous uploads are restricted to the 'vehicle-listings/' folder only
  - File size limits and mime type restrictions are enforced at bucket level
  - Admins can review and moderate uploaded images before approval
*/

-- Allow anonymous users to upload images for vehicle listing submissions
CREATE POLICY "Allow anonymous uploads to vehicle-listings folder"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = 'vehicle-listings'
  );

-- Allow anonymous users to read their uploaded images (for preview)
CREATE POLICY "Allow anonymous read for vehicle-listings folder"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = 'vehicle-listings'
  );
