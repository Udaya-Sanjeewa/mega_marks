const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewiikmidzpttnsloplex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aWlrbWlkenB0dG5zbG9wbGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDE2NzAsImV4cCI6MjA3NTU3NzY3MH0.BGXPoPiBr78bl3sczQfz_BoeAj9IVe5U1SbSZSR2eX8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdminToTable() {
  console.log('Signing in as admin user...\n');

  const email = 'admin@megamarks.com';
  const password = 'Admin@123456';

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (signInError) {
    console.error('Sign in failed:', signInError.message);
    console.log('\nPlease ensure the admin user was created successfully.');
    return;
  }

  console.log('✓ Signed in successfully!');
  const userId = signInData.user.id;
  console.log('User ID:', userId);

  console.log('\nChecking if admin profile exists...');
  const { data: existingAdmin, error: checkError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking admin profile:', checkError.message);
    await supabase.auth.signOut();
    return;
  }

  if (existingAdmin) {
    console.log('✓ Admin profile already exists!');
    console.log('Profile:', JSON.stringify(existingAdmin, null, 2));
  } else {
    console.log('Creating admin profile...');
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: email,
        full_name: 'Admin User',
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin profile:', insertError.message);
    } else {
      console.log('✓ Admin profile created successfully!');
      console.log('Profile:', JSON.stringify(newAdmin, null, 2));
    }
  }

  console.log('\n========================================');
  console.log('Admin Login Credentials:');
  console.log('========================================');
  console.log('Email: admin@megamarks.com');
  console.log('Password: Admin@123456');
  console.log('Role: super_admin');
  console.log('========================================');

  await supabase.auth.signOut();
  console.log('\n✓ Setup complete!');
}

addAdminToTable().catch(console.error);
