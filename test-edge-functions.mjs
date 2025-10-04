import { createClient } from '@supabase/supabase-js';

// Test the Edge Functions locally
const BASE_URL = 'http://localhost:5173';

async function testEdgeFunctions() {
  console.log('🧪 Testing Edge Functions after TypeScript to JavaScript conversion\n');

  const tests = [
    { name: 'FFPI', url: `${BASE_URL}/api/ffpi` },
    { name: 'IMF CPI', url: `${BASE_URL}/api/imf-cpi` },
    { name: 'UNHCR Egypt', url: `${BASE_URL}/api/unhcr-egy` },
    { name: 'Wheat Prices', url: `${BASE_URL}/api/wheat` },
    { name: 'CBE Food Inflation', url: `${BASE_URL}/api/cbe-food-inflation` }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data points: ${data.series?.length || 0}`);
        console.log(`   Source: ${data.source || 'N/A'}`);
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
        const error = await response.text();
        console.log(`   Error: ${error}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Edge Function testing completed!');
}

// Run the test
testEdgeFunctions().catch(console.error);