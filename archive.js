const puppeteer = require('puppeteer');

(async () => {
  const username = process.env.WA_USERNAME;
  const password = process.env.WA_PASSWORD;
  const targetUrl = process.env.TARGET_URL;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to web.archive.org login page
  await page.goto('https://archive.org/account/login');

  await page.waitForSelector('form[name="login-form"]');

  // Login
  const loginForm = await page.$('form[name="login-form"]');
  await loginForm.type('input[name="username"]', username);
  await loginForm.type('input[name="password"]', password);
  await loginForm.click('input[type="submit"]');
  await page.waitForNavigation();

  // Navigate to the "Save Page Now" form
  await page.goto('https://web.archive.org/save');

  await page.waitForSelector('#web-save-form');
  // Input the target URL
  const saveForm = await page.$('#web-save-form');
  await saveForm.type('#web-save-url-input', targetUrl);
  await saveForm.click('#capture_outlinks');
  await saveForm.click('input[type="submit"]');

  // Wait for the snapshot to be saved
  await page.waitForSelector('#spn-result');

  console.log(`Snapshot for ${targetUrl} is being saved.`);

  await browser.close();
})();
