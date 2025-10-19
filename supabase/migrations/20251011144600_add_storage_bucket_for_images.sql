/*
  # Add Storage Bucket for Product Images

  1. Storage Setup
    - Create a public storage bucket named 'product-images'
    - This bucket will store images for vehicles, batteries, and parts
    
  2. Security Policies
    - Allow public read access to all images (for displaying on website)
    - Allow authenticated users (admins) to upload images
    - Allow authenticated users (admins) to update/delete images
    
  3. Notes
    - Images will be organized by category: vehicles/, batteries/, parts/
    - Public access enables direct image URLs without authentication
    - Upload restrictions are controlled through RLS policies
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
