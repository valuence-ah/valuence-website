const { chromium } = require('playwright');

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  const takeShot = async (url, path) => {
    await page.goto(url, { waitUntil: 'load' });
    await autoScroll(page);
    // wait a bit for any animations
    await page.waitForTimeout(1000);
    // scroll back to top to ensure sticky headers settle if any
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path, fullPage: true });
    console.log(`Saved ${path}`);
  };

  await takeShot('https://www.valuence.vc', 'valuence_live_home.png');
  await takeShot('https://www.valuence.vc/focus', 'valuence_live_focus.png');
  await takeShot('https://www.valuence.vc/team', 'valuence_live_team.png');
  await takeShot('https://www.valuence.vc/portfolio', 'valuence_live_portfolio.png');

  await takeShot('http://localhost:5000', 'valuence_local_home.png');
  await takeShot('http://localhost:5000/focus', 'valuence_local_focus.png');
  await takeShot('http://localhost:5000/team', 'valuence_local_team.png');
  await takeShot('http://localhost:5000/portfolio', 'valuence_local_portfolio.png');

  await browser.close();
})();
