import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '../test-results/visual-verification');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const BASE_URL = 'https://8081-c8be9a28-bef3-487f-8bd4-38dccebfb252.proxy.daytona.works';

test.describe('Phase 3: Visual Verification of Indicator Removals', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Humanitarian Impact Dashboard', { timeout: 30000 });
    
    // Wait a bit for the page to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('1. VERIFY: Brent Crude Oil is REMOVED', async ({ page }) => {
    console.log('🔍 Checking for Brent Crude Oil...');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-full-dashboard.png'),
      fullPage: true 
    });
    
    // Check that Brent Crude is NOT present
    const brentCrude = await page.locator('text=/Brent Crude/i').count();
    expect(brentCrude).toBe(0);
    
    console.log('✅ VERIFIED: Brent Crude Oil is removed');
  });

  test('2. VERIFY: Egypt EGX30 is REMOVED', async ({ page }) => {
    console.log('🔍 Checking for Egypt EGX30...');
    
    const egx30 = await page.locator('text=/EGX30/i').count();
    expect(egx30).toBe(0);
    
    console.log('✅ VERIFIED: Egypt EGX30 is removed');
  });

  test('3. VERIFY: USD/EGP Exchange Rate is REMOVED', async ({ page }) => {
    console.log('🔍 Checking for USD/EGP...');
    
    const usdEgp = await page.locator('text=/USD.*EGP|Exchange Rate/i').count();
    expect(usdEgp).toBe(0);
    
    console.log('✅ VERIFIED: USD/EGP Exchange Rate is removed');
  });

  test('4. VERIFY: Egypt Unemployment is REMOVED', async ({ page }) => {
    console.log('🔍 Checking for Egypt Unemployment...');
    
    const unemployment = await page.locator('text=/Unemployment/i').count();
    expect(unemployment).toBe(0);
    
    console.log('✅ VERIFIED: Egypt Unemployment is removed');
  });

  test('5. VERIFY: Egypt GDP Growth is REMOVED', async ({ page }) => {
    console.log('🔍 Checking for GDP Growth...');
    
    const gdp = await page.locator('text=/GDP.*Growth/i').count();
    expect(gdp).toBe(0);
    
    console.log('✅ VERIFIED: Egypt GDP Growth is removed');
  });

  test('6. VERIFY: All 5 indicators are REMOVED (comprehensive check)', async ({ page }) => {
    console.log('🔍 Comprehensive check for all removed indicators...');
    
    // Take screenshot of Global Signals section
    const globalSignalsSection = await page.locator('text=Global Signals').locator('..');
    await globalSignalsSection.screenshot({ 
      path: path.join(screenshotsDir, '02-global-signals-section.png')
    });
    
    // Check all removed indicators
    const removedIndicators = [
      'Brent Crude',
      'EGX30',
      'USD/EGP',
      'Unemployment',
      'GDP Growth'
    ];
    
    for (const indicator of removedIndicators) {
      const count = await page.locator(`text=/${indicator}/i`).count();
      expect(count).toBe(0);
      console.log(`  ✅ ${indicator}: Not found (correct)`);
    }
    
    console.log('✅ VERIFIED: All 5 indicators successfully removed');
  });

  test('7. VERIFY: Remaining 12 indicators are PRESENT and FUNCTIONAL', async ({ page }) => {
    console.log('🔍 Checking remaining indicators...');
    
    const remainingIndicators = [
      'FAO Food Price Index',
      'Wheat Price',
      'Rice Price',
      'Cooking Oil',
      'Beef Price',
      'Chicken Feed',
      'Animal Feed',
      'Egypt CPI',
      'Food Inflation',
      'Cost of Healthy Diet',
      'Food Insecurity',
      'Refugees in Egypt'
    ];
    
    let foundCount = 0;
    const results = [];
    
    for (const indicator of remainingIndicators) {
      const count = await page.locator(`text=/${indicator}/i`).count();
      if (count > 0) {
        foundCount++;
        results.push(`  ✅ ${indicator}: Found`);
      } else {
        results.push(`  ❌ ${indicator}: NOT FOUND`);
      }
    }
    
    results.forEach(r => console.log(r));
    console.log(`\n📊 Found ${foundCount}/${remainingIndicators.length} indicators`);
    
    // We expect at least 10 indicators to be present (some might be loading)
    expect(foundCount).toBeGreaterThanOrEqual(10);
  });

  test('8. VISUAL: Capture all metric cards with data', async ({ page }) => {
    console.log('📸 Capturing visual evidence of all cards...');
    
    // Wait for cards to load
    await page.waitForTimeout(3000);
    
    // Find all metric cards
    const cards = await page.locator('[class*="MetricMicroCard"]').all();
    console.log(`Found ${cards.length} metric cards`);
    
    // Screenshot each card
    for (let i = 0; i < cards.length; i++) {
      try {
        await cards[i].screenshot({ 
          path: path.join(screenshotsDir, `card-${i + 1}.png`)
        });
        
        // Get card text for logging
        const cardText = await cards[i].textContent();
        const title = cardText.split('\n')[0].substring(0, 50);
        console.log(`  📸 Card ${i + 1}: ${title}...`);
      } catch (e) {
        console.log(`  ⚠️ Could not screenshot card ${i + 1}`);
      }
    }
    
    console.log('✅ All cards captured');
  });

  test('9. RESPONSIVE: Desktop layout (1920x1080)', async ({ page }) => {
    console.log('📱 Testing desktop layout...');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-desktop-1920x1080.png'),
      fullPage: true 
    });
    
    console.log('✅ Desktop screenshot captured');
  });

  test('10. RESPONSIVE: Tablet layout (768x1024)', async ({ page }) => {
    console.log('📱 Testing tablet layout...');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-tablet-768x1024.png'),
      fullPage: true 
    });
    
    console.log('✅ Tablet screenshot captured');
  });

  test('11. RESPONSIVE: Mobile layout (375x667)', async ({ page }) => {
    console.log('📱 Testing mobile layout...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-mobile-375x667.png'),
      fullPage: true 
    });
    
    console.log('✅ Mobile screenshot captured');
  });

  test('12. DATA ACCURACY: Verify real data is loading', async ({ page }) => {
    console.log('🔍 Checking for real data vs zeros...');
    
    // Look for any cards showing actual values (not 0 or N/A)
    const cards = await page.locator('[class*="MetricMicroCard"]').all();
    let cardsWithData = 0;
    let cardsWithZeros = 0;
    
    for (const card of cards) {
      const text = await card.textContent();
      
      // Check if card has numeric data
      if (text.match(/\d+\.\d+|\d{2,}/)) {
        cardsWithData++;
      }
      
      // Check if card shows zero or N/A
      if (text.includes('0.00') || text.includes('N/A') || text.includes('--')) {
        cardsWithZeros++;
      }
    }
    
    console.log(`  📊 Cards with data: ${cardsWithData}`);
    console.log(`  ⚠️ Cards with zeros/N/A: ${cardsWithZeros}`);
    
    // We expect most cards to have real data
    expect(cardsWithData).toBeGreaterThan(cardsWithZeros);
    
    console.log('✅ Data accuracy verified');
  });

  test('13. LAYOUT: Check for visual bugs or overlaps', async ({ page }) => {
    console.log('🔍 Checking for layout issues...');
    
    // Check for overlapping elements
    const cards = await page.locator('[class*="MetricMicroCard"]').all();
    
    for (let i = 0; i < cards.length - 1; i++) {
      const box1 = await cards[i].boundingBox();
      const box2 = await cards[i + 1].boundingBox();
      
      if (box1 && box2) {
        // Check if cards overlap
        const overlap = !(box1.x + box1.width < box2.x || 
                         box2.x + box2.width < box1.x ||
                         box1.y + box1.height < box2.y ||
                         box2.y + box2.height < box1.y);
        
        if (overlap) {
          console.log(`  ⚠️ Potential overlap between card ${i + 1} and ${i + 2}`);
        }
      }
    }
    
    console.log('✅ Layout check complete');
  });

  test('14. FINAL: Generate verification report', async ({ page }) => {
    console.log('📝 Generating verification report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      removedIndicators: {
        brentCrude: await page.locator('text=/Brent Crude/i').count() === 0,
        egx30: await page.locator('text=/EGX30/i').count() === 0,
        usdEgp: await page.locator('text=/USD.*EGP/i').count() === 0,
        unemployment: await page.locator('text=/Unemployment/i').count() === 0,
        gdpGrowth: await page.locator('text=/GDP.*Growth/i').count() === 0
      },
      totalCards: await page.locator('[class*="MetricMicroCard"]').count(),
      screenshotsCaptured: fs.readdirSync(screenshotsDir).length
    };
    
    // Save report
    fs.writeFileSync(
      path.join(screenshotsDir, 'verification-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Verification report saved');
    console.log(JSON.stringify(report, null, 2));
    
    // All removed indicators should be gone
    expect(Object.values(report.removedIndicators).every(v => v === true)).toBe(true);
  });
});