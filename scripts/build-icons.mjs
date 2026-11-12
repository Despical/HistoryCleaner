// assets/history-cleaner-icon.svg dosyasından PNG ikonları üretir.
// Generates the PNG icons from the SVGs in assets/.   Usage: npm run icons
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const svg = readFileSync(new URL('../assets/history-cleaner-icon.svg', import.meta.url));

// Chrome uses the 16 px extension icon (32 px on HiDPI) as the tab icon of the overridden
// chrome://history page and tints it through its alpha channel alone, so the full icon
// would show up as a solid square. The small sizes are a transparent glyph instead.
const glyph = readFileSync(new URL('../assets/history-cleaner-favicon.svg', import.meta.url));

for (const [size, source] of [[16, glyph], [32, glyph], [48, svg], [128, svg]]) {
    await sharp(source, { density: 600 }).resize(size, size).png()
        .toFile(fileURLToPath(new URL(`../src/icons/icon-${size}.png`, import.meta.url)));
}
await sharp(svg, { density: 600 }).resize(512, 512).png()
    .toFile(fileURLToPath(new URL('../assets/history-cleaner-icon.png', import.meta.url)));
console.log('✓ icons generated');
