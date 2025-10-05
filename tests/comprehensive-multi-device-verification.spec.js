import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://8081-c8be9a28-bef3-487f-8bd4-38dccebfb252.proxy.daytona.works';

// Create results directory
const resultsDir = path.join(__dirname, '../test-results/multi-device-verification');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Device configurations
const devices = [
  { name: 'mobile', width: 375, height: 667, label: 'Mobile (iPhone SE)' },
  { name: 'tablet', width: 768, height: 1024, label: 'Tablet (iPad)' },
  { name: 'desktop', width: 1920, height: 1080, label: 'Desktop (Full HD)' }
];

// All pages/routes to test
const pages = [
  { path: '/', name: 'Dashboard Home', waitFor: 'text=Humanitarian Impact Dashboard' },
  { path: '/login', name: 'Login Page', waitFor: 'text=Sign In' },
  { path: '/admin', name: 'Admin Panel', waitFor: 'text=Admin', requiresAuth: true }
];

test.describe('Comprehensive Multi-Device Verification', () => {
  
  for (const device of devices) {
    for (const page of pages) {
      
      test(`${device.label} - ${page.name}`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height },
          userAgent: device.name === 'mobile' 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            : undefined
        });
        
        const browserPage = await context.newPage();
        
        // Track console errors
        const consoleErrors = [];
        const pageErrors = [];
        
        browserPage.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        browserPage.on('pageerror', error => {
          pageErrors.push(error.message);
        });
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔍 Testing: ${device.label} - ${page.name}`);
        console.log(`📐 Viewport: ${device.width}x${device.height}`);
        console.log(`🔗 URL: ${BASE_URL}${page.path}`);
        console.log('='.repeat(80));
        
        try {
          // Navigate to page
          console.log('📄 Navigating to page...');
          await browserPage.goto(`${BASE_URL}${page.path}`, { 
            waitUntil: 'networkidle', 
            timeout: 60000 
          });
          
          // Wait for page to load
          console.log(`⏳ Waiting for: ${page.waitFor}`);
          await browserPage.waitForSelector(page.waitFor, { timeout: 30000 });
          
          // Wait for content to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Take screenshot
          const screenshotPath = path.join(
            resultsDir, 
            `${device.name}-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`
          );
          await browserPage.screenshot({ 
            path: screenshotPath, 
            fullPage: true 
          });
          console.log(`📸 Screenshot saved: ${screenshotPath}`);
          
          // Check for visual issues
          console.log('\n🔍 Checking for visual issues...');
          
          // 1. Check for horizontal scrollbar (should not exist on mobile/tablet)
          const hasHorizontalScroll = await browserPage.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          
          if (hasHorizontalScroll && device.name !== 'desktop') {
            console.log(`  ⚠️  WARNING: Horizontal scrollbar detected on ${device.name}`);
          } else {
            console.log(`  ✅ No horizontal scrollbar`);
          }
          
          // 2. Check for overlapping elements
          const overlaps = await browserPage.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const overlapping = [];
            
            for (let i = 0; i < elements.length; i++) {
              const rect1 = elements[i].getBoundingClientRect();
              if (rect1.width === 0 || rect1.height === 0) continue;
              
              for (let j = i + 1; j < elements.length; j++) {
                const rect2 = elements[j].getBoundingClientRect();
                if (rect2.width === 0 || rect2.height === 0) continue;
                
                // Check if elements overlap
                if (!(rect1.right < rect2.left || 
                      rect1.left > rect2.right || 
                      rect1.bottom < rect2.top || 
                      rect1.top > rect2.bottom)) {
                  // Check if one contains the other (parent-child relationship is OK)
                  const contains1 = elements[i].contains(elements[j]);
                  const contains2 = elements[j].contains(elements[i]);
                  
                  if (!contains1 && !contains2) {
                    overlapping.push({
                      element1: elements[i].tagName + (elements[i].className && typeof elements[i].className === 'string' ? '.' + elements[i].className.split(' ')[0] : ''),
                      element2: elements[j].tagName + (elements[j].className && typeof elements[j].className === 'string' ? '.' + elements[j].className.split(' ')[0] : '')
                    });
                  }
                }
              }
            }
            
            return overlapping.slice(0, 5); // Return first 5 overlaps
          });
          
          if (overlaps.length > 0) {
            console.log(`  ⚠️  WARNING: ${overlaps.length} potential overlaps detected`);
            overlaps.forEach((overlap, i) => {
              console.log(`    ${i + 1}. ${overlap.element1} ↔ ${overlap.element2}`);
            });
          } else {
            console.log(`  ✅ No overlapping elements detected`);
          }
          
          // 3. Check for text overflow
          const textOverflows = await browserPage.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const overflowing = [];
            
            elements.forEach(el => {
              if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.overflow !== 'auto' && 
                    computedStyle.overflow !== 'scroll' &&
                    computedStyle.overflowX !== 'auto' &&
                    computedStyle.overflowX !== 'scroll') {
                  overflowing.push({
                    tag: el.tagName,
                    class: el.className,
                    text: el.textContent?.substring(0, 50)
                  });
                }
              }
            });
            
            return overflowing.slice(0, 5);
          });
          
          if (textOverflows.length > 0) {
            console.log(`  ⚠️  WARNING: ${textOverflows.length} elements with text overflow`);
          } else {
            console.log(`  ✅ No text overflow issues`);
          }
          
          // 4. Check for broken images
          const brokenImages = await browserPage.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.filter(img => !img.complete || img.naturalHeight === 0).length;
          });
          
          if (brokenImages > 0) {
            console.log(`  ⚠️  WARNING: ${brokenImages} broken images`);
          } else {
            console.log(`  ✅ All images loaded correctly`);
          }
          
          // 5. Check for console errors
          if (consoleErrors.length > 0) {
            console.log(`  ⚠️  WARNING: ${consoleErrors.length} console errors`);
            consoleErrors.slice(0, 3).forEach((error, i) => {
              console.log(`    ${i + 1}. ${error.substring(0, 100)}`);
            });
          } else {
            console.log(`  ✅ No console errors`);
          }
          
          // 6. Check for page errors
          if (pageErrors.length > 0) {
            console.log(`  ❌ CRITICAL: ${pageErrors.length} page errors`);
            pageErrors.forEach((error, i) => {
              console.log(`    ${i + 1}. ${error}`);
            });
          } else {
            console.log(`  ✅ No page errors`);
          }
          
          // 7. Check responsive breakpoints
          const responsiveIssues = await browserPage.evaluate((deviceWidth) => {
            const issues = [];
            
            // Check if elements are too wide
            const elements = Array.from(document.querySelectorAll('*'));
            elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.width > deviceWidth) {
                issues.push({
                  element: el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
                  width: rect.width
                });
              }
            });
            
            return issues.slice(0, 5);
          }, device.width);
          
          if (responsiveIssues.length > 0) {
            console.log(`  ⚠️  WARNING: ${responsiveIssues.length} elements wider than viewport`);
            responsiveIssues.forEach((issue, i) => {
              console.log(`    ${i + 1}. ${issue.element}: ${Math.round(issue.width)}px`);
            });
          } else {
            console.log(`  ✅ All elements fit within viewport`);
          }
          
          // Generate quality score
          const qualityScore = 100 - 
            (hasHorizontalScroll && device.name !== 'desktop' ? 15 : 0) -
            (overlaps.length > 0 ? 10 : 0) -
            (textOverflows.length > 0 ? 10 : 0) -
            (brokenImages > 0 ? 15 : 0) -
            (consoleErrors.length > 0 ? 10 : 0) -
            (pageErrors.length > 0 ? 20 : 0) -
            (responsiveIssues.length > 0 ? 10 : 0);
          
          console.log(`\n📊 Quality Score: ${qualityScore}/100`);
          
          if (qualityScore === 100) {
            console.log('🎉 PERFECT! No issues detected.');
          } else if (qualityScore >= 80) {
            console.log('✅ GOOD - Minor issues that should be fixed');
          } else if (qualityScore >= 60) {
            console.log('⚠️  NEEDS IMPROVEMENT - Several issues detected');
          } else {
            console.log('❌ CRITICAL - Major issues need immediate attention');
          }
          
          console.log('='.repeat(80) + '\n');
          
          // Test should pass if quality score is above threshold
          expect(qualityScore).toBeGreaterThanOrEqual(80);
          
        } catch (error) {
          console.log(`\n❌ ERROR: ${error.message}\n`);
          
          // Take error screenshot
          const errorScreenshotPath = path.join(
            resultsDir, 
            `ERROR-${device.name}-${page.name.toLowerCase().replace(/\s+/g, '-')}.png`
          );
          await browserPage.screenshot({ 
            path: errorScreenshotPath, 
            fullPage: true 
          });
          console.log(`📸 Error screenshot saved: ${errorScreenshotPath}`);
          
          throw error;
        } finally {
          await context.close();
        }
      });
    }
  }
  
  // Generate final report
  test('Generate comprehensive verification report', async () => {
    console.log('\n' + '='.repeat(80));
    console.log('📝 GENERATING COMPREHENSIVE VERIFICATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    const screenshots = fs.readdirSync(resultsDir).filter(f => f.endsWith('.png'));
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: devices.length * pages.length,
      devices: devices.map(d => d.label),
      pages: pages.map(p => p.name),
      screenshots: screenshots.length,
      screenshotsList: screenshots
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'verification-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Report generated successfully');
    console.log(`📊 Total tests: ${report.totalTests}`);
    console.log(`📸 Screenshots captured: ${report.screenshots}`);
    console.log(`📁 Results directory: ${resultsDir}`);
    console.log('\n' + '='.repeat(80) + '\n');
  });
});