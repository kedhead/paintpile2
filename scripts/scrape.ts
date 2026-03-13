import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Page } from 'puppeteer';
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import path from 'path';

puppeteer.use(StealthPlugin());

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const adminEmail = process.env.PB_ADMIN_EMAIL || 'admin@paintpile.app';
const adminPassword = process.env.PB_ADMIN_PASSWORD || 'paintpile2admin';

const pb = new PocketBase(pbUrl);

interface ScrapedPaint {
  name: string;
}

interface ScrapedSet {
  name: string;
  brand: string;
  url: string;
  imageUrl?: string;
  description?: string;
  paints: ScrapedPaint[];
}

/**
 * Extracts a list of paint names from an HTML description string.
 * This is naive but works for standard bulleted lists.
 */
function extractPaintsFromHtml(html: string): ScrapedPaint[] {
  // Try to find <li> tags
  const liMatches = [...html.matchAll(/<li>(.*?)<\/li>/gis)];
  let names: string[] = [];

  if (liMatches.length > 0) {
    names = liMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
  } else {
    // Fallback: split by BR or newlines
    const textLines = html.split(/<br\s*\/?>|\n/i).map(line => line.replace(/<[^>]+>/g, '').trim());
    names = textLines.filter(line => line.length > 3 && line.length < 50 && !line.toLowerCase().includes('set includes') && !line.toLowerCase().includes('bottle'));
  }

  // Clean the names (remove bullets, sizes, etc)
  const cleanPaints = names
    .map(n => n.replace(/^[-•*]\s*/, '').replace(/-\s*\d+ml.*/i, '').trim())
    .filter(n => n.length > 2 && n.length < 40)
    .map(name => ({ name }));

  return cleanPaints;
}

async function scrapeShopifyBrand(opts: {
  brandName: string;
  baseUrl: string;
  collectionHandle: string;
}): Promise<ScrapedSet[]> {
  console.log(`--- Scraping ${opts.brandName} (Shopify API) ---`);
  
  // Shopify Native Product API
  const apiUrl = `${opts.baseUrl}/collections/${opts.collectionHandle}/products.json?limit=250`;
  console.log(`Fetching: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Shopify API: ${response.statusText}`);
  }

  const data = await response.json();
  const products = data.products || [];
  console.log(`Found ${products.length} products in collection.`);

  const sets: ScrapedSet[] = [];

  for (const product of products) {
    const title = product.title;
    if (!title || !title.toLowerCase().includes('set') && !title.toLowerCase().includes('bundle')) {
      console.log(`Skipping non-set: ${title}`);
      continue;
    }

    const htmlDesc = product.body_html || '';
    const cleanPaints = extractPaintsFromHtml(htmlDesc);

    const imageUrl = product.images?.[0]?.src || '';

    sets.push({
      name: title,
      brand: opts.brandName,
      url: `${opts.baseUrl}/products/${product.handle}`,
      description: htmlDesc.replace(/<[^>]+>/g, ' ').substring(0, 200).trim(), // Plain text preview
      imageUrl,
      paints: cleanPaints
    });

    console.log(`✓ Scraped: ${title} (${cleanPaints.length} paints)`);
  }

  return sets;
}

async function scrapeAkInteractive(): Promise<ScrapedSet[]> {
  console.log(`--- Scraping AK Interactive (WordPress API) ---`);
  const sets: ScrapedSet[] = [];
  const baseUrl = 'https://ak-interactive.com';
  
  // Try up to 5 pages
  for (let page = 1; page <= 5; page++) {
    const apiUrl = `${baseUrl}/wp-json/wp/v2/product?per_page=100&page=${page}`;
    console.log(`Fetching: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) {
        if (response.status === 400) break; // End of pagination
        throw new Error(`Failed to fetch WP API: ${response.statusText}`);
      }
      
      const products = await response.json();
      if (!products || products.length === 0) break;
      
      for (const product of products) {
        let title = product.title?.rendered || '';
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").trim();
        
        if (!title.toLowerCase().includes('set')) {
          continue;
        }

        const htmlDesc = product.content?.rendered || product.excerpt?.rendered || '';
        const cleanPaints = extractPaintsFromHtml(htmlDesc);
        
        let imageUrl = '';
        if (product.yoast_head_json?.og_image?.[0]?.url) {
           imageUrl = product.yoast_head_json.og_image[0].url;
        }

        sets.push({
          name: title,
          brand: 'AK Interactive',
          url: product.link,
          description: htmlDesc.replace(/<[^>]+>/g, ' ').substring(0, 200).trim(), 
          imageUrl,
          paints: cleanPaints
        });

        console.log(`✓ Scraped: ${title} (${cleanPaints.length} paints)`);
      }
    } catch (err) {
      console.log(`Ended reading AK Interactive at page ${page}`);
      break;
    }
  }
  return sets;
}

async function scrapeVallejo(page: Page): Promise<ScrapedSet[]> {
  console.log('--- Scraping Vallejo (Puppeteer) ---');
  const baseUrl = 'https://acrylicosvallejo.com/en/categoria/hobby/sets/';
  const sets: ScrapedSet[] = [];
  
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  
  // 1. Find sub-categories
  const subCategoryLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('li.product-category a'));
    return Array.from(new Set(anchors.map(a => a.getAttribute('href')!)))
      .filter(href => href && href.startsWith('http'));
  });

  console.log(`Found ${subCategoryLinks.length} Vallejo sub-categories.`);
  
  // 2. Find product links inside sub-categories
  let productLinks: string[] = [];
  for (const catUrl of subCategoryLinks) {
    await page.goto(catUrl, { waitUntil: 'domcontentloaded' });
    const linksOnPage = await page.evaluate(() => {
        // Find links that are actual products, not sub-categories
        const anchors = Array.from(document.querySelectorAll('.product:not(.product-category) > a, .woocommerce-LoopProduct-link'));
        return Array.from(new Set(anchors.map(a => a.getAttribute('href')!)))
          .filter(href => href && (href.includes('/product/') || href.includes('/producto/')));
    });
    productLinks.push(...linksOnPage);
  }

  // De-duplicate product links
  productLinks = Array.from(new Set(productLinks));
  console.log(`Found ${productLinks.length} unique Vallejo products to scan.`);
  
  // 3. Scrape the products
  for (const url of productLinks) {
    try {
      if (!url.startsWith('http')) continue;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const title = await page.evaluate(() => {
        const h1 = document.querySelector('h1.product_title');
        return h1 ? h1.textContent?.trim() || '' : '';
      });

      if (!title || (!title.toLowerCase().includes('set') && !title.toLowerCase().includes('pack') && !title.toLowerCase().includes('colors'))) {
        continue;
      }

      const description = await page.evaluate(() => {
        const descDiv = document.querySelector('.woocommerce-product-details__short-description, #tab-description');
        return descDiv ? descDiv.innerHTML : '';
      });

      const cleanPaints = extractPaintsFromHtml(description);

      const imageUrl = await page.evaluate(() => {
        const img = document.querySelector('.woocommerce-product-gallery__image img');
        return img ? img.getAttribute('src') || '' : '';
      });

      sets.push({
        name: title,
        brand: 'Vallejo',
        url,
        description: description.replace(/<[^>]+>/g, ' ').substring(0, 200).trim(),
        imageUrl,
        paints: cleanPaints
      });

      console.log(`✓ Scraped: ${title} (${cleanPaints.length} paints)`);
    } catch (err) {
      console.error(`Error scraping ${url}:`, err);
    }
  }

  return sets;
}

async function run() {
  console.log('Authenticating with PocketBase...');
  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('Authenticated successfully.');
  } catch (err) {
    console.error('Failed to auth with PocketBase, skipping DB upsert testing.', err);
  }

  // Define browser up here for Vallejo
  console.log('Launching stealth browser...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    // 1. Monument Hobbies
    const monumentSets = await scrapeShopifyBrand({
      brandName: 'Monument Hobbies',
      baseUrl: 'https://monumenthobbies.com',
      collectionHandle: 'pro-acryl-paints-paint-sets'
    });
    console.log(`\nFinished Monument Hobbies. Found ${monumentSets.length} sets.`);

    // 2. The Army Painter
    const apSets = await scrapeShopifyBrand({
       brandName: 'The Army Painter',
       baseUrl: 'https://thearmypainter.com',
       collectionHandle: 'all'
    });
    console.log(`\nFinished The Army Painter. Found ${apSets.length} sets.`);

    // 3. Vallejo (Puppeteer)
    const vallejoSets = await scrapeVallejo(page);
    console.log(`\nFinished Vallejo. Found ${vallejoSets.length} sets.`);

    // 4. AK Interactive (API)
    const akSets = await scrapeAkInteractive();
    console.log(`\nFinished AK Interactive. Found ${akSets.length} sets.`);

    const totalSets = monumentSets.length + apSets.length + vallejoSets.length + akSets.length;
    console.log(`\n=== TOTAL SCRAPING COMPLETE: Found ${totalSets} paint sets across all brands ===`);

    const allSets = [...monumentSets, ...apSets, ...vallejoSets, ...akSets];

    console.log('\n--- Syncing to PocketBase ---');
    if (!pb.authStore.isValid) {
      console.warn('Skipping PocketBase sync because admin authentication failed.');
      return;
    }

    let setsCreated = 0;
    let setsUpdated = 0;
    let paintsCreated = 0;

    for (const set of allSets) {
      const paintNames = set.paints.map(p => p.name);

      // 1. Upsert Paint Set
      try {
        const existingSets = await pb.collection('paint_sets').getFullList({
          filter: `set_name="${set.name.replace(/"/g, '\\"')}" && brand="${set.brand.replace(/"/g, '\\"')}"`,
          requestKey: null,
        });

        const setData = {
          set_name: set.name,
          brand: set.brand,
          paint_names: JSON.stringify(paintNames),
          paint_count: paintNames.length,
          description: set.description || '',
          source_url: set.url,
          image_url: set.imageUrl || '',
          is_curated: false,
        };

        if (existingSets.length > 0) {
          await pb.collection('paint_sets').update(existingSets[0].id, setData, { requestKey: null });
          setsUpdated++;
        } else {
          await pb.collection('paint_sets').create(setData, { requestKey: null });
          setsCreated++;
        }
      } catch (err: any) {
        console.error(`Failed to upsert paint set ${set.name}:`, err.message || err);
      }

      // 2. Upsert Individual Paints
      for (const paint of set.paints) {
        try {
          const existingPaints = await pb.collection('paints').getFullList({
            filter: `name="${paint.name.replace(/"/g, '\\"')}" && brand="${set.brand.replace(/"/g, '\\"')}"`,
            requestKey: null,
          });

          if (existingPaints.length === 0) {
            await pb.collection('paints').create({
              name: paint.name,
              brand: set.brand,
              hex_color: '#808080', // Default placeholder
              type: 'standard', // Default placeholder
            }, { requestKey: null });
            paintsCreated++;
          }
        } catch (err: any) {
             console.error(`Failed to upsert paint ${paint.name}:`, err.message || err);
        }
      }
    }

    console.log(`\nPocketBase Sync Complete:
- Sets Created: ${setsCreated}
- Sets Updated: ${setsUpdated}
- New Individual Paints Created: ${paintsCreated}
    `);
  } catch (err) {
    console.error('Fatal error during scraping:', err);
  } finally {
    await browser.close();
  }
}

run();
