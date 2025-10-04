import { chromium } from 'playwright';

async function testFinalIndicators() {
  console.log('🧪 Testing Final Global Indicators Implementation\n');
  console.log('Expected: 17 indicators (removed rain, added 6 commodities + EGX30)\n');
  
  const browser = await chromium.launch({ headless: true });
  
  // Test desktop view
  console.log('📱 Testing Desktop View (1920x1080)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  
  try {
    await desktopPage.goto('https://reload2.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('✅ Page loaded successfully');
    await desktopPage.waitForTimeout(5000);
    
    // Check for the 17 indicators (removed rain, added 6 new)
    const indicators = [
      // Row 1: Global Food & Economic Pressure
      'FAO Food Price Index',
      'Brent Crude Oil',
      'USD/EGP Exchange Rate',
      'Egypt EGX30 Index',
      // Row 2: Commodity Prices - Staples
      'Global Wheat Price',
      'White Rice Price',
      'Cooking Oil Price',
      'Beef Livestock Price',
      // Row 3: Feed Prices & Egypt Indicators
      'Chicken Feed Price',
      'Animal Feed Price',
      'Egypt Unemployment',
      'Egypt GDP Growth',
      // Row 4: Egypt Specific Indicators
      'Egypt CPI YoY',
      'CBE Food Inflation',
      'Cost of Healthy Diet',
      'Food Insecurity',
      // Row 5: Regional Impact
      'Refugees in Egypt'
    ];
    
    console.log('\n🔍 Checking for all 17 indicators...\n');
    
    const results = [];
    for (const indicator of indicators) {
      const found = await desktopPage.locator(`text=${indicator}`).count() > 0;
      results.push({ indicator, found, view: 'desktop' });
      console.log(`${found ? '✅' : '❌'} ${indicator}`);
    }
    
    // Check that rain card is NOT present
    const rainFound = await desktopPage.locator('text=/Rain.*ET/i').count() > 0;
    console.log(`\n${rainFound ? '❌ FAIL' : '✅ PASS'} Rain card removed: ${!rainFound}`);
    
    // Check for YoY indicators
    console.log('\n🔍 Checking for YoY variance indicators...');
    const yoyElements = await desktopPage.locator('text=/y\\/y|YoY/i').count();
    console.log(`${yoyElements > 0 ? '✅' : '❌'} YoY indicators found: ${yoyElements}`);
    
    // Take screenshot
    await desktopPage.screenshot({ 
      path: 'final_desktop_indicators.png', 
      fullPage: true 
    });
    console.log('\n📸 Desktop screenshot saved: final_desktop_indicators.png');
    
    await desktopContext.close();
    
    // Test mobile view
    console.log('\n📱 Testing Mobile View (375x667)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const mobilePage = await mobileContext.newPage();
    
    await mobilePage.goto('https://reload2.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await mobilePage.waitForTimeout(5000);
    
    console.log('\n🔍 Checking mobile layout...\n');
    
    let mobileCount = 0;
    for (const indicator of indicators) {
      const found = await mobilePage.locator(`text=${indicator}`).count() > 0;
      if (found) mobileCount++;
      console.log(`${found ? '✅' : '❌'} ${indicator}`);
    }
    
    await mobilePage.screenshot({ 
      path: 'final_mobile_indicators.png', 
      fullPage: true 
    });
    console.log('\n📸 Mobile screenshot saved: final_mobile_indicators.png');
    
    await mobileContext.close();
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    const desktopPass = results.filter(r => r.found).length;
    
    console.log(`Desktop: ${desktopPass}/${indicators.length} indicators found`);
    console.log(`Mobile:  ${mobileCount}/${indicators.length} indicators found`);
    console.log(`Rain card removed: ${!rainFound ? '✅ YES' : '❌ NO'}`);
    console.log(`YoY indicators present: ${yoyElements > 0 ? '✅ YES' : '❌ NO'}`);
    
    const allPassed = desktopPass === indicators.length && 
                      mobileCount === indicators.length &&
                      !rainFound &&
                      yoyElements > 0;
    
    if (allPassed) {
      console.log('\n✅ ALL TESTS PASSED! All 17 indicators visible, rain removed, YoY added.');
    } else {
      console.log('\n⚠️  Some tests failed. Check details above.');
    }
    
    // Check for new indicators specifically
    console.log('\n🆕 New Commodity Indicators Status:');
    const newIndicators = [
      'White Rice Price',
      'Cooking Oil Price', 
      'Beef Livestock Price',
      'Chicken Feed Price',
      'Animal Feed Price',
      'Egypt EGX30 Index'
    ];
    
    newIndicators.forEach(ind => {
      const desktop = results.find(r => r.indicator === ind)?.found;
      console.log(`  ${ind}: ${desktop ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFinalIndicators();