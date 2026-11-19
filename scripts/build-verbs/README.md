# build-verbs

Generates `src/data/verbs.json` (the app's conjugation data) from Wiktionary. Design and research:
`docs/data-source.md`.

## Two steps

| Command | When | Network | What it does |
|---|---|---|---|
| `npm run build:verbs` | after changing any file here | no | snapshot + curated files → `src/data/verbs.json`. Deterministic; CI checks the committed file is up to date. |
| `npm run fetch:verbs` | rarely (to pick up Wiktionary fixes or new verbs in the list) | yes | Streams the kaikki.org dump (~750 MB, never saved) and rewrites `snapshot/`. **Review the snapshot diff**, since Wiktionary is editable by anyone. Then run `build:verbs`. |

## Files

| File | Edited by | Purpose |
|---|---|---|
| `verb-list.json` | human | Ordered verb list (order = `frequencyRank`). Reflexive verbs name their `base` verb. `dropForms` removes wrong forms where Wiktionary merges two verbs (e.g. *acostar*). |
| `translations.en.json` | human | Short English glosses, one per listed verb. |
| `spot-check.json` | human | Known-correct forms. The build fails on any mismatch. Checked against all supported tenses, not only the ones switched on. |
| `snapshot/` | `fetch:verbs` | Filtered Wiktionary entries (~2 MB) and `meta.json` (source URL, dates). Large: don't open it whole. |
| `lib.ts`, `build.ts` | code | Pure logic (unit-tested in `tests/buildVerbs.test.ts`). |
| `cli-build.ts`, `cli-fetch.ts` | code | File and network I/O. `ENABLED_TENSES` in `cli-build.ts` sets which tenses the app gets. |

## Rules applied (from the research)

- vos forms, archaic/obsolete/rare forms and verb + pronoun combinations (*hablándole*) are dropped.
- Reflexive forms inside non-reflexive tables (*me hablo*) are dropped.
- Reflexive verbs are **derived** from the base verb (pronoun + form). If Wiktionary has its own entry
  for the reflexive verb, it is compared and differences are printed as warnings. Known case:
  Wiktionary's *despertarse* table is missing the stem change (*me desperto*); the derived
  *me despierto* is correct.
- *haber*: 3rd person present is *ha* (not the impersonal *hay*).
- Imperfect subjunctive: *-ra* and *-se* in one cell, *-ra* first.
- Words with several entries: the most complete table wins; a warning is printed only if an equally
  complete entry conjugates differently.
- Compound tenses (*he hablado*) are built from *haber* + participle.

## Licenses

Wiktionary data is CC BY-SA 4.0, so `verbs.json` is too: see `src/data/LICENSE-DATA.md`. The About
screen shows the attribution.
