const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewiikmidzpttnsloplex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aWlrbWlkenB0dG5zbG9wbGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDE2NzAsImV4cCI6MjA3NTU3NzY3MH0.BGXPoPiBr78bl3sczQfz_BoeAj9IVe5U1SbSZSR2eX8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('Creating sample admin user...\n');

  const email = 'admin@megamarks.com';
  const password = 'Admin@123456';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (signUpError) {
    console.error('Error creating admin user:', signUpError.message);

    console.log('\nAttempting to sign in with existing credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Sign in failed:', signInError.message);
      console.log('\nAdmin user may already exist. Please try logging in with:');
      console.log('Email: admin@megamarks.com');
      console.log('Password: Admin@123456');
      return;
    }

    console.log('✓ Successfully signed in with existing admin account!');
    console.log('\nAdmin Login Credentials:');
    console.log('========================');
    console.log('Email: admin@megamarks.com');
    console.log('Password: Admin@123456');
    console.log('========================\n');

    const userId = signInData.user.id;

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!adminData) {
      console.log('Creating admin_users record...');
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: email,
          full_name: 'Admin User',
          role: 'super_admin',
          is_active: true
        });

      if (insertError) {
        console.error('Error creating admin_users record:', insertError.message);
      } else {
        console.log('✓ Admin profile created successfully!');
      }
    } else {
      console.log('✓ Admin profile already exists!');
    }

    await supabase.auth.signOut();
    return;
  }

  console.log('✓ Admin user created successfully!');
  console.log('\nAdmin Login Credentials:');
  console.log('========================');
  console.log('Email: admin@megamarks.com');
  console.log('Password: Admin@123456');
  console.log('========================\n');

  if (signUpData.user) {
    const userId = signUpData.user.id;

    console.log('Creating admin profile in admin_users table...');
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: email,
        full_name: 'Admin User',
        role: 'super_admin',
        is_active: true
      });

    if (adminError) {
      console.error('Error creating admin profile:', adminError.message);
    } else {
      console.log('✓ Admin profile created successfully!');
    }
  }

  console.log('\n✓ Setup complete! You can now log in to the admin dashboard.');
}

createAdmin().catch(console.error);
