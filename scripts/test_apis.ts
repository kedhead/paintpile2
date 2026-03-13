import * as cheerio from 'cheerio';

async function testVallejoHtml() {
  console.log('Fetching Vallejo Sets page...');
  const url = 'https://acrylicosvallejo.com/en/category/hobby/sets/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  
  console.log(`Raw HTML Preview:`, html.substring(0, 500));
  
  const $ = cheerio.load(html);

  console.log(`Found ${links.size} product links on page 1.`);
  
  if (links.size > 0) {
    const firstProduct = Array.from(links)[0];
    console.log(`\nFetching product: ${firstProduct}`);
    const prodRes = await fetch(firstProduct, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const prodHtml = await prodRes.text();
    const $$ = cheerio.load(prodHtml);
    
    const title = $$('h1.product_title, h1').first().text().trim();
    const desc = $$('.woocommerce-product-details__short-description, #tab-description').text().trim();
    const img = $$('.woocommerce-product-gallery__image img').first().attr('src');
    
    console.log(`Title: ${title}`);
    console.log(`Image: ${img}`);
    console.log(`Description preview: ${desc.substring(0, 100)}`);
  }
}

testVallejoHtml();
