// Test script to verify authentication fix
const puppeteer = require('puppeteer');

async function testAuthFlow() {
  let browser;
  try {
    console.log('🚀 Testing authentication flow...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen to console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AUTH') || text.includes('🔐') || text.includes('🛣️')) {
        console.log('Browser:', text);
      }
    });
    
    // Go to the landing page
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait a bit for auth to settle
    await page.waitForTimeout(2000);
    
    // Check if we're in a redirect loop
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Try to use the test login helper
    console.log('🔑 Testing login function...');
    const loginResult = await page.evaluate(() => {
      if (window.testEmailLogin) {
        return window.testEmailLogin();
      }
      return 'Login function not available';
    });
    
    console.log('Login result:', loginResult);
    
    // Wait for any redirects
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log('🏁 Final URL:', finalUrl);
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Authentication fix successful - redirected to dashboard!');
      return true;
    } else if (currentUrl === finalUrl) {
      console.log('⚠️  No redirect loop, but not on dashboard');
      return false;
    } else {
      console.log('❌ Still redirecting between pages');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testAuthFlow().then(success => {
  process.exit(success ? 0 : 1);
});