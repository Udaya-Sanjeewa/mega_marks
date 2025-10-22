# How to Fix the Infinite Recursion Error

## Problem
You're seeing: "Failed to load vehicle ads: infinite recursion detected in policy for relation 'admin_users'"

## Root Cause
The RLS policies on `admin_users` table were checking if a user exists in `admin_users` to determine if they can read `admin_users`, creating a circular dependency.

## Solution

### Option 1: Apply SQL Fix in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase Dashboard: https://ewiikmidzpttnsloplex.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `APPLY-THIS-FIX.sql` file
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"
7. Refresh your admin vehicle ads page

### Option 2: If tables don't exist yet

If you get an error saying the tables don't exist, you need to create them first:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/20251022000000_ensure_customer_tables_and_policies.sql`
3. Then run `APPLY-THIS-FIX.sql`

## What the Fix Does

The fix changes the `admin_users` SELECT policy from:
```sql
-- BAD (causes infinite recursion)
USING (auth.uid() = id)
```

To:
```sql
-- GOOD (no recursion)
USING (true)
```

This allows all authenticated users to READ the `admin_users` table (but not modify it).
This is safe because:
- Users can only see who is an admin (read-only)
- They cannot insert, update, or delete admin records
- Customer data remains protected by separate policies

## Verification

After applying the fix:
1. Log out and log back in as admin
2. Go to Admin Dashboard → Vehicle Ads
3. You should see customer names instead of "Unknown Customer"
4. You should be able to view customer contact details

## Still Having Issues?

If you still see the error after applying the fix:
1. Make sure you're logged in as an admin user
2. Make sure the admin user exists in the `admin_users` table
3. Try logging out and back in
4. Check the browser console for additional error messages
