import puppeteer from 'puppeteer';

const url = 'https://8081-c8be9a28-bef3-487f-8bd4-38dccebfb252.proxy.daytona.works';

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[CONSOLE ${type.toUpperCase()}]:`, text);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]:', error.message);
  });
  
  // Capture failed requests
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]:', request.url(), request.failure().errorText);
  });
  
  console.log('📄 Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('⏳ Waiting 5 seconds for app to load...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check what's in the DOM
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('\n📋 Body HTML length:', bodyHTML.length);
  console.log('📋 Body HTML preview:', bodyHTML.substring(0, 500));
  
  // Check for specific elements
  const hasRoot = await page.evaluate(() => !!document.getElementById('root'));
  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'EMPTY');
  
  console.log('\n🔍 Root element exists:', hasRoot);
  console.log('🔍 Root content length:', rootContent.length);
  console.log('🔍 Root content preview:', rootContent.substring(0, 500));
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('\n📸 Screenshot saved to debug-screenshot.png');
  
  await browser.close();
  console.log('✅ Done!');
})();