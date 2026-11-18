# Conjugation data source: research results

Research done 2026-11-18, before M2. Answers the open question "data source license confirmed" from `docs/PLAN.md` §13 and recommends how the M2 build script should work. Not legal advice.

## Recommendation (short)

- **Conjugations + definitions:** Wiktionary, via the kaikki.org (Wiktextract) machine-readable extract. License allows commercial use (CC BY-SA 4.0), accuracy was 42/42 in a spot check, all top 300 verbs have complete tables.
- **Verb frequency:** FrequencyWords Spanish list (OpenSubtitles 2018), CC BY-SA 4.0. Used only to *propose* an order; the final verb list is curated by hand.
- **Not shipped:** Fred Jehle's database. Confirmed **non-commercial** license (CC BY-NC-SA 3.0).
- **Curated files** (committed, human-reviewed): the ordered verb list and short English translations. Automation drafts them, a human approves them.
- **Two-stage build:** a rare "fetch" step downloads and filters the big dump into a small committed snapshot; the normal "build" step turns that snapshot into `verbs.json` offline and deterministically.

## Sources compared

| Source | License | Commercial use | Coverage | Verdict |
|---|---|---|---|---|
| Wiktionary via kaikki.org | CC BY-SA 4.0 (Wiktionary content) | Yes, with attribution + share-alike | ~8,900 Spanish verbs with full conjugation tables | **Use** |
| Fred Jehle database (github.com/ghidinelli/fred-jehle-spanish-verbs) | CC BY-NC-SA 3.0 | **No** | 600+ verbs, all tenses | Don't ship. Optional local cross-check only, never committed |
| FrequencyWords es_50k (github.com/hermitdave/FrequencyWords) | CC BY-SA 4.0 (content) | Yes, with attribution + share-alike | 50k most frequent word forms from film subtitles | **Use** for candidate ranking |
| LLM / web API lookups at runtime | n/a | n/a | n/a | Rejected earlier (see decisions.md) |

## What the kaikki data contains

Download: `https://kaikki.org/dictionary/Spanish/pos-verb/kaikki.org-dictionary-Spanish-by-pos-verb.jsonl`
Size: **749 MB** (JSON Lines, one entry per line; snapshot checked was dated 2026-10-31). Streaming + filtering takes about a minute and leaves ~8,990 entries / 68 MB. Updated regularly upstream.

Each verb entry has `word`, `senses[].glosses` (English definitions), `senses[].tags` (e.g. `vulgar`, `obsolete`) and `forms[]`, each form with `form` and `tags`. Conjugation-table forms have `source: "conjugation"`.

Tag → our tense id mapping (verified):

| Our tense id | kaikki tags |
|---|---|
| `present_indicative` | indicative + present |
| `preterite_indicative` | indicative + preterite |
| `imperfect_indicative` | indicative + imperfect |
| `future_indicative` | indicative + future |
| `conditional` | conditional |
| `present_subjunctive` | subjunctive + present |
| `imperfect_subjunctive` | subjunctive + imperfect (`-ra`); with `imperfect-se` (`-se`) |
| imperative (later) | imperative, imperative + negative, formal/informal |

Person: `first/second/third-person` + `singular/plural` → `yo, tu, el, nosotros, vosotros, ellos`.

### Things the build script must handle

| Finding | Handling |
|---|---|
| **vos forms** are mixed in (e.g. *hablás*), tagged `vos-form` | Exclude. (Could power a future "voseo" option.) |
| **Reflexive forms** (*me hablo*, *nos vamos*) appear inside some non-reflexive verbs' tables | Exclude from the base verb. |
| **Reflexive verbs are inconsistent:** *llamarse* has its own entry; *levantarse*, *sentarse* don't | Derive reflexive verbs from the base verb: prefix *me/te/se/nos/os/se* for all non-imperative tenses. Use the own `-se` entry when it exists and check both agree. Reflexive imperative (*levántate*) is harder: postpone with the imperative. |
| **Compound tenses are not in the data** (only the participle) | Build them: *haber* in the right tense + participle (*he hablado*). Participles verified correct for irregulars (*hecho, dicho, visto, escrito, abierto, vuelto, roto, puesto, muerto*). |
| *haber* 3rd person present has **ha / hay** | Use *ha* only (*hay* is the impersonal "there is"). Needed for compound tenses too. |
| Genuine **alternatives** (*adecuo / adecúo*) | Keep as `string[]`; the checker accepts any. |
| Archaic alternatives (*placer → plugo*) | Drop: exclude archaic forms; in practice, verbs like *placer* shouldn't be in the list at all. |
| **-ra / -se** imperfect subjunctive | Store both as alternatives in one `imperfect_subjunctive` cell, `-ra` first. |
| ~50 words have **several entries** (different etymologies) | Pick the entry with a complete conjugation table; flag ties for review. |
| Obscure, archaic, misspelling entries (*her, hechar, aser, seer*) | Filtered out by sense tags and gloss text; the curated list removes the rest. |

### Accuracy check

42 forms covering irregular stems, spelling changes, accent shifts, *-ra/-se*, *haber* and a reflexive verb were checked against known-correct forms. **42/42 matched.** Examples: *soy, fue, éramos, vais, fueron, iba, estuve, tengo, tendrá, hizo, haría, digo, dijeron, pude, querré, sé, sepa, dé, veía, durmió, envío, busqué, llegue, cojo, conozco, caigo, oye, leyeron, reímos, hablara, hablase, vivís, vengo, pondremos, saldrían, me llamo*.

Wiktionary is editable by anyone, so errors can appear in future dumps. Mitigation: commit a filtered snapshot and run the spot-check test on every build (§ Build design).

## Verb frequency

Ranking by "all conjugated forms" fails: verb forms collide with common non-verbs (*para* → *parar*, *nada* → *nadar*, *casa* → *casar*, *uno* → *unir*).

Ranking by **infinitive + gerund + participle** frequency works much better (top 25: *hacer, ser, decir, ver, estar, ir, hablar, tener, pasar, haber, morir, pensar, saber, salir, volver, venir, dar, dejar, encontrar, trabajar, llegar, esperar, tomar, buscar, llamar*). Remaining problems:

- **Subtitle bias:** *matar, morir* rank high; vulgar verbs appear (*joder*, and others further down).
- **Participles that are nouns** push verbs up: *abogado → abogar, helado → helar, pecado → pecar*; infinitive-nouns too: *placer*.
- Reflexive verbs aren't ranked (they need to be added by hand).

So the frequency ranking is only a **draft**. `docs/research/candidate-verbs.tsv` has the top 400 candidates with the first Wiktionary gloss and a `vulgar` flag, ready for review.

## Translations

First Wiktionary glosses are usually fine (*hablar*: "to talk; to speak…") but too long or wrong as a short label for some core verbs:

- *venir*: "Senses relating to literal movement."
- *encontrar*: "to meet" (should be "to find")
- *esperar*: "to hope" (should be "to wait; to hope")
- *tomar*: a very long sentence

So: a committed `translations.en.json` with short glosses for every verb in the list. Drafted automatically (Wiktionary gloss, LLM-shortened if helpful), **reviewed by a human**. The same file pattern later gives `translations.uk.json` for Ukrainian.

## Size

300 verbs × 8 simple tense tables: **385 KB** JSON, **56 KB** compressed. Adding compound tenses and reflexive verbs roughly doubles it. No size concern.

## Build design for M2

```
scripts/build-verbs/
  fetch.ts            # RARE: download kaikki dump (stream), keep only verbs in verb-list.json,
                      #        write snapshot/kaikki-verbs.jsonl (small, committed). Records source URL + date.
  build.ts            # NORMAL: snapshot + curated files -> src/data/verbs.json. Offline, deterministic. Runs in CI.
  verb-list.json      # curated, ordered: [{ "infinitive": "hacer" }, { "infinitive": "levantarse", "base": "levantar" }, …]
  translations.en.json# curated short glosses
  snapshot/           # committed filtered data (a few MB at most)
  spot-check.json     # known-correct forms; build fails on any mismatch
  README.md           # how to refresh the snapshot, licenses, attribution
```

- `npm run build:verbs` = `build.ts` only (fast, offline).
- `npm run fetch:verbs` = `fetch.ts` (needs network; rarely run; review the diff of `snapshot/` after).
- Raw 749 MB dump is never committed and never kept on disk longer than needed.
- Compound tenses and reflexive verbs are **derived in `build.ts`**, with unit tests.
- Validation fails the build on: missing person in an included tense, empty strings, spot-check mismatch, verb in list but not in snapshot, verb without translation.

Prototype Python scripts used for this research are in `docs/research/prototype/` (reference only; M2 reimplements in TypeScript).

## Attribution and share-alike

Required in the app's About screen and in the repo:

- "Verb conjugations and definitions from **Wiktionary** (wiktionary.org), licensed CC BY-SA 4.0, extracted with **Wiktextract / kaikki.org** by Tatu Ylonen." Link to the license.
- "Verb frequency data from **FrequencyWords** by Hermit Dave (derived from OpenSubtitles), CC BY-SA 4.0." Only needed if frequency data ends up in the shipped file (`frequencyRank`).

**Share-alike:** `verbs.json` is an adaptation of CC BY-SA data, so that **data file** must be offered under CC BY-SA 4.0 too. The app's own code is a separate work and can be licensed however you like (including closed source, paid). Practical steps: a `src/data/LICENSE-DATA.md` saying `verbs.json` is CC BY-SA 4.0 with the attributions above, and a mention in the About screen. Paid features and ads remain possible.

## Open points for the human

1. **Review the verb list** (`docs/research/candidate-verbs.tsv`): drop vulgar/odd entries, add missing essentials and reflexive verbs (*levantarse, llamarse, sentarse, sentirse, quedarse, irse, acostarse, despertarse, ducharse, vestirse…*). Target ~300.
2. **Approve translations** once drafted in M2.
3. Confirm **-ra / -se** both accepted as correct (recommended).
