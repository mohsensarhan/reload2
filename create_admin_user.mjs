import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');
  
  const adminEmail = 'admin@reload2.com';
  const adminPassword = 'Admin123456789!'; // Strong password
  
  try {
    // Step 1: Create the auth user using admin API
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Auto-confirm email
    });
    
    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log('⚠️  User already exists in auth system');
        
        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError);
          return false;
        }
        
        const existingUser = users.find(u => u.email === adminEmail);
        if (!existingUser) {
          console.error('❌ Could not find existing user');
          return false;
        }
        
        console.log('✅ Found existing user:', existingUser.id);
        
        // Step 2: Update user record in users table
        console.log('\nStep 2: Updating user record in users table...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .upsert([{
            id: existingUser.id,
            email: adminEmail,
            role: 'admin',
          }], {
            onConflict: 'id'
          })
          .select()
          .single();
        
        if (userError) {
          console.error('❌ Error updating user record:', userError);
          return false;
        }
        
        console.log('✅ User record updated successfully');
        console.log('\n📊 Admin User Details:');
        console.log(`   - Email: ${adminEmail}`);
        console.log(`   - Password: ${adminPassword}`);
        console.log(`   - Role: admin`);
        console.log(`   - User ID: ${existingUser.id}`);
        
      } else {
        console.error('❌ Error creating auth user:', authError);
        console.error('   Message:', authError.message);
        console.error('   Status:', authError.status);
        return false;
      }
    } else {
      console.log('✅ Auth user created successfully');
      console.log('   User ID:', authData.user.id);
      
      // Step 2: Create user record in users table
      console.log('\nStep 2: Creating user record in users table...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: adminEmail,
          role: 'admin',
        }])
        .select()
        .single();
      
      if (userError) {
        console.error('❌ Error creating user record:', userError);
        return false;
      }
      
      console.log('✅ User record created successfully');
      console.log('\n📊 Admin User Details:');
      console.log(`   - Email: ${adminEmail}`);
      console.log(`   - Password: ${adminPassword}`);
      console.log(`   - Role: admin`);
      console.log(`   - User ID: ${authData.user.id}`);
    }
    
    console.log('\n🎉 Admin user setup completed!');
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🌐 Access the admin panel at:');
    console.log('   1. Login: https://reload2.vercel.app/login');
    console.log('   2. Admin Panel: https://reload2.vercel.app/admin');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

createAdminUser();
