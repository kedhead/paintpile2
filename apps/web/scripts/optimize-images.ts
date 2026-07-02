/**
 * One-off asset optimizer for public/ images.
 * Run from apps/web: pnpm exec tsx scripts/optimize-images.ts
 *
 * - logosmall.png (2.6MB) → logo-64.png + logo-256.png (new names so the
 *   service worker can't serve stale multi-MB cached copies), and a
 *   recompressed logosmall.png kept for any external references.
 * - logofull.png (3.3MB) → recompressed in place.
 * - background.png (10MB) → recompressed IN PLACE; it is read from disk by
 *   app/api/video/commercial/route.ts, so it must keep its name and exist.
 */
import sharp from 'sharp';
import { statSync, renameSync } from 'fs';
import path from 'path';

const PUBLIC = path.join(__dirname, '..', 'public');

const kb = (p: string) => `${(statSync(p).size / 1024).toFixed(1)}KB`;

async function main() {
  const logosmall = path.join(PUBLIC, 'logosmall.png');
  const logofull = path.join(PUBLIC, 'logofull.png');
  const background = path.join(PUBLIC, 'background.png');

  await sharp(logosmall)
    .resize({ height: 64, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(PUBLIC, 'logo-64.png'));

  await sharp(logosmall)
    .resize({ height: 256, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(PUBLIC, 'logo-256.png'));

  const tmpSmall = path.join(PUBLIC, 'logosmall.tmp.png');
  await sharp(logosmall)
    .resize({ height: 512, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(tmpSmall);
  renameSync(tmpSmall, logosmall);

  const tmpFull = path.join(PUBLIC, 'logofull.tmp.png');
  await sharp(logofull)
    .resize({ width: 1024, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(tmpFull);
  renameSync(tmpFull, logofull);

  const tmpBg = path.join(PUBLIC, 'background.tmp.png');
  await sharp(background)
    .resize({ width: 1920, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(tmpBg);
  renameSync(tmpBg, background);

  for (const f of ['logo-64.png', 'logo-256.png', 'logosmall.png', 'logofull.png', 'background.png']) {
    console.log(f.padEnd(16), kb(path.join(PUBLIC, f)));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
