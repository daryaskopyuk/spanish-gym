# Spanish Verb Trainer

Mobile app (Expo / React Native, TypeScript) for practising Spanish verb conjugation. The user sees a verb, tense and pronoun and types the conjugated form. Fully offline, no accounts, no backend. Google Play first, iOS later.

## Where things are

- **Plan, milestones, current status:** `docs/PLAN.md` (read the Status table first)
- **Decisions and reasons:** `docs/decisions.md`. Do not reverse a logged decision without asking.
- Screens: `app/` (Expo Router). Logic: `src/`. Data build script: `scripts/build-verbs/`. Browser UI tests: `e2e/`.

## Commands

```bash
npm run check        # typecheck + lint + unit/component tests. Run before saying you're done.
npm run e2e          # web build + Playwright flow tests + screenshots in e2e/screenshots/
npm test -- <path>   # run one test file
npm run build:verbs  # regenerate src/data/verbs.json (offline; see scripts/build-verbs/README.md)
npm run fetch:verbs  # rare, needs network: refresh scripts/build-verbs/snapshot/ from kaikki.org
npm start            # Expo dev server (human scans QR with Expo Go)
npm run web          # dev server in the browser
```

Unit/component tests live in `tests/`, browser tests in `e2e/`. Add packages with `npx expo install <pkg>` (picks SDK-compatible versions), after asking per the working agreement. Expo changes between SDKs: check the docs for the SDK version in `package.json` (https://docs.expo.dev/versions/v58.0.0/) rather than relying on memory.

After any UI change: run `npm run e2e` and **look at the screenshots** (light, dark, large font) before reporting done.

## Architecture rules (enforced by lint; never disable a rule to pass)

- Only `src/data/verbRepository.ts` reads `verbs.json`. Everything else calls the repository.
- No hard-coded user-visible text in `app/` or `src/components/`. Use i18n keys from `src/i18n/locales/en.json`.
- No hard-coded colors. Use `src/theme`.
- Paid-feature checks only via `src/monetization/entitlements.ts`; ads only via `src/monetization/ads.ts`; error reporting / analytics only via `src/telemetry/telemetry.ts`. All are no-ops today.
- Pure logic (checker, generator, scheduler, repository, build script) has unit tests. The scheduler takes `now` as a parameter.
- Tense ids and person ids are stable: never rename them (saved progress refers to them).

## Data

- `src/data/verbs.json` is **generated**. Never edit it by hand and don't read it: it is large. Change `scripts/build-verbs/` instead. Don't read `scripts/build-verbs/snapshot/kaikki-verbs.jsonl` whole either (~2 MB).
- Reflexive forms include the pronoun (`me levanto`). Compound tenses are multi-word (`he hablado`). A tense may lack some persons (imperative has no `yo`).
- Answer checking: missing accents are accepted (`correct_missing_accent`), but `ñ` is never equal to `n`.

## Working agreement

- One milestone at a time, on its own branch (`m1-quiz`, …), with a pull request. Stop and summarize at the end.
- Update the Status table in `docs/PLAN.md` at the start and end of a milestone; add new decisions to `docs/decisions.md`.
- Ask before adding a dependency not listed in `docs/PLAN.md` §2.
- Never run `eas submit`, `eas update` or force-push.
