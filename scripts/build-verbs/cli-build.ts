// `npm run build:verbs` — offline and deterministic. Runs in CI.
// snapshot/ + verb-list.json + translations.en.json + spot-check.json → src/data/verbs.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildVerbData, type SpotCheck } from './build.ts';
import type { KaikkiEntry, SupportedTenseId, VerbListItem } from './lib.ts';

/** Tenses switched on in the app (docs/PLAN.md: present, preterite, future from M2). */
export const ENABLED_TENSES: readonly SupportedTenseId[] = [
  'present_indicative',
  'preterite_indicative',
  'future_indicative',
];

const here = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(join(here, file), 'utf8');

const meta = JSON.parse(read('snapshot/meta.json')) as { fetchedAt: string };
const result = buildVerbData({
  entries: read('snapshot/kaikki-verbs.jsonl')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as KaikkiEntry),
  list: JSON.parse(read('verb-list.json')) as VerbListItem[],
  translations: JSON.parse(read('translations.en.json')) as Record<string, string>,
  spotChecks: JSON.parse(read('spot-check.json')) as SpotCheck[],
  enabledTenses: ENABLED_TENSES,
  source: `Wiktionary (CC BY-SA 4.0) via kaikki.org / Wiktextract, snapshot ${meta.fetchedAt}`,
});

for (const w of result.warnings) console.warn(`warning: ${w}`);
if (result.errors.length) {
  for (const e of result.errors) console.error(`error: ${e}`);
  console.error(`\n${result.errors.length} error(s); src/data/verbs.json was NOT written.`);
  process.exit(1);
}

const out = join(here, '..', '..', 'src', 'data', 'verbs.json');
writeFileSync(out, JSON.stringify(result.data, null, 2) + '\n');
console.log(
  `Wrote ${result.data.verbs.length} verbs × ${ENABLED_TENSES.length} tenses → src/data/verbs.json` +
    (result.warnings.length ? ` (${result.warnings.length} warning(s))` : ''),
);
