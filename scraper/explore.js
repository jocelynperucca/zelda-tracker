// STEP 1 of the scraper: find out WHERE the OoT collectible data lives on Zeldapedia.
//
// Run from the project root:   node scraper/explore.js
//
// It uses Zeldapedia's official MediaWiki API (allowed in their robots.txt for normal
// scripts) and waits 1 second between requests to be polite.
// Output: printed to the terminal AND saved to scraper/raw/explore.txt

import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://zelda.fandom.com/api.php';
const HEADERS = { 'User-Agent': 'zelda-tracker-class-project/0.1 (student project, low volume)' };

// Searches to find candidate pages
const SEARCHES = [
  'Piece of Heart Ocarina of Time',
  'Heart Container Ocarina of Time',
  'Ocarina of Time items',
  'Ocarina of Time equipment',
  'Ocarina of Time songs',
  'Bottle Ocarina of Time',
];

// Pages we expect to exist; we'll list their sections (headings)
const PAGES = ['Piece of Heart', 'Heart Container', 'Bottle', 'Ocarina of Time'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = [];
const log = (s = '') => { console.log(s); lines.push(s); };

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await sleep(1000);
  return res.json();
}

log('=== SEARCH RESULTS (top 8 page titles per search) ===');
for (const q of SEARCHES) {
  const data = await api({ action: 'query', list: 'search', srsearch: q, srlimit: '8' });
  log(`\n"${q}":`);
  for (const r of data.query.search) log(`  - ${r.title}`);
}

log('\n=== SECTIONS ON KEY PAGES ===');
for (const page of PAGES) {
  const data = await api({ action: 'parse', page, prop: 'sections', redirects: '1' });
  if (data.error) { log(`\n${page}: ERROR ${data.error.info}`); continue; }
  log(`\n${data.parse.title}:`);
  for (const s of data.parse.sections) log(`  ${'  '.repeat(s.toclevel - 1)}[${s.index}] ${s.line}`);
}

await mkdir('scraper/raw', { recursive: true });
await writeFile('scraper/raw/explore.txt', lines.join('\n'));
log('\nSaved to scraper/raw/explore.txt');
