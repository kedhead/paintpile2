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
    name: 'splatter-pink-1',
    prompt: 'Photorealistic hot pink and magenta spray paint splatter on a pure black background. Drips, fine mist particles, and organic paint splash shapes. High detail, 8K resolution, studio photography of actual paint. No text, no objects, just paint splatter.',
  },
  {
    name: 'splatter-blue-1',
    prompt: 'Photorealistic electric blue and cyan spray paint splatter on a pure black background. Drips, fine mist particles, and organic paint splash shapes. High detail, 8K resolution, studio photography of actual paint. No text, no objects, just paint splatter.',
  },
  {
    name: 'splatter-purple-1',
    prompt: 'Photorealistic purple and violet spray paint splatter on a pure black background. Drips, fine mist particles, and organic paint splash shapes. High detail, 8K resolution, studio photography of actual paint. No text, no objects, just paint splatter.',
  },
  {
    name: 'splatter-pink-2',
    prompt: 'Photorealistic neon pink spray paint explosion on a pure black background, paint droplets flying outward, realistic fluid dynamics, macro photography style, 8K ultra detailed. No text, no objects.',
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
          height: 1440,
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
