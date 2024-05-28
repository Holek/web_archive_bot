const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const username = process.env.WA_USERNAME;
  const password = process.env.WA_PASSWORD;
  const targetUrl = process.env.TARGET_URL;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to web.archive.org login page
  await page.goto('https://archive.org/account/login');

  // Screenshot before login
  await page.screenshot({ path: 'before_login.png' });

  await page.waitForSelector('form[name="login-form"]');

  // Login
  const loginForm = await page.$('form[name="login-form"]');
  await loginForm.type('input[name="username"]', username);
  await loginForm.type('input[name="password"]', password);
  await loginForm.click('input[type="submit"]');

  try {
    await page.waitForNavigation({ timeout: 60000 });
    // Screenshot after login
    await page.screenshot({ path: 'after_login.png' });
  } catch (error) {
    console.error('Login navigation timeout:', error);
    await page.screenshot({ path: 'login_timeout.png' });
    await browser.close();
    return;
  }

  // Navigate to the "Save Page Now" form
  await page.goto('https://web.archive.org/save');

  await page.waitForSelector('#web-save-form');
  // Screenshot before saving
  await page.screenshot({ path: 'before_saving.png' });

  // Input the target URL
  const saveForm = await page.$('#web-save-form');
  await saveForm.type('#web-save-url-input', targetUrl);
  await saveForm.click('#capture_outlinks');
  await saveForm.click('input[type="submit"]');

  // Wait for the snapshot to be saved
  await page.waitForSelector('#spn-result');
  // Screenshot after saving
  await page.screenshot({ path: 'after_saving.png' });

  console.log(`Snapshot for ${targetUrl} is being saved.`);

  await browser.close();
})();
