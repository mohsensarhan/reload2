import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTg1Mzg1NSwiZXhwIjoyMDUxNDI5ODU1fQ.yaQUNKvdeti5q_t_DmMJVwL-JXwqJVLGYXvZJdvVMhI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAdminUser() {
  console.log('Checking for admin users...\n');
  
  // First check if users table exists
  const { data: tables, error: tablesError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (tablesError) {
    console.error('Error accessing users table:', tablesError);
    return;
  }
  
  // Now check for admin users
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Admin users found:', data.length);
  if (data.length > 0) {
    console.log('\nAdmin users:');
    data.forEach(user => {
      console.log(`  - Email: ${user.email}`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Created: ${user.created_at}`);
      console.log('');
    });
  } else {
    console.log('\n⚠️  No admin users found in the database!');
    console.log('You need to create an admin user first.');
  }
  
  // Also check all users
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('*');
  
  if (!allError) {
    console.log('\nTotal users in database:', allUsers.length);
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach(user => {
        console.log(`  - Email: ${user.email}, Role: ${user.role}`);
      });
    }
  }
}

checkAdminUser();
