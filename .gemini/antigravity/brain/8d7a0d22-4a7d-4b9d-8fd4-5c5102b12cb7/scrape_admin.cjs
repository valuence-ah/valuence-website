const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:5000/admin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'local_admin_panel.png', fullPage: true });
  console.log('Saved local_admin_panel.png');

  await browser.close();
})();
