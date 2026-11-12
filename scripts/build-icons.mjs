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

// Chrome tints the tab icon of chrome:// override pages using only its alpha channel,
// so the tab icon is a transparent single-colour glyph instead of the full icon.
const favicon = readFileSync(new URL('../assets/history-cleaner-favicon.svg', import.meta.url));

for (const size of [16, 32]) {
    await sharp(favicon, { density: 600 }).resize(size, size).png()
        .toFile(fileURLToPath(new URL(`../src/icons/favicon-${size}.png`, import.meta.url)));
}
console.log('✓ icons generated');
