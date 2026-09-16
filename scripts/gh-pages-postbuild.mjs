// GitHub Pages has no rewrite rules, so a deep link like /VendSmart/machines
// 404s on the static server. Pages serves 404.html for any unmatched path, so
// shipping a copy of the app shell there hands the URL to React Router intact.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const indexHtml = resolve(dist, 'index.html');

if (!existsSync(indexHtml)) {
  console.error('gh-pages-postbuild: dist/index.html not found — run the build first.');
  process.exit(1);
}

copyFileSync(indexHtml, resolve(dist, '404.html'));
console.log('gh-pages-postbuild: wrote dist/404.html');
