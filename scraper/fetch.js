// STEP 2 of the scraper: download the raw wiki source ("wikitext") for the
// OoT sections we found in step 1. Parsing happens in step 3 (parse.js).
//
// Run from the project root:   node scraper/fetch.js
// Output: scraper/raw/<name>.wikitext  (git-ignored)

import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://zelda.fandom.com/api.php';
const HEADERS = { 'User-Agent': 'zelda-tracker-class-project/0.1 (student project, low volume)' };

// name → which page and section to download (section numbers from explore.txt)
const TARGETS = [
  { name: 'heart_pieces',     page: 'Piece of Heart',          section: '4' },
  { name: 'heart_containers', page: 'Heart Container',         section: '7' },
  { name: 'bottles',          page: 'Empty Bottle',            section: '3' },
  { name: 'items',            page: 'Items in Ocarina of Time' },          // whole page
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir('scraper/raw', { recursive: true });

for (const t of TARGETS) {
  const params = { action: 'parse', page: t.page, prop: 'wikitext', redirects: '1', format: 'json' };
  if (t.section) params.section = t.section;

  const res = await fetch(`${API}?${new URLSearchParams(params)}`, { headers: HEADERS });
  const data = await res.json();

  if (data.error) {
    console.log(`✗ ${t.name}: ${data.error.info}`);
  } else {
    const text = data.parse.wikitext['*'];
    await writeFile(`scraper/raw/${t.name}.wikitext`, text);
    console.log(`✓ ${t.name}: ${text.length.toLocaleString()} characters → scraper/raw/${t.name}.wikitext`);
  }
  await sleep(1000);
}
