# Setup Instructions for Customer Authentication System

## Quick Setup

Run this SQL script in your Supabase SQL Editor:

**File:** `complete-database-setup.sql`

This single script creates all necessary tables and security policies.

## Step-by-Step Setup

If you prefer to understand each step, follow these instructions:

### Step 1: Create Admin Users Table

This table is required for the admin approval system to work.

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Customer Profiles Table

```sql
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create Customer Vehicle Ads Table

```sql
CREATE TABLE IF NOT EXISTS customer_vehicle_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  mileage integer NOT NULL CHECK (mileage >= 0),
  battery_capacity text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  color text,
  description text,
  features text[],
  images text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_vehicle_ads ENABLE ROW LEVEL SECURITY;
```

### Step 4: Apply Security Policies

Run the complete script `complete-database-setup.sql` which includes all necessary RLS policies.

## Creating Your First Admin User

After running the database setup:

### Option 1: Via Supabase Dashboard

1. Go to Authentication > Users in Supabase Dashboard
2. Create a new user (or use existing admin user)
3. Note the user's UUID
4. Go to SQL Editor and run:

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'USER_UUID_HERE',
  'admin@megamask.lk',
  'Admin Name',
  'super_admin',
  true
);
```

### Option 2: Via Application

If you already have admin login working with a user in auth.users:

```sql
-- Replace with your actual admin user ID
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  'System Admin',
  'super_admin',
  true
FROM auth.users
WHERE email = 'your-admin@email.com';
```

## Testing the System

### Test 1: Customer Signup
1. Go to `/customer/signup`
2. Fill in the form and create an account
3. Check database:
```sql
SELECT * FROM customer_profiles ORDER BY created_at DESC LIMIT 1;
```

### Test 2: Customer Login
1. Go to `/customer/login`
2. Login with the credentials you created
3. You should be redirected to `/customer/dashboard`

### Test 3: Post Vehicle Ad
1. While logged in as customer, go to `/sell-vehicle`
2. Fill in the vehicle information
3. Submit the ad
4. Check database:
```sql
SELECT * FROM customer_vehicle_ads ORDER BY created_at DESC LIMIT 1;
```

### Test 4: Admin Approval
1. Login as admin at `/admin/login`
2. Go to `/admin/dashboard/vehicle-ads`
3. You should see the pending ad
4. Click "Approve" button
5. Check that vehicle appears in the vehicles table:
```sql
SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 1;
```

### Test 5: View Approved Vehicle
1. Go to `/vehicles` page
2. The approved vehicle should appear in the list

## Troubleshooting

### Error: "relation admin_users does not exist"
**Solution:** Run the `complete-database-setup.sql` script which creates this table.

### Error: "permission denied for table customer_profiles"
**Solution:**
1. Check that RLS is enabled: `ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;`
2. Re-run the policies section from `complete-database-setup.sql`

### Customer can't see their profile
**Solution:** Make sure the customer is authenticated and the `user_id` in `customer_profiles` matches their auth.users ID.

### Admin can't see vehicle ads
**Solution:**
1. Verify admin user exists in `admin_users` table
2. Check that `is_active = true` for the admin
3. Re-apply the RLS policies

### Vehicle ad doesn't appear after approval
**Solution:** Check the admin approval page code - it should insert into the `vehicles` table when approving. The approved ad should have:
- Status changed to 'approved' in `customer_vehicle_ads`
- New entry created in `vehicles` table

## Database Structure Summary

```
auth.users (Supabase built-in)
    ├── admin_users (admin metadata)
    ├── customer_profiles (customer information)
    └── customer_vehicle_ads (vehicle ads pending approval)

vehicles (existing table)
    └── Approved ads are copied here
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Customers** can only view and edit their own data
3. **Admins** can view all data and approve/reject ads
4. **Foreign keys** ensure data integrity
5. **Check constraints** validate data (price >= 0, valid condition, etc.)

## Additional Configuration

### Email Notifications (Optional)
You can set up email notifications when:
- Customer ad is approved/rejected
- Admin receives new ad submission

Use Supabase Edge Functions or database triggers with email service integration.

### Image Upload Configuration
The system uses the `product-images` storage bucket. Ensure:
1. Bucket exists in Supabase Storage
2. Public access enabled for reading
3. Authenticated users can upload
4. File size limits are appropriate (e.g., 10MB per image)

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify all tables exist: `\dt` in SQL editor
3. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename IN ('customer_profiles', 'customer_vehicle_ads');`
4. Test authentication in browser console
5. Check network requests in browser DevTools
