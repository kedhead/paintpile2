import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'public', 'splatters');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp') && f.includes('corner'));

async function makeTransparent(filename) {
  const inputPath = path.join(dir, filename);
  const outputPath = path.join(dir, filename.replace('.webp', '.png'));

  console.log(`Processing: ${filename}...`);

  const { data, info } = await sharp(inputPath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const output = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    // Calculate luminance — brighter pixels = more visible paint
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Use luminance as alpha, with a threshold to kill near-black noise
    let alpha = luminance < 15 ? 0 : Math.min(255, luminance * 1.8);

    output[i * 4] = r;
    output[i * 4 + 1] = g;
    output[i * 4 + 2] = b;
    output[i * 4 + 3] = Math.round(alpha);
  }

  await sharp(output, { raw: { width, height, channels: 4 } })
    .png({ quality: 90 })
    .toFile(outputPath);

  const stat = fs.statSync(outputPath);
  console.log(`  Saved: ${outputPath} (${(stat.size / 1024).toFixed(0)} KB)`);

  // Old webp can be manually deleted after
}

async function run() {
  for (const file of files) {
    await makeTransparent(file);
  }
  console.log('\nDone!');
}

run();
