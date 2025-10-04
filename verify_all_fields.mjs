import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAllFields() {
  console.log('🔍 Starting comprehensive field verification...\n');
  
  // Step 1: Get data from Supabase
  console.log('📊 Step 1: Fetching data from Supabase...');
  const { data: metrics, error } = await supabase
    .from('executive_metrics')
    .select('*')
    .single();
  
  if (error) {
    console.error('❌ Error fetching from Supabase:', error);
    return;
  }
  
  console.log('✅ Supabase data fetched successfully\n');
  console.log('📋 Supabase Values:');
  console.log(JSON.stringify(metrics, null, 2));
  console.log('\n');
  
  // Step 2: Launch browser and check UI
  console.log('🌐 Step 2: Launching browser to check UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to dashboard
    console.log('📍 Navigating to dashboard...');
    await page.goto('https://reload2.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for data to load
    
    console.log('✅ Dashboard loaded\n');
    
    // Field mapping verification
    const fieldMappings = [
      // Core Metrics
      { 
        name: 'Meals Delivered',
        supabaseField: 'meals_delivered',
        selector: 'text=/Meals Delivered/i',
        valueSelector: null // Will find nearby number
      },
      { 
        name: 'People Served',
        supabaseField: 'people_served',
        selector: 'text=/People Served/i',
        valueSelector: null
      },
      { 
        name: 'Cost Per Meal',
        supabaseField: 'cost_per_meal',
        selector: 'text=/Cost Per Meal/i',
        valueSelector: null
      },
      { 
        name: 'Program Efficiency',
        supabaseField: 'program_efficiency',
        selector: 'text=/Program Efficiency/i',
        valueSelector: null
      },
      { 
        name: 'Revenue',
        supabaseField: 'revenue',
        selector: 'text=/Revenue/i',
        valueSelector: null
      },
      { 
        name: 'Expenses',
        supabaseField: 'expenses',
        selector: 'text=/Expenses/i',
        valueSelector: null
      },
      { 
        name: 'Reserves',
        supabaseField: 'reserves',
        selector: 'text=/Reserves/i',
        valueSelector: null
      },
      { 
        name: 'Cash Position',
        supabaseField: 'cash_position',
        selector: 'text=/Cash Position/i',
        valueSelector: null
      },
      { 
        name: 'Coverage Governorates',
        supabaseField: 'coverage_governorates',
        selector: 'text=/Coverage.*Governorates/i',
        valueSelector: null
      }
    ];
    
    console.log('🔍 Verifying field mappings...\n');
    
    const results = [];
    
    for (const field of fieldMappings) {
      console.log(`\n📌 Checking: ${field.name}`);
      console.log(`   Supabase field: ${field.supabaseField}`);
      console.log(`   Supabase value: ${metrics[field.supabaseField]}`);
      
      try {
        // Get the entire page content
        const pageContent = await page.content();
        
        // Try to find the field label
        const labelExists = await page.locator(field.selector).count() > 0;
        
        if (labelExists) {
          console.log(`   ✅ Label found in UI`);
          
          // Get all text content near the label
          const parentElement = await page.locator(field.selector).locator('..').textContent();
          console.log(`   UI content: ${parentElement}`);
          
          // Extract numbers from the content
          const numbers = parentElement.match(/[\d,]+\.?\d*/g);
          if (numbers) {
            console.log(`   Numbers found: ${numbers.join(', ')}`);
          }
          
          results.push({
            field: field.name,
            supabaseField: field.supabaseField,
            supabaseValue: metrics[field.supabaseField],
            labelFound: true,
            uiContent: parentElement
          });
        } else {
          console.log(`   ❌ Label NOT found in UI`);
          results.push({
            field: field.name,
            supabaseField: field.supabaseField,
            supabaseValue: metrics[field.supabaseField],
            labelFound: false,
            uiContent: null
          });
        }
      } catch (err) {
        console.log(`   ⚠️  Error checking field: ${err.message}`);
        results.push({
          field: field.name,
          supabaseField: field.supabaseField,
          supabaseValue: metrics[field.supabaseField],
          labelFound: false,
          error: err.message
        });
      }
    }
    
    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'dashboard_verification.png', fullPage: true });
    console.log('✅ Screenshot saved: dashboard_verification.png\n');
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    const foundCount = results.filter(r => r.labelFound).length;
    const totalCount = results.length;
    
    console.log(`Fields found: ${foundCount}/${totalCount}\n`);
    
    console.log('Detailed Results:');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.field}`);
      console.log(`   Supabase: ${result.supabaseField} = ${result.supabaseValue}`);
      console.log(`   UI Label: ${result.labelFound ? '✅ Found' : '❌ Not Found'}`);
      if (result.uiContent) {
        console.log(`   UI Content: ${result.uiContent.substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('\n❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyAllFields();
