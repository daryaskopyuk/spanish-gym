# Spanish Verb Trainer: Implementation Plan

A mobile app for practising Spanish verb conjugation. The first exercise shows a verb, a tense and a pronoun (e.g. *hablar · presente · nosotros*); the user types the conjugated form.

This file is the source of truth for implementation. Work through it **one milestone at a time**. Decisions and their reasons are logged in `docs/decisions.md`.

## Status

| Milestone | Status |
|---|---|
| M0 Setup + agent tooling | ⬜ not started |
| M1 Quiz with sample data | ⬜ |
| M2 Real data | ⬜ |
| M3 Settings + rounds | ⬜ |
| M4 Progress + scheduling | ⬜ |
| M5 More tenses | ⬜ |
| M6 Release prep (Google Play) | ⬜ |

Legend: ⬜ not started · 🔄 in progress · ✅ done. Update this table at the start and end of each milestone.

---

## 1. Decisions

| Topic | Decision |
|---|---|
| Platform | Expo (React Native) + TypeScript. One codebase for iOS and Android. |
| Developer setup | Mac + iPhone for daily development (Expo Go). An Android phone is available occasionally for testing. |
| First store | **Google Play.** iOS App Store later. |
| Version control | Git + GitHub from M0. One branch + pull request per milestone; CI must pass before merge. |
| AI-native workflow | Built mainly with Claude Code. Repo set up so agents can verify their own work: one `npm run check` command, architecture rules enforced by lint, UI checkable in a browser via Expo web + Playwright (§10a). |
| Interface language | English. All UI text goes through an i18n layer so other languages (e.g. Ukrainian) can be added later. |
| Conjugation data | Bundled JSON file inside the app, generated at development time by a script. No network lookups at runtime. |
| Offline | Fully offline. No server, no account. |
| Question shows | Infinitive, tense, pronoun. Translation shown **after** answering by default (setting). |
| Pronoun labels | "yo", "tú", "él / ella / usted", "nosotros / nosotras", "vosotros / vosotras", "ellos / ellas / ustedes". |
| After answering | "Next" button (no auto-advance). On a mistake: the correct form, plus a "Show all forms" button that reveals the full conjugation table for that verb + tense. |
| Accents | Answers without accents are accepted; feedback shows the accented form. On-screen row: á é í ó ú ü ñ. |
| Reflexive verbs | Answer must include the reflexive pronoun: *levantarse · yo* → **me levanto**. |
| Compound tenses | Included (e.g. *he hablado*). Multi-word answers are normal. |
| Imperative | Wanted, but **not in the first iteration**. Data format must allow tenses with missing persons. |
| Tenses | Start with *presente de indicativo*; then the order in M5. |
| Tense selection | Chosen at the **start of each session** (tense chips above "Start"), not buried in Settings. One tense = focused practice; several = mix. Last selection is remembered. |
| Pronouns | All six persons stored in the data, including *vosotros*. Setting to hide *vosotros*. |
| Accounts | None for now. Progress stored on the device, structured so accounts + cloud sync can be added later (this also solves progress loss on phone change). |
| Look & accessibility | Light + dark mode (follows system), respects system font size. From M1. |
| Monetization | None for now. Code goes through one "entitlements" module and one "ads" module, which are no-ops today. |
| Crash reporting / analytics | Possibly; not decided for first release. Code goes through one "telemetry" module that is a no-op today. |

---

## 2. Tech stack

- **Expo SDK** (latest stable) with **Expo Router** (file-based navigation)
- **TypeScript**, strict mode
- **Zustand** for app state
- **AsyncStorage** for settings and progress (switch to `expo-sqlite` only if progress data grows large)
- **i18next + react-i18next** for UI text, with **expo-localization** to read the device language (handles Ukrainian plural rules correctly when added)
- **Jest** + `@testing-library/react-native` for unit and component tests
- **ESLint + Prettier**, plus `eslint-plugin-react-native` (color literals) and an i18n rule against raw text in screens (e.g. `eslint-plugin-i18next`)
- **Expo web** (`react-native-web`, `react-dom`) so the app runs in a browser for automated UI checks
- **Playwright** (`@playwright/test`) for browser UI checks and screenshots
- **GitHub Actions** for CI

No backend.

---

## 3. Project structure

```
CLAUDE.md                 # agent briefing (short; loaded every session)
docs/
  PLAN.md                 # this file
  decisions.md            # decision log: what + why + date
.claude/
  settings.json           # shared agent permissions + hooks
.github/workflows/
  ci.yml                  # npm run check on every push / PR
e2e/                      # Playwright UI checks (screenshots are gitignored)
app/                      # screens (Expo Router)
  _layout.tsx
  index.tsx               # home: tense chips, mode, Start; due counts per tense; settings link
  practice.tsx            # the quiz screen
  settings.tsx
  about.tsx               # version, data source attribution
src/
  data/
    verbs.json            # generated: do not edit by hand
    types.ts              # Verb, Tense, Person types
    verbRepository.ts     # the ONLY code that reads verbs.json
  exercises/
    types.ts              # Exercise interface (shared by all exercise types)
    conjugationInput/     # exercise type #1
      generator.ts        # picks verb + tense + person
      checker.ts          # compares the answer
  scheduling/
    scheduler.ts          # builds rounds (see §7a)
  progress/
    progressStore.ts      # per-item stats, saved locally
  settings/
    settingsStore.ts
  i18n/
    index.ts              # i18next setup
    locales/en.json       # all UI strings
  theme/
    colors.ts             # light + dark tokens
  monetization/
    entitlements.ts       # isPro(), canUseTense(), etc. (always true for now)
    ads.ts                # maybeShowAd() (no-op for now)
  telemetry/
    telemetry.ts          # reportError(), trackEvent() (no-op for now)
  components/
    AccentKeyboardRow.tsx
    FeedbackBanner.tsx
    ConjugationTable.tsx  # used by "Show all forms"
scripts/
  build-verbs/            # turns the raw source data into src/data/verbs.json
tests/
```

**Rules:**
- Screens never read `verbs.json` directly. They go through `verbRepository`.
- Screens never check "is the user paying" inline. They go through `entitlements`.
- Screens never contain hard-coded user-visible text. All text comes from `i18n/locales/*.json`.
- Screens never use hard-coded colors. They use `theme`.
- Errors that should be reported go through `telemetry`, never directly to a vendor SDK.

---

## 4. Data

### 4.1 Source

Conjugation is a fixed, finite data set. 600 verbs × 15 tenses × 6 persons ≈ 54,000 short strings, about 1–2 MB of JSON. That's small enough to ship inside the app.

**Decided (research in `docs/data-source.md`):**

- **Conjugations + definitions:** Wiktionary via kaikki.org, CC BY-SA 4.0 (commercial use allowed with attribution + share-alike on the data file). Spot check 42/42 correct.
- **Frequency:** FrequencyWords es_50k (CC BY-SA 4.0), used only to draft the verb order.
- **Verb list and short English translations are curated files**, drafted automatically and reviewed by a human. Draft list: `docs/research/candidate-verbs.tsv`.
- **Fred Jehle's database is not shipped** (confirmed non-commercial license).
- An LLM may help at development time (drafting translations, writing the script). Never as the source of truth.

The About screen credits Wiktionary/Wiktextract (and FrequencyWords if frequency data is shipped). `src/data/LICENSE-DATA.md` states that `verbs.json` is CC BY-SA 4.0.

### 4.2 Schema (`verbs.json`)

```json
{
  "version": 1,
  "source": "…",
  "verbs": [
    {
      "infinitive": "hablar",
      "translations": { "en": "to speak" },
      "frequencyRank": 12,
      "regular": true,
      "reflexive": false,
      "tags": ["ar"],
      "forms": {
        "present_indicative": {
          "yo": "hablo", "tu": "hablas", "el": "habla",
          "nosotros": "hablamos", "vosotros": "habláis", "ellos": "hablan"
        }
      }
    },
    {
      "infinitive": "levantarse",
      "translations": { "en": "to get up" },
      "reflexive": true,
      "forms": {
        "present_indicative": { "yo": "me levanto", "tu": "te levantas", "…": "…" }
      }
    }
  ]
}
```

- `Person` = `yo | tu | el | nosotros | vosotros | ellos`. Display labels ("él / ella / usted") live in i18n files, not the data.
- `Tense` ids are stable strings (`present_indicative`, `preterite_indicative`, `imperfect_indicative`, `future_indicative`, `present_perfect`, `conditional`, `present_subjunctive`, later `imperative_affirmative`, `imperative_negative`). Never rename one once shipped, because progress data refers to it.
- Within a tense, persons are **optional** (`Partial<Record<Person, Form>>`). The imperative has no *yo*. Generators and the scheduler must skip missing persons.
- A form is `string | string[]` for real alternatives. The imperfect subjunctive is one tense id, `imperfect_subjunctive`, holding `[-ra, -se]` (both accepted; `-ra` shown first).
- Each verb also stores its `participle` (needed to build compound tenses and for future exercises).
- `translations` is keyed by language so Ukrainian (`"uk"`) can be added later. Falls back to `en`.
- Reflexive forms include the pronoun in the stored string.

### 4.3 Build script

`scripts/build-verbs` (Node + TypeScript), two stages. Full design and the list of data quirks to handle: `docs/data-source.md` → "Build design for M2" and "Things the build script must handle".

1. **`npm run fetch:verbs`** (rare, needs network): stream the kaikki Spanish verb dump (749 MB, never stored or committed), keep only verbs in `verb-list.json`, write a small committed `snapshot/` with source URL + date.
2. **`npm run build:verbs`** (normal, offline, deterministic, runs in CI): snapshot + `verb-list.json` + `translations.en.json` → `src/data/verbs.json`.
   - Exclude vos forms and reflexive forms embedded in non-reflexive tables.
   - Derive reflexive verbs from their base verb (pronoun + form) for non-imperative tenses.
   - Derive compound tenses from *haber* + participle (*haber* 3rd sg present = *ha*, not *hay*).
3. Validate (build fails): every included tense has its expected persons; no empty strings; every listed verb exists in the snapshot and has a translation.
4. Spot-check test (`spot-check.json`): ~40 known forms (regular, irregular, spelling-change, accent-shift, reflexive, compound, *-ra/-se*) must match. The 42 forms already verified in the research are a ready starting set.

---

## 5. Answer checking

`checker.ts` returns one of:

- `correct`: exact match
- `correct_missing_accent`: matches after removing accents → counts as correct; show "Watch the accent: **habláis**"
- `wrong`: show the correct form

Normalization before comparing: trim, collapse inner whitespace to one space, lowercase.
Accent stripping: remove accents from á é í ó ú ü only. **Keep ñ distinct from n.** "ano" ≠ "año".

Multi-word answers (reflexive *me levanto*, compound *he hablado*) are compared as whole normalized strings.

Unit tests must cover: accented, unaccented, wrong letter, ñ vs n, extra spaces, capital letters, alternatives (`string[]`), reflexive with and without pronoun (without = wrong), compound tenses.

---

## 6. Exercise engine (for future exercise types)

```ts
interface Exercise<Q, A> {
  type: string;                    // "conjugation_input", later "multiple_choice", …
  generate(ctx: ExerciseContext): Q;
  check(question: Q, answer: A): CheckResult;
}
```

`ExerciseContext` gives access to the verb repository, settings and progress. The practice screen renders a component per exercise type. Adding a new exercise = new folder under `src/exercises/` + new component; nothing else changes.

---

## 6a. Practice screen behaviour

1. Shows: infinitive, tense name, pronoun label. Translation per setting (`before` / `after` / `never`, default `after`).
2. Text input with autocorrect and auto-capitalize **off**; accent row above the keyboard inserts at the cursor.
3. "Check" button (and keyboard "return").
4. Feedback:
   - correct → green, translation (if setting = after)
   - correct with missing accent → green/amber, accented form highlighted
   - wrong → red, user's answer + correct form, translation, **"Show all forms"** button revealing `ConjugationTable` for that verb + tense
5. "Next" button. No auto-advance.

---

## 7. Progress (local, sync-ready)

An **item** = verb + tense + person. Store one record per item the user has seen:

```ts
{ verb: "hablar", tense: "present_indicative", person: "nosotros",
  box: 2,                              // Leitner box 1–5 (see §7a)
  dueAt: "2026-11-19T10:00:00Z",       // when it should be asked again
  attempts: 5, correct: 4,
  lastSeen: "2026-11-18T10:00:00Z", updatedAt: "…" }
```

Items with no record are "new".

- Keys are stable ids, so records can be uploaded to a server when accounts are added.
- `updatedAt` on every record makes later sync/merge possible.
- No personal data is stored.

## 7a. Question order

### Within a round (default 20 questions, configurable)
- **Correct:** item is done for this round.
- **Wrong:** show the correct form; re-insert the same item 3–5 questions later. It repeats until answered correctly once. Stats and the summary still record it as a mistake.
- Never the same item twice in a row; avoid the same verb back-to-back when possible.

### Across sessions (Leitner boxes)

| Box | Next due after |
|---|---|
| 1 | next session (due immediately) |
| 2 | 1 day |
| 3 | 3 days |
| 4 | 7 days |
| 5 | 21 days |

- Correct → box + 1 (max 5). Wrong → box 1.
- `correct_missing_accent` → counts as correct for the round, but the box **does not change** (dueAt is recalculated for the current box).
- First correct answer on a new item → box 2. First wrong answer → box 1.
- Box changes are applied based on the **first** answer to an item in a round; in-round re-asks don't move it further.
- Intervals live in one config constant so they're easy to tune.

### Building a round (scheduled mode)
1. Due items (`dueAt <= now`), most overdue first.
2. New items in verb frequency order, max 5 per round (configurable).
3. If still short: items with the worst correct/attempts ratio.
4. Shuffle respecting the variety rules.

All candidates are limited to the **tenses selected for this session** (§7b) and to visible persons (e.g. vosotros hidden).

### Free practice mode
Questions are random from the tenses selected for this session (optionally also limited to chosen verbs). Re-asking of mistakes still applies, and results still update boxes.

## 7b. Tense selection

- The home screen shows a row of **tense chips** (one per available tense) above the mode choice and the "Start" button. The user toggles any subset; at least one must be selected.
  - One tense selected → focused practice.
  - Several selected → items from all of them are mixed in the round.
- The selection is **remembered** (persisted locally) and preselected next time.
- Applies to both scheduled mode and free practice.
- **Unselected tenses keep their schedule.** Their items still become due; they're just not asked. The home screen shows due counts per tense (e.g. "Present · 12 due") on or next to each chip, so the user knows to come back to them.
- While only one tense exists (before M5), the chip row is hidden and the present tense is used.
- Tense availability goes through `entitlements.canUseTense()` so tenses could become a Pro feature later without changing the screen logic.

The scheduler is pure logic (takes progress + settings + "now", returns a list of items) and must have unit tests, including date-based ones with a fixed "now".

---

## 8. Settings

| Setting | Values | Default |
|---|---|---|
| Show translation | before / after / never | after |
| Show vosotros | on / off | on |
| Round length | 10 / 20 / 30 | 20 |
| New items per round | 0–10 | 5 |

Tense selection is **not** a setting; it's chosen per session on the home screen (§7b).

Theme follows the system (light/dark); no manual toggle needed in v1. The interface language follows the device, falling back to English.

---

## 9. Monetization- and telemetry-ready (no-op today)

- `entitlements.ts`: `isPro(): boolean` returns `true`. `canUseTense(t)`, `canUseExercise(type)` call it. If paid features arrive, only this file changes (e.g. backed by RevenueCat).
- `ads.ts`: `maybeShowAd(placement)` does nothing. Call it only at natural breaks (end of a round), never mid-question.
- `telemetry.ts`: `reportError(error)` and `trackEvent(name, props)` log to the console in development and do nothing in production. A crash-reporting vendor can be plugged in later. The privacy policy must be updated at that point.
- IAP, ad and most crash-reporting SDKs are native modules. They **do not work in Expo Go** and need an EAS development build. Expected, not a blocker.

---

## 10. Testing on devices

- **Daily:** Expo Go on the iPhone (`npx expo start`, scan the QR code with the Camera app).
- **Android checks:** Expo Go on the Android phone, at least once per milestone from M3. Optionally, the Android emulator from Android Studio on the Mac.
- **Before release:** an Android build from EAS (`eas build -p android`) installed on the Android phone, then the Google Play closed test.
- **Automated (agents):** Expo web in a browser via Playwright (§10a). Catches most layout and flow problems before a human looks; the iPhone remains the final check.

---

## 10a. Agent-friendly repo setup

### Commands (in `package.json`)

| Script | Does | When |
|---|---|---|
| `npm start` | `expo start` (QR code for Expo Go) | human, daily |
| `npm run web` | `expo start --web` | manual browser check |
| `npm run typecheck` | `tsc --noEmit` | part of check |
| `npm run lint` | ESLint | part of check |
| `npm test` | Jest (unit + component) | part of check |
| `npm run check` | typecheck + lint + test | **before every "done"**, and in CI |
| `npm run e2e` | export the web build, serve it, run Playwright; screenshots to `e2e/screenshots/` | after UI changes |
| `npm run build:verbs` | regenerate `src/data/verbs.json` | from M2 |

`check` must stay fast (well under a minute) so agents run it often. `e2e` is separate because it's slower.

### Rules enforced by tools

| Rule (from §3) | Enforced by |
|---|---|
| Only `verbRepository` imports `verbs.json` | ESLint `no-restricted-imports` (exception for that one file) |
| No hard-coded user-visible text in screens/components | i18n lint rule on `app/` and `src/components/` |
| No hard-coded colors | `react-native/no-color-literals` |
| Vendor SDKs (ads, IAP, crash reporting) only imported from `src/monetization/` and `src/telemetry/` | ESLint `no-restricted-imports` (add patterns when an SDK is added) |
| Types are sound | TypeScript `strict: true` |

### UI checks an agent can run

- Key elements have `testID`s: `prompt-verb`, `prompt-tense`, `prompt-pronoun`, `answer-input`, `check-button`, `feedback`, `correct-form`, `show-all-forms`, `next-button`.
- Component tests (React Native Testing Library) cover the practice flow: correct, missing accent, wrong → correct form → Show all forms → Next.
- `e2e/` Playwright checks the same flow in the browser and saves screenshots at phone size (e.g. 390×844) in **light and dark**, and with a large font scale. The agent looks at the screenshots before reporting a UI milestone as done.
- AsyncStorage works on web (localStorage), so the full app runs in the browser. Features that can't run on web must degrade gracefully there, not crash.

### Agent settings (`.claude/settings.json`, committed)

- Allowed without prompting: the npm scripts above, `npx expo …` (except publishing), read-only git commands, `git add`/`commit`/`checkout -b`/`push -u origin <branch>`.
- Denied: `eas submit`, `eas update`, force pushes, `rm -rf`, reading `src/data/verbs.json` (too large for context; use `verbRepository` tests or the build script instead) and `scripts/build-verbs/raw/`.
- Hook: format each edited file with Prettier.

Personal overrides go in `.claude/settings.local.json` (gitignored).

### CI (`.github/workflows/ci.yml`)

On every push and pull request: install with `npm ci` on the pinned Node version, run `npm run check`. From M1 also run `npm run e2e` and upload screenshots as a build artifact.

### Reproducibility

- `package-lock.json` committed; Node version pinned in `.nvmrc` and `"engines"`.
- Raw data and screenshots in `.gitignore`. `scripts/build-verbs/README.md` says where to download the raw data.

### Memory between sessions

- `docs/PLAN.md` Status table: where we are.
- `docs/decisions.md`: one entry per decision (date, decision, reason). Agents must not reverse a logged decision without asking.
- `CLAUDE.md`: stays short; points to these files rather than repeating them.
- Custom commands / skills in `.claude/` are added **only** once a repeated workflow is noticed (likely candidates: next milestone, add a tense, UI verification).

---

## 11. Milestones

Each milestone: work on a branch (`m1-quiz`, …), open a pull request, and finish with: `npm run check` passes, `npm run e2e` passes (from M1), Status table and `docs/decisions.md` updated, app checked by a human on the iPhone via Expo Go, PR merged.

### M0: Setup + agent tooling
- Create Expo project (TypeScript strict, Expo Router) inside the existing repo (which already has `CLAUDE.md`, `docs/`, `.claude/settings.json`).
- ESLint, Prettier, Jest + React Native Testing Library.
- Lint rules from §10a (restricted imports, i18n raw-text rule, no color literals).
- npm scripts from §10a, including `check` and `e2e`.
- Expo web enabled; Playwright set up with one smoke test that opens the home screen and saves light + dark screenshots.
- Folder structure from §3 with empty modules; i18n with `en.json`; theme with light/dark tokens.
- `.gitignore` (node_modules, .expo, dist, raw data, e2e screenshots, `.claude/settings.local.json`), `.nvmrc`, `"engines"`.
- CI workflow from §10a.
- Adjust `.claude/settings.json` and `CLAUDE.md` if any command names changed.
- **Done when:** `npm run check` and `npm run e2e` pass locally and in CI; a deliberately added hard-coded string / color / `verbs.json` import in a screen makes lint fail (then remove it); the home screen opens on the iPhone via Expo Go in light and dark mode.

### M1: Quiz with sample data
- Hand-written `verbs.json` with ~15 verbs, present tense only (mix of regular, irregular, and 2 reflexive).
- `verbRepository`, generator (random, no immediate repeats), checker (+ unit tests from §5).
- Practice screen per §6a, including accent row, "Show all forms" and `ConjugationTable`.
- All text via i18n, all colors via theme; layout works with large system font sizes.
- `testID`s from §10a; component tests and a Playwright flow test for the practice loop.
- **Done when:** the practice loop passes component + e2e tests, screenshots (light, dark, large font) look right, and it works on the iPhone.

### M2: Real data
- Human reviews `docs/research/candidate-verbs.tsv` → `scripts/build-verbs/verb-list.json` (~300 verbs incl. common reflexive verbs). Can be done before M2 starts.
- Draft `translations.en.json` (short glosses); human reviews.
- Fetch + build scripts from §4.3; generate ~300 verbs, present tense (the script supports all simple tenses + compound from the start; only present is switched on in the app).
- Spot-check tests pass. Attribution on the About screen; `src/data/LICENSE-DATA.md`.
- The environment running M2 needs network access to `kaikki.org` (for fetch only).
- **Done when:** the app uses generated data and the build script is repeatable.

### M3: Settings + rounds
- Settings screen per §8.
- Rounds with in-round re-asking of mistakes (§7a) and a summary screen (score, list of mistakes).
- Settings persisted locally.
- First check on the Android phone.

### M4: Progress + scheduling
- Progress store from §7 with Leitner boxes and due dates (§7a).
- Scheduled mode builds rounds from due + new + weak items. Free practice mode added.
- Home screen shows simple stats (items per box, due today), and due counts per tense.
- Session tense selection from §7b (state + persistence + scheduler filtering), with the chip row hidden while only one tense exists.

### M5: More tenses
Add, in this order: preterite → imperfect → future → present perfect → conditional → present subjunctive.
- Extend the build script; the tense chip row (§7b) appears once a second tense exists.
- Test focused (one tense) and mixed (several tenses) rounds on the device.

### M6: Release prep (Google Play)
- App name, icon, splash screen.
- Privacy policy page (see §12), Play Store listing, Data safety form.
- Decide on crash reporting for v1 (see §13).
- EAS Android build; Google Play closed test (12 testers × 14 days for new personal accounts); then production.

### Later (unordered)
Imperative (affirmative + negative), Ukrainian interface + translations, iOS App Store release, multiple-choice exercise, sentence fill-in, irregular-only drills, timed mode, manual theme toggle, accounts + cloud sync, Pro unlock, ads.

---

## 12. Privacy and store notes

- As built through M5, the app collects **no** data. It still needs a privacy policy URL for Google Play (a short page saying so; GitHub Pages is free hosting) and the Data safety form. Apple has equivalent requirements for the iOS release.
- **Adding crash reporting, analytics, accounts or ads changes this.** The policy and forms must be updated, and ads in the EU/UK need a consent prompt (Google's UMP SDK); on iOS, personalized ads need the App Tracking Transparency prompt.
- Do not mark the app as aimed at children. Child-directed apps fall under much stricter rules (COPPA, Google Families policy), especially for ads.

---

## 13. Open questions

| Question | Decide before |
|---|---|
| ~~Data source license confirmed~~ → resolved: Wiktionary/kaikki (CC BY-SA 4.0), see `docs/data-source.md` | ✅ |
| Final verb list (review `docs/research/candidate-verbs.tsv`) | M2 |
| Default for "Show vosotros" (Spain vs Latin America focus) | M3 |
| Crash reporting in the first release? Which vendor? | M6 |
| App name (free in stores, not copying an existing brand) | M6 |
| Accounts + sync: when, and with what backend | after v1 |
| Ukrainian translations for verbs: source and review | when adding Ukrainian |

---

## 14. Working agreement for the coding assistant

- Do one milestone at a time, on its own branch; stop and summarize at the end of each.
- Run `npm run check` before reporting anything as done; after UI changes also run `npm run e2e` and look at the screenshots.
- At the start and end of a milestone, update the Status table. Log new decisions in `docs/decisions.md`.
- Never reverse a logged decision without asking.
- Do not add dependencies beyond §2 without asking.
- Every pure-logic module (checker, generator, scheduler, repository, build script) gets unit tests.
- Never hand-edit `src/data/verbs.json` after M2. Change the build script instead.
- Follow the rules at the end of §3. Never disable a lint rule to make `check` pass; fix the code or ask.
