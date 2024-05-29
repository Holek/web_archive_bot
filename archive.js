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
  const usernameField = await loginForm.$('input[name="username"]');
  await usernameField.type(username);
  const passwordField = await loginForm.$('input[name="password"]');
  await passwordField.type(password);
  const submitBtn = await loginForm.$('input[type="submit"]');
  await submitBtn.click();

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

  // Input the target URL
  const saveForm = await page.$('#web-save-form');
  const urlField = await saveForm.$('#web-save-url-input');
  await urlField.type(targetUrl);

  const captureOutlinks = await saveForm.$('#capture_outlinks');
  await captureOutlinks.click();

  // Screenshot before saving
  await page.screenshot({ path: 'before_saving.png' });
  const captureBtn = await saveForm.$('input[type="submit"]');
  await captureBtn.click();

  // Wait for the snapshot to be saved
  await page.waitForSelector('#spn-result');
  // Screenshot after saving
  await page.screenshot({ path: 'after_saving.png' });

  const year = (new Date()).getFullYear();
  
  console.log(`Snapshot for ${targetUrl} is being saved.`);
  console.log(`Check out previous snapshots at: https://web.archive.org/web/${year}0000000000*/${targetUrl}`);

  await browser.close();
})();
