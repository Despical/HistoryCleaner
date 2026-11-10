// assets/history-cleaner-icon.svg dosyasından PNG ikonları üretir.
// Generates the PNG icons from assets/history-cleaner-icon.svg.   Usage: npm run icons
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const svg = readFileSync(new URL('../assets/history-cleaner-icon.svg', import.meta.url));

for (const size of [16, 32, 48, 128]) {
    await sharp(svg, { density: 600 }).resize(size, size).png()
        .toFile(fileURLToPath(new URL(`../src/icons/icon-${size}.png`, import.meta.url)));
}
await sharp(svg, { density: 600 }).resize(512, 512).png()
    .toFile(fileURLToPath(new URL('../assets/history-cleaner-icon.png', import.meta.url)));
console.log('✓ icons generated');
