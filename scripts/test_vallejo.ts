import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function checkVallejoDom() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  await page.goto('https://acrylicosvallejo.com/en/categoria/hobby/sets/true-metallic-metal-sets-en/', { waitUntil: 'networkidle2' });
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('vallejo_product_dom.html', html);
  
  console.log('Saved Vallejo product DOM to vallejo_product_dom.html');
  await browser.close();
}

checkVallejoDom();
