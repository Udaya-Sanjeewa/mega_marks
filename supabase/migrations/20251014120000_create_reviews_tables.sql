/*
  # Create Customer Reviews Tables

  1. New Tables
    - `battery_reviews` - Customer reviews for batteries
      - `id` (uuid, primary key)
      - `customer_name` (text) - Name of the reviewer
      - `rating` (integer) - Rating from 1-5
      - `review_text` (text) - Review content
      - `review_date` (date) - Date of review
      - `verified_purchase` (boolean) - Whether this was a verified purchase
      - `created_at` (timestamptz)

    - `vehicle_reviews` - Customer reviews for vehicles
      - Same structure as battery_reviews

    - `part_reviews` - Customer reviews for parts
      - Same structure as battery_reviews

  2. Security
    - Enable RLS on all review tables
    - Allow public read access to all reviews
    - Allow authenticated users (admins) to insert, update, and delete reviews
*/

-- Create battery_reviews table
CREATE TABLE IF NOT EXISTS battery_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date date DEFAULT CURRENT_DATE,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create vehicle_reviews table
CREATE TABLE IF NOT EXISTS vehicle_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date date DEFAULT CURRENT_DATE,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create part_reviews table
CREATE TABLE IF NOT EXISTS part_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date date DEFAULT CURRENT_DATE,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE battery_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for battery_reviews
CREATE POLICY "Allow public read access to battery reviews"
  ON battery_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert battery reviews"
  ON battery_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update battery reviews"
  ON battery_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete battery reviews"
  ON battery_reviews FOR DELETE
  TO authenticated
  USING (true);

-- Policies for vehicle_reviews
CREATE POLICY "Allow public read access to vehicle reviews"
  ON vehicle_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert vehicle reviews"
  ON vehicle_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vehicle reviews"
  ON vehicle_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vehicle reviews"
  ON vehicle_reviews FOR DELETE
  TO authenticated
  USING (true);

-- Policies for part_reviews
CREATE POLICY "Allow public read access to part reviews"
  ON part_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert part reviews"
  ON part_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update part reviews"
  ON part_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete part reviews"
  ON part_reviews FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample battery reviews
INSERT INTO battery_reviews (customer_name, rating, review_text, review_date, verified_purchase) VALUES
  ('Rajesh Kumar', 5, 'Excellent battery replacement! My Nissan Leaf now runs like new. The CATL battery has great range and the installation was professional.', '2025-09-15', true),
  ('Priya Singh', 5, 'Very satisfied with the battery quality. The range has improved significantly and the warranty gives me peace of mind.', '2025-09-20', true),
  ('Amit Patel', 4, 'Good product overall. Installation took a bit longer than expected but the battery performance is excellent.', '2025-09-25', true),
  ('Neha Sharma', 5, 'Best decision I made for my EV! The battery capacity is exactly as advertised and customer service was great.', '2025-10-01', true),
  ('Suresh Reddy', 4, 'Quality battery with good range. Price is a bit high but worth it for the reliability and warranty.', '2025-10-05', true);

-- Insert sample vehicle reviews
INSERT INTO vehicle_reviews (customer_name, rating, review_text, review_date, verified_purchase) VALUES
  ('Vikram Malhotra', 5, 'Purchased a 2020 Nissan Leaf and I am extremely happy! The car was in excellent condition and drives smoothly.', '2025-08-10', true),
  ('Anjali Desai', 5, 'Great experience buying from this dealer. The vehicle quality is top-notch and all features work perfectly.', '2025-08-22', true),
  ('Rahul Verma', 4, 'Good car but had a minor issue with the charging port which was fixed promptly. Overall satisfied with the purchase.', '2025-09-05', true),
  ('Kavita Joshi', 5, 'Love my new electric car! Very smooth ride and the battery health is excellent. Highly recommend!', '2025-09-18', true),
  ('Deepak Agarwal', 5, 'Fantastic vehicle with low mileage. The team was very helpful throughout the purchase process.', '2025-10-02', true);

-- Insert sample part reviews
INSERT INTO part_reviews (customer_name, rating, review_text, review_date, verified_purchase) VALUES
  ('Sandeep Gupta', 5, 'Ordered brake pads and they fit perfectly. Quality is excellent and shipping was fast.', '2025-09-12', true),
  ('Meera Iyer', 5, 'The charging cable works perfectly with my Leaf. Good quality product at a reasonable price.', '2025-09-19', true),
  ('Arjun Nair', 4, 'Dashboard display replacement was good quality. Installation instructions could be more detailed.', '2025-09-26', true),
  ('Pooja Kapoor', 5, 'Excellent service! The motor controller replacement part works flawlessly. Very satisfied.', '2025-10-03', true),
  ('Manish Saxena', 4, 'Good quality parts and genuine products. Delivery was slightly delayed but product quality made up for it.', '2025-10-08', true);
