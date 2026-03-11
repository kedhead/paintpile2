import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'public', 'splatters');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const prompts = [
  {
    name: 'splatter-corner-tl',
    prompt: 'A high-resolution artistic spray paint splatter in the top-left corner on a pure black background. Vibrant hot pink and electric blue wet paint with realistic fuzzy overspray edges and vertical paint drips. Clean modern flat graphic design style, 8k resolution. Only paint in the corner, rest is black negative space. No text, no objects.',
  },
  {
    name: 'splatter-corner-tr',
    prompt: 'A high-resolution artistic spray paint splatter in the top-right corner on a pure black background. Electric blue and crisp white wet paint with realistic fuzzy overspray edges and vertical paint drips. Clean modern flat graphic design style, 8k resolution. Only paint in the corner, rest is black negative space. No text, no objects.',
  },
  {
    name: 'splatter-corner-bl',
    prompt: 'A high-resolution artistic spray paint splatter in the bottom-left corner on a pure black background. Vibrant pink and white wet paint with realistic fuzzy overspray edges and vertical paint drips. Clean modern flat graphic design style, 8k resolution. Only paint in the corner, rest is black negative space. No text, no objects.',
  },
  {
    name: 'splatter-corner-br',
    prompt: 'A high-resolution artistic spray paint splatter in the bottom-right corner on a pure black background. Electric blue and vibrant pink wet paint with realistic fuzzy overspray edges and vertical paint drips. Clean modern flat graphic design style, 8k resolution. Only paint in the corner, rest is black negative space. No text, no objects.',
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generate() {
  for (let i = 0; i < prompts.length; i++) {
    const { name, prompt } = prompts[i];
    if (i > 0) {
      console.log('  Waiting 15s for rate limit...');
      await sleep(15000);
    }
    console.log(`Generating: ${name}...`);
    try {
      const output = await replicate.run('black-forest-labs/flux-1.1-pro', {
        input: {
          prompt,
          width: 1440,
          height: 816,
          aspect_ratio: '16:9',
          output_format: 'webp',
          output_quality: 90,
        },
      });

      // Handle various output formats
      let url;
      if (typeof output === 'string') {
        url = output;
      } else if (Array.isArray(output)) {
        url = typeof output[0] === 'string' ? output[0] : output[0]?.url?.();
      } else if (output?.url) {
        url = typeof output.url === 'function' ? output.url() : output.url;
      }

      if (!url) {
        // If it's a FileOutput or ReadableStream, try to get the URL
        const str = output?.toString?.();
        if (str && str.startsWith('http')) {
          url = str;
        } else {
          console.log(`  Output type: ${typeof output}`, output);
          console.error(`  Could not extract URL for ${name}`);
          continue;
        }
      }

      console.log(`  Downloading from: ${url}`);
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const outPath = path.join(outputDir, `${name}.webp`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  Error generating ${name}:`, err.message);
    }
  }
  console.log('\nDone! Generated splatters in:', outputDir);
}

generate();
