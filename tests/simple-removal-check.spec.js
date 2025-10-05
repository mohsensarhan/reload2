import { test, expect } from '@playwright/test';

const BASE_URL = 'https://8081-c8be9a28-bef3-487f-8bd4-38dccebfb252.proxy.daytona.works';

test.describe('Simple Indicator Removal Verification', () => {
  
  test('Verify all 5 indicators are removed from the page', async ({ page }) => {
    console.log('🚀 Navigating to dashboard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForSelector('text=Humanitarian Impact Dashboard', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the full page content
    const pageContent = await page.content();
    
    console.log('\n📋 Checking for removed indicators...\n');
    
    const removedIndicators = [
      { name: 'Brent Crude', patterns: ['Brent Crude', 'Brent Oil'] },
      { name: 'EGX30', patterns: ['EGX30', 'EGX 30', 'Egypt Stock'] },
      { name: 'USD/EGP', patterns: ['USD/EGP', 'USD EGP', 'Exchange Rate'] },
      { name: 'Unemployment', patterns: ['Unemployment', 'Egypt Unemployment'] },
      { name: 'GDP Growth', patterns: ['GDP Growth', 'GDP', 'Economic Growth'] }
    ];
    
    let allRemoved = true;
    
    for (const indicator of removedIndicators) {
      let found = false;
      for (const pattern of indicator.patterns) {
        if (pageContent.includes(pattern)) {
          console.log(`  ❌ ${indicator.name}: FOUND (pattern: "${pattern}")`);
          found = true;
          allRemoved = false;
          break;
        }
      }
      if (!found) {
        console.log(`  ✅ ${indicator.name}: NOT FOUND (correctly removed)`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    if (allRemoved) {
      console.log('✅ SUCCESS: All 5 indicators have been removed!');
    } else {
      console.log('❌ FAILURE: Some indicators are still present');
    }
    console.log('='.repeat(60) + '\n');
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/removal-verification.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/removal-verification.png');
    
    expect(allRemoved).toBe(true);
  });
});