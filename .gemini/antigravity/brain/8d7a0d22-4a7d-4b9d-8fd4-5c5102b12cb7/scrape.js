const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  await page.goto('https://www.valuence.vc', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'valuence_live_home.png', fullPage: true });
  console.log('Saved valuence_live_home.png');
  
  await page.goto('https://www.valuence.vc/focus', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'valuence_live_focus.png', fullPage: true });
  console.log('Saved valuence_live_focus.png');

  await page.goto('https://www.valuence.vc/team', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'valuence_live_team.png', fullPage: true });
  console.log('Saved valuence_live_team.png');

  await page.goto('https://www.valuence.vc/portfolio', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'valuence_live_portfolio.png', fullPage: true });
  console.log('Saved valuence_live_portfolio.png');

  await browser.close();
})();
