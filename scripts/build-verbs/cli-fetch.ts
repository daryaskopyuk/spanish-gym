// `npm run fetch:verbs` — RARE, needs network.
// Streams the kaikki.org Spanish verb dump (~750 MB, never written to disk), keeps only the
// entries needed for verb-list.json, and writes the small committed snapshot.
// Review the snapshot diff afterwards: Wiktionary is editable by anyone.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { neededWords, slimEntry, type KaikkiEntry, type VerbListItem } from './lib.ts';

const SOURCE_URL =
  'https://kaikki.org/dictionary/Spanish/pos-verb/kaikki.org-dictionary-Spanish-by-pos-verb.jsonl';

const here = dirname(fileURLToPath(import.meta.url));
const list = JSON.parse(readFileSync(join(here, 'verb-list.json'), 'utf8')) as VerbListItem[];
const wanted = neededWords(list);
// A reflexive verb's own entry (e.g. "llamarse") is used to cross-check the derived forms.
for (const item of list) if (item.base) wanted.add(item.infinitive);

async function main() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok || !response.body) throw new Error(`Download failed: HTTP ${response.status}`);
  const lastModified = response.headers.get('last-modified');

  const kept: KaikkiEntry[] = [];
  let lines = 0;
  let buffer = '';
  const decoder = new TextDecoder();
  const handle = (line: string) => {
    if (!line.trim()) return;
    lines++;
    const entry = JSON.parse(line) as KaikkiEntry & { lang_code?: string };
    if (entry.lang_code && entry.lang_code !== 'es') return;
    if (entry.pos && entry.pos !== 'verb') return;
    if (wanted.has(entry.word)) kept.push(slimEntry(entry));
  };
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      handle(buffer.slice(0, nl));
      buffer = buffer.slice(nl + 1);
    }
    if (lines > 0 && lines % 2000 === 0) process.stdout.write(`\r${lines} entries read…`);
  }
  handle(buffer + decoder.decode());

  // Stable order for readable diffs: by word, then etymology number.
  kept.sort(
    (a, b) =>
      a.word.localeCompare(b.word, 'es') || (a.etymology_number ?? 0) - (b.etymology_number ?? 0),
  );
  const out = join(here, 'snapshot', 'kaikki-verbs.jsonl');
  writeFileSync(out, kept.map((e) => JSON.stringify(e)).join('\n') + '\n');
  const missing = [...wanted].filter((w) => !kept.some((e) => e.word === w));
  writeFileSync(
    join(here, 'snapshot', 'meta.json'),
    JSON.stringify(
      {
        source: SOURCE_URL,
        sourceLastModified: lastModified,
        fetchedAt: new Date().toISOString().slice(0, 10),
        entriesRead: lines,
        entriesKept: kept.length,
        wordsNotFound: missing,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`\nRead ${lines} entries, kept ${kept.length} → ${out}`);
  if (missing.length) console.log(`Not found in the dump: ${missing.join(', ')}`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
