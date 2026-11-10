// Eklentiyi paketlemeden önce kontrol eder: manifest, dosyalar, diller.
// Checks the extension before packaging: manifest, referenced files, locales.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src/', import.meta.url));
const errors = [];
const read = (p) => JSON.parse(readFileSync(join(src, p), 'utf8'));

const manifest = read('manifest.json');
if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3');

const files = [
    manifest.chrome_url_overrides?.history,
    ...Object.values(manifest.icons ?? {}),
    'history.js', 'history.css', 'i18n.js',
].filter(Boolean);
for (const f of files) if (!existsSync(join(src, f))) errors.push(`missing file: ${f}`);

for (const js of ['history.js', 'i18n.js']) {
    try { execFileSync(process.execPath, ['--check', join(src, js)]); } catch { errors.push(`syntax error: ${js}`); }
}

// _locales: description limit / açıklama sınırı
for (const lang of ['en']) {
    const d = read(`_locales/${lang}/messages.json`).extDescription?.message ?? '';
    if (d.length > 132) errors.push(`_locales/${lang}: description is ${d.length} chars (max 132)`);
}

// i18n.js: tüm diller aynı anahtarlara sahip olmalı / all UI languages share keys
const i18n = readFileSync(join(src, 'i18n.js'), 'utf8');
const block = (lang) => {
    const m = i18n.match(new RegExp(`\\n    ${lang}: \\{([\\s\\S]*?)\\n    \\},`));
    return m ? [...m[1].matchAll(/^ {8}(\w+):/gm)].map((x) => x[1]) : [];
};
const enKeys = block('en');
if (!enKeys.length) errors.push('i18n.js: could not read the English strings');
for (const lang of ['tr']) {
    const keys = block(lang);
    for (const k of enKeys) if (!keys.includes(k)) errors.push(`i18n.js: ${lang} is missing "${k}"`);
}

if (errors.length) {
    console.error(errors.map((e) => `✗ ${e}`).join('\n'));
    process.exit(1);
}
console.log(`✓ History Cleaner ${manifest.version} is valid`);
