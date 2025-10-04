import { chromium } from 'playwright';

async function testNewIndicators() {
  console.log('🧪 Testing New Global Indicators Implementation\n');
  
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
    
    // Wait for global indicators section to load
    await desktopPage.waitForTimeout(5000);
    
    // Check for the 12 indicators
    const indicators = [
      'FAO Food Price Index',
      'USD/EGP Exchange Rate',
      'Cost of Healthy Diet',
      'Food Insecurity',
      'Egypt CPI YoY',
      'CBE Food Inflation',
      'Rain - ET₀ Anomaly',
      'Refugees in Egypt',
      'Brent Crude Oil',
      'Global Wheat Price',
      'Egypt Unemployment',
      'Egypt GDP Growth'
    ];
    
    console.log('\n🔍 Checking for all 12 indicators...\n');
    
    const results = [];
    for (const indicator of indicators) {
      const found = await desktopPage.locator(`text=${indicator}`).count() > 0;
      results.push({ indicator, found, view: 'desktop' });
      console.log(`${found ? '✅' : '❌'} ${indicator}`);
    }
    
    // Take screenshot
    await desktopPage.screenshot({ 
      path: 'desktop_indicators.png', 
      fullPage: true 
    });
    console.log('\n📸 Desktop screenshot saved: desktop_indicators.png');
    
    await desktopContext.close();
    
    // Test tablet view
    console.log('\n📱 Testing Tablet View (768x1024)...');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('https://reload2.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await tabletPage.waitForTimeout(5000);
    
    console.log('\n🔍 Checking tablet layout...\n');
    
    for (const indicator of indicators) {
      const found = await tabletPage.locator(`text=${indicator}`).count() > 0;
      results.push({ indicator, found, view: 'tablet' });
      console.log(`${found ? '✅' : '❌'} ${indicator}`);
    }
    
    await tabletPage.screenshot({ 
      path: 'tablet_indicators.png', 
      fullPage: true 
    });
    console.log('\n📸 Tablet screenshot saved: tablet_indicators.png');
    
    await tabletContext.close();
    
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
    
    for (const indicator of indicators) {
      const found = await mobilePage.locator(`text=${indicator}`).count() > 0;
      results.push({ indicator, found, view: 'mobile' });
      console.log(`${found ? '✅' : '❌'} ${indicator}`);
    }
    
    await mobilePage.screenshot({ 
      path: 'mobile_indicators.png', 
      fullPage: true 
    });
    console.log('\n📸 Mobile screenshot saved: mobile_indicators.png');
    
    await mobileContext.close();
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    const desktopResults = results.filter(r => r.view === 'desktop');
    const tabletResults = results.filter(r => r.view === 'tablet');
    const mobileResults = results.filter(r => r.view === 'mobile');
    
    const desktopPass = desktopResults.filter(r => r.found).length;
    const tabletPass = tabletResults.filter(r => r.found).length;
    const mobilePass = mobileResults.filter(r => r.found).length;
    
    console.log(`Desktop: ${desktopPass}/${indicators.length} indicators found`);
    console.log(`Tablet:  ${tabletPass}/${indicators.length} indicators found`);
    console.log(`Mobile:  ${mobilePass}/${indicators.length} indicators found`);
    
    const allPassed = desktopPass === indicators.length && 
                      tabletPass === indicators.length && 
                      mobilePass === indicators.length;
    
    if (allPassed) {
      console.log('\n✅ ALL TESTS PASSED! All 12 indicators are visible on all devices.');
    } else {
      console.log('\n⚠️  Some indicators may not be visible on all devices.');
    }
    
    // Check for new indicators specifically
    console.log('\n🆕 New Indicators Status:');
    const newIndicators = ['Brent Crude Oil', 'Global Wheat Price', 'Egypt Unemployment', 'Egypt GDP Growth'];
    newIndicators.forEach(ind => {
      const desktop = results.find(r => r.indicator === ind && r.view === 'desktop')?.found;
      const tablet = results.find(r => r.indicator === ind && r.view === 'tablet')?.found;
      const mobile = results.find(r => r.indicator === ind && r.view === 'mobile')?.found;
      console.log(`  ${ind}:`);
      console.log(`    Desktop: ${desktop ? '✅' : '❌'}`);
      console.log(`    Tablet:  ${tablet ? '✅' : '❌'}`);
      console.log(`    Mobile:  ${mobile ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNewIndicators();