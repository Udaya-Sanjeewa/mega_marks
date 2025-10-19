/*
  # Create Home Page Reviews Table

  1. New Table
    - `home_reviews` - Customer reviews for home page testimonials
      - `id` (uuid, primary key)
      - `customer_name` (text) - Name of the reviewer
      - `rating` (integer) - Rating from 1-5
      - `review_text` (text) - Review content
      - `review_date` (date) - Date of review
      - `verified_purchase` (boolean) - Whether this was a verified purchase
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on home_reviews table
    - Allow public read access to all reviews
    - Allow authenticated users (admins) to insert, update, and delete reviews
*/

-- Create home_reviews table
CREATE TABLE IF NOT EXISTS home_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date date DEFAULT CURRENT_DATE,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE home_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for home_reviews
CREATE POLICY "Allow public read access to home reviews"
  ON home_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert home reviews"
  ON home_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update home reviews"
  ON home_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete home reviews"
  ON home_reviews FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample home page reviews
INSERT INTO home_reviews (customer_name, rating, review_text, review_date, verified_purchase) VALUES
  ('Rajesh Kumar', 5, 'Mega Marks has been my go-to place for all EV needs. Outstanding service and genuine parts. Highly recommend!', '2025-08-15', true),
  ('Priya Singh', 5, 'Excellent experience! Bought a Nissan Leaf and got the battery replaced. Professional team and great prices.', '2025-08-28', true),
  ('Amit Patel', 5, 'Best EV service center in the region. They know everything about Nissan Leaf and provide honest advice.', '2025-09-10', true),
  ('Neha Sharma', 4, 'Very satisfied with my purchase. The staff is knowledgeable and helpful. Will definitely return for future needs.', '2025-09-22', true),
  ('Suresh Reddy', 5, 'Fantastic quality products and services. They helped me choose the right battery and installed it perfectly.', '2025-10-01', true),
  ('Kavita Joshi', 5, 'Trustworthy and reliable! I have purchased both parts and a vehicle from them. Very happy with everything.', '2025-10-08', true);
