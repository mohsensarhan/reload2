import { createClient } from '@supabase/supabase-js';

// Verify the deployment fixes work correctly
console.log('🔍 VERCEL DEPLOYMENT VERIFICATION');
console.log('Testing all Edge Functions after TypeScript to JavaScript conversion\n');

const BASE_URL = 'http://localhost:5173';

const edgeFunctions = [
  { name: 'CBE Food Inflation', url: `${BASE_URL}/api/cbe-food-inflation`, expectedSource: 'CBE' },
  { name: 'FFPI', url: `${BASE_URL}/api/ffpi`, expectedSource: 'FAO' },
  { name: 'IMF CPI', url: `${BASE_URL}/api/imf-cpi`, expectedSource: 'IMF' },
  { name: 'UNHCR Egypt', url: `${BASE_URL}/api/unhcr-egy`, expectedSource: 'UNHCR' },
  { name: 'Wheat Prices', url: `${BASE_URL}/api/wheat`, expectedSource: 'USDA' }
];

async function verifyDeployment() {
  let successCount = 0;
  let totalCount = edgeFunctions.length;

  for (const func of edgeFunctions) {
    try {
      console.log(`\n🧪 Testing ${func.name}...`);
      
      const response = await fetch(func.url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Verify the response structure
        const hasSeries = Array.isArray(data.series) && data.series.length > 0;
        const correctSource = data.source === func.expectedSource;
        const hasUnit = typeof data.unit === 'string';
        const hasFrequency = typeof data.frequency === 'string';
        
        if (hasSeries && correctSource && hasUnit && hasFrequency) {
          console.log(`✅ ${func.name}: SUCCESS`);
          console.log(`   Source: ${data.source}`);
          console.log(`   Unit: ${data.unit}`);
          console.log(`   Frequency: ${data.frequency}`);
          console.log(`   Data points: ${data.series.length}`);
          successCount++;
        } else {
          console.log(`❌ ${func.name}: INVALID RESPONSE STRUCTURE`);
          console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
        }
      } else {
        console.log(`❌ ${func.name}: HTTP ERROR ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${func.name}: NETWORK ERROR`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 Success Rate: ${Math.round((successCount / totalCount) * 100)}%`);

  if (successCount === totalCount) {
    console.log('\n🎉 ALL EDGE FUNCTIONS WORKING PERFECTLY!');
    console.log('✅ Vercel deployment should now succeed');
    console.log('✅ No more TypeScript module reference errors');
  } else {
    console.log('\n⚠️  Some Edge Functions are still having issues');
    console.log('Check the error messages above and fix accordingly');
  }

  return successCount === totalCount;
}

// Test the build process as well
async function testBuild() {
  console.log('\n🔨 TESTING BUILD PROCESS...');
  
  const { execSync } = await import('child_process');
  
  try {
    execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() });
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.log('❌ Build failed');
    console.log('Error:', error.message);
    return false;
  }
}

// Run complete verification
async function completeVerification() {
  const functionsWorking = await verifyDeployment();
  const buildWorking = await testBuild();

  console.log('\n' + '🎯'.repeat(20));
  console.log('🎯 FINAL VERIFICATION RESULT');
  console.log('🎯'.repeat(20));

  if (functionsWorking && buildWorking) {
    console.log('\n✅ DEPLOYMENT READY!');
    console.log('✅ All Edge Functions working correctly');
    console.log('✅ Build process successful');
    console.log('✅ No TypeScript import errors');
    console.log('\n🚀 Ready to deploy to Vercel!');
  } else {
    console.log('\n❌ ISSUES DETECTED');
    if (!functionsWorking) console.log('❌ Some Edge Functions not working');
    if (!buildWorking) console.log('❌ Build process failing');
    console.log('\n🔧 Please fix the issues above before deploying');
  }
}

// Run the verification
completeVerification().catch(console.error);