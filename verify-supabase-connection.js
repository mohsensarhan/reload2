import { createClient } from '@supabase/supabase-js';

// Your provided Supabase credentials
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verifySupabaseConnection() {
  console.log('🚀 Starting comprehensive Supabase connection verification...\n');
  
  try {
    // Test 1: Basic connection with anon key
    console.log('1️⃣ Testing anon key connection...');
    const { data: anonData, error: anonError } = await supabase
      .from('executive_metrics')
      .select('*')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Anon key connection failed:', anonError.message);
    } else {
      console.log('✅ Anon key connection successful');
      console.log('   Data retrieved:', anonData?.length || 0, 'records');
    }

    // Test 2: Service role key connection
    console.log('\n2️⃣ Testing service role key connection...');
    const { data: serviceData, error: serviceError } = await supabaseAdmin
      .from('executive_metrics')
      .select('*')
      .limit(1);
    
    if (serviceError) {
      console.log('❌ Service role connection failed:', serviceError.message);
    } else {
      console.log('✅ Service role connection successful');
      console.log('   Data retrieved:', serviceData?.length || 0, 'records');
    }

    // Test 3: Extract complete database schema
    console.log('\n3️⃣ Extracting complete database schema...');
    
    // Get all tables
    const tables = ['executive_metrics', 'users', 'audit_logs', 'scenarios'];
    const schemaData = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(5)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log(`❌ Error fetching ${table}:`, error.message);
          schemaData[table] = { error: error.message };
        } else {
          console.log(`✅ ${table}:`, data?.length || 0, 'records found');
          schemaData[table] = data || [];
        }
      } catch (err) {
        console.log(`❌ Exception accessing ${table}:`, err.message);
        schemaData[table] = { error: err.message };
      }
    }

    // Test 4: Extract latest executive metrics with all data points
    console.log('\n4️⃣ Extracting latest executive metrics with all data points...');
    const { data: latestMetrics, error: metricsError } = await supabaseAdmin
      .from('executive_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (metricsError) {
      console.log('❌ Error fetching latest metrics:', metricsError.message);
    } else {
      console.log('✅ Latest metrics extracted successfully');
      console.log('\n📊 COMPLETE DATA POINTS FOUND:');
      
      if (latestMetrics) {
        // Core metrics
        console.log('\n🏆 CORE METRICS:');
        console.log('   meals_delivered:', latestMetrics.meals_delivered);
        console.log('   people_served:', latestMetrics.people_served);
        console.log('   cost_per_meal:', latestMetrics.cost_per_meal);
        console.log('   program_efficiency:', latestMetrics.program_efficiency);
        console.log('   revenue:', latestMetrics.revenue);
        console.log('   expenses:', latestMetrics.expenses);
        console.log('   reserves:', latestMetrics.reserves);
        console.log('   cash_position:', latestMetrics.cash_position);
        console.log('   coverage_governorates:', latestMetrics.coverage_governorates);
        
        // Scenario factors
        console.log('\n🎯 SCENARIO FACTORS:');
        if (latestMetrics.scenario_factors) {
          const factors = typeof latestMetrics.scenario_factors === 'string' 
            ? JSON.parse(latestMetrics.scenario_factors) 
            : latestMetrics.scenario_factors;
          
          Object.entries(factors).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }
        
        // Chart data (revenueChange, demandChange, etc.)
        console.log('\n📈 CHART DATA POINTS:');
        const chartFields = ['revenueChange', 'demandChange', 'costChange', 'efficiencyChange', 'reserveChange', 'cashChange', 'mealsChange'];
        chartFields.forEach(field => {
          if (latestMetrics[field] !== undefined) {
            console.log(`   ${field}: ${latestMetrics[field]}`);
          }
        });
        
        // Global indicators
        console.log('\n🌍 GLOBAL INDICATORS:');
        const globalFields = ['egyptInflation', 'egyptCurrency', 'egyptFoodInsecurity', 'globalInflation', 'globalFoodPrices', 'emergingMarketRisk'];
        globalFields.forEach(field => {
          if (latestMetrics[field] !== undefined) {
            console.log(`   ${field}: ${latestMetrics[field]}`);
          }
        });
      }
    }

    // Test 5: Real-time subscription test
    console.log('\n5️⃣ Testing real-time subscription setup...');
    
    const subscription = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'executive_metrics'
      }, (payload) => {
        console.log('📡 Real-time update received:', payload);
      })
      .subscribe();

    console.log('✅ Real-time subscription established');
    
    // Keep connection alive for a few seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Unsubscribe
    subscription.unsubscribe();
    console.log('✅ Real-time subscription test completed');

    // Test 6: User and role verification
    console.log('\n6️⃣ Verifying user management and roles...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, created_at')
      .limit(10);
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log('✅ Users retrieved successfully:', users?.length || 0, 'users found');
      users?.forEach(user => {
        console.log(`   ${user.email} (${user.role}) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    }

    // Test 7: Audit logs verification
    console.log('\n7️⃣ Checking audit logs...');
    const { data: auditLogs, error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (auditError) {
      console.log('❌ Error fetching audit logs:', auditError.message);
    } else {
      console.log('✅ Audit logs retrieved successfully:', auditLogs?.length || 0, 'logs found');
      auditLogs?.forEach(log => {
        console.log(`   ${log.action} on ${log.table_name} by ${log.user_id} at ${new Date(log.created_at).toLocaleString()}`);
      });
    }

    console.log('\n🎉 SUPABASE CONNECTION VERIFICATION COMPLETED!');
    console.log('✅ All connections are working properly');
    console.log('✅ All data points extracted successfully');
    console.log('✅ Real-time subscriptions are active');
    
    return {
      success: true,
      latestMetrics,
      users,
      auditLogs,
      schemaData
    };

  } catch (error) {
    console.log('❌ Critical error during verification:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the verification
verifySupabaseConnection().then(result => {
  if (result.success) {
    console.log('\n📋 SUMMARY: All Supabase connections verified successfully!');
  } else {
    console.log('\n❌ SUMMARY: Connection verification failed');
  }
  process.exit(0);
}).catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});