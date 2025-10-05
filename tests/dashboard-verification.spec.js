import { test, expect } from '@playwright/test';

test.describe('Dashboard Verification Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://reload2.vercel.app');
    await page.waitForTimeout(5000); // Wait for data to load
  });

  test('should load dashboard without errors', async ({ page }) => {
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });

  test('should display all current indicators', async ({ page }) => {
    const content = await page.textContent('body');
    
    // Check for key indicators
    const indicators = [
      'Animal Feed',
      'Wheat Price',
      'Rice Price',
      'Cooking Oil',
      'Beef',
      'Chicken Feed',
      'Brent Crude',
      'FAO Food',
      'Egypt CPI'
    ];
    
    for (const indicator of indicators) {
      expect(content.toLowerCase()).toContain(indicator.toLowerCase());
    }
  });

  test('should display non-zero values', async ({ page }) => {
    const content = await page.textContent('body');
    
    // Check for specific API values
    const values = ['195.72', '173.19', '388.62', '934.5', '298.26', '383.52', '66.87'];
    
    for (const value of values) {
      expect(content).toContain(value);
    }
  });

  test('should have y/y and m/m indicators', async ({ page }) => {
    const content = await page.textContent('body');
    
    expect(content).toContain('y/y');
    expect(content).toContain('m/m');
  });

  test('should display executive dashboard metrics', async ({ page }) => {
    const content = await page.textContent('body');
    
    expect(content).toContain('Lives');
    expect(content).toContain('Meals');
    expect(content).toContain('Cost');
    expect(content).toContain('Coverage');
  });

  test('should display online donations section', async ({ page }) => {
    const content = await page.textContent('body');
    
    expect(content).toContain('Online Donations');
    expect(content).toContain('Total Donations');
  });

  test('should navigate to admin panel', async ({ page }) => {
    await page.goto('https://reload2.vercel.app/admin');
    await page.waitForTimeout(2000);
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toContain('login');
  });

  test('should have working API endpoints', async ({ page }) => {
    const endpoints = [
      '/api/animal-feed-price',
      '/api/wheat-price',
      '/api/rice-price',
      '/api/cooking-oil-price',
      '/api/beef-price',
      '/api/chicken-feed-price',
      '/api/brent-crude'
    ];
    
    for (const endpoint of endpoints) {
      const response = await page.goto(`https://reload2.vercel.app${endpoint}`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('points');
      expect(data.points.length).toBeGreaterThan(0);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://reload2.vercel.app');
    await page.waitForTimeout(3000);
    
    const content = await page.textContent('body');
    expect(content).toContain('Animal Feed');
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://reload2.vercel.app');
    await page.waitForTimeout(3000);
    
    const content = await page.textContent('body');
    expect(content).toContain('Animal Feed');
  });

  test('should take baseline screenshot', async ({ page }) => {
    await page.screenshot({ 
      path: 'tests/screenshots/baseline-full.png', 
      fullPage: true 
    });
  });

  test('should verify Supabase connection', async ({ page }) => {
    // Check if executive metrics are loading from Supabase
    const content = await page.textContent('body');
    
    // These values come from Supabase
    expect(content).toContain('2.0M'); // Lives
    expect(content).toContain('28.0M'); // Meals
  });

  test('should have no 404 errors', async ({ page }) => {
    const failed = [];
    
    page.on('response', response => {
      if (response.status() === 404) {
        failed.push(response.url());
      }
    });
    
    await page.waitForTimeout(5000);
    expect(failed.length).toBe(0);
  });

  test('should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://reload2.vercel.app', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

});