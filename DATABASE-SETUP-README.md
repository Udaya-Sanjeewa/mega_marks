# Database Setup Guide

This guide explains how to set up the customer authentication and vehicle ads system in your Supabase database.

## Overview

The system includes:
- Customer authentication and profiles
- Vehicle ad posting by customers
- Admin approval workflow for vehicle ads
- Automatic publishing of approved ads to the vehicles page

## Database Tables

### 1. customer_profiles
Stores customer information for registered users.

**Columns:**
- `id` - Primary key (auto-generated UUID)
- `user_id` - Foreign key to auth.users (unique)
- `full_name` - Customer's full name
- `email` - Customer's email address
- `phone` - Customer's phone number
- `address` - Customer's address
- `created_at` - Profile creation timestamp
- `updated_at` - Profile last update timestamp

### 2. customer_vehicle_ads
Stores vehicle advertisements posted by customers.

**Columns:**
- `id` - Primary key (auto-generated UUID)
- `user_id` - Foreign key to auth.users
- `make` - Vehicle manufacturer (e.g., "Nissan")
- `model` - Vehicle model (e.g., "Leaf")
- `year` - Vehicle year (integer)
- `price` - Asking price (numeric)
- `mileage` - Vehicle mileage in km (integer)
- `battery_capacity` - Battery capacity (e.g., "24 kWh")
- `condition` - Vehicle condition ("Excellent", "Good", "Fair")
- `color` - Vehicle color (optional)
- `description` - Detailed description (optional)
- `features` - Array of features (optional)
- `images` - Array of image URLs (optional)
- `status` - Ad status ("pending", "approved", "rejected")
- `created_at` - Ad creation timestamp
- `updated_at` - Ad last update timestamp

## Installation Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to the "SQL Editor" section
3. Click "New query"
4. Copy the contents of `database-setup-script.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the script

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or run the migration directly:

```bash
supabase db execute -f database-setup-script.sql
```

### Option 3: Using Migration Tool

You can also use the migration tool provided:

```bash
node apply-migration.js
```

## Security Configuration

The script automatically sets up Row Level Security (RLS) with the following policies:

### Customer Profiles
- Users can only view and edit their own profile
- Admins can view all profiles
- Users can create their profile upon signup

### Vehicle Ads
- Users can view, create, and edit their own ads
- Users can only edit ads that are in "pending" status
- Admins can view all ads
- Admins can update any ad (approve/reject)

## Workflow

### Customer Flow:
1. Customer signs up at `/customer/signup`
2. System creates user in `auth.users` and profile in `customer_profiles`
3. Customer logs in at `/customer/login`
4. Customer posts vehicle ad at `/sell-vehicle`
5. Ad is created with status "pending"
6. Customer can view their ads in dashboard at `/customer/dashboard`

### Admin Flow:
1. Admin reviews pending ads at `/admin/dashboard/vehicle-ads`
2. Admin can view full details of each ad
3. Admin approves or rejects the ad
4. When approved:
   - Ad status changes to "approved"
   - Vehicle is automatically added to the `vehicles` table
   - Vehicle appears on the public vehicles page

## Testing the Setup

After running the migration, you can test:

1. **Verify tables exist:**
   ```sql
   SELECT * FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('customer_profiles', 'customer_vehicle_ads');
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename IN ('customer_profiles', 'customer_vehicle_ads');
   ```

3. **Test customer signup:**
   - Go to `/customer/signup`
   - Create a new account
   - Check if profile is created in database

4. **Test ad posting:**
   - Login as customer
   - Go to `/sell-vehicle`
   - Post a vehicle ad
   - Check if ad appears in dashboard

5. **Test admin approval:**
   - Login as admin
   - Go to `/admin/dashboard/vehicle-ads`
   - Approve a pending ad
   - Check if vehicle appears in vehicles table

## Indexes

The script creates the following indexes for performance:
- `idx_customer_profiles_user_id` - Fast lookups by user
- `idx_customer_profiles_email` - Fast lookups by email
- `idx_customer_vehicle_ads_user_id` - Fast lookups of user's ads
- `idx_customer_vehicle_ads_status` - Fast filtering by status
- `idx_customer_vehicle_ads_created_at` - Fast sorting by date

## Automatic Timestamp Updates

The script includes triggers that automatically update the `updated_at` column whenever a record is modified.

## Data Validation

The following validations are enforced at the database level:
- Price must be >= 0
- Mileage must be >= 0
- Condition must be one of: "Excellent", "Good", "Fair"
- Status must be one of: "pending", "approved", "rejected"

## Troubleshooting

### Issue: Tables already exist
**Solution:** The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: RLS policies conflict
**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Issue: Foreign key constraint fails
**Solution:** Ensure the `admin_users` table exists from previous migrations. If not, remove or comment out admin-related policies.

### Issue: Cannot insert profile
**Solution:** Check that:
- User is authenticated
- `user_id` matches the authenticated user's ID
- RLS policies are enabled

## Additional Configuration

### Email Confirmation (Optional)
If you want to require email confirmation:
1. Go to Supabase Dashboard > Authentication > Settings
2. Enable "Email Confirmations"
3. Update the signup flow to handle confirmation

### Storage for Vehicle Images
The system uses the existing `product-images` bucket. Ensure it's configured with:
- Public access for reading
- Authenticated access for uploading
- Appropriate file size limits

## Support

For issues or questions:
1. Check the Supabase logs in your dashboard
2. Verify RLS policies are correctly applied
3. Test database queries in the SQL editor
4. Check browser console for client-side errors
