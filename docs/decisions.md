# Decision log

One entry per decision: what was decided and why. Newest at the bottom. Agents must not reverse an entry without asking; to change one, add a new entry that supersedes it.

| Date | Decision | Why |
|---|---|---|
| 2026-11-18 | Expo (React Native) + TypeScript | One codebase for Android and iOS; testing on a real phone via Expo Go without Xcode/Android Studio. |
| 2026-11-18 | Google Play first, iOS later | Developer has iPhone for daily testing, Android phone available for checks; Play is $25 one-time. |
| 2026-11-18 | Conjugation data bundled as generated JSON, no runtime lookups (no LLM/Google API) | Correctness matters in a learning app; offline; no server, keys or per-request cost. ~1–2 MB is fine to ship. |
| 2026-11-18 | Store every form, don't generate regular forms by rules | Rules have many exceptions (stem/spelling/accent changes); stored strings are easy to verify. |
| 2026-11-18 | Prefer a data source whose license allows commercial use (Wiktionary/kaikki candidate) | Keep monetization possible later. |
| 2026-11-18 | Fully offline, no accounts in v1; progress records sync-ready (stable ids, `updatedAt`) | Simplicity and privacy now; accounts later would also fix progress loss on phone change. |
| 2026-11-18 | Monetization, ads, telemetry behind no-op modules | No monetization now, but avoid a rewrite if added. |
| 2026-11-18 | Accept answers without accents; show accented form; ñ ≠ n | Typing accents on phones is hard; ñ changes meaning (año/ano). |
| 2026-11-18 | Missing accent counts as correct but doesn't move the item up a Leitner box | Almost right; keep it around a bit longer. |
| 2026-11-18 | On-screen accent row á é í ó ú ü ñ | Faster than long-press on the phone keyboard. |
| 2026-11-18 | Store vosotros in data; setting to hide it; default decided later | Cheap to include now; region preference varies. |
| 2026-11-18 | Question shows infinitive, tense, pronoun; translation after answering by default (setting: before/after/never) | Avoid giving a hint; flexible for different learners. |
| 2026-11-18 | Pronoun labels "él / ella / usted", "ellos / ellas / ustedes" (and -as forms for nosotros/vosotros) | Make clear the form covers all of them. |
| 2026-11-18 | "Next" button, no auto-advance; mistakes show correct form + "Show all forms" | User controls pace; full table available but not forced. |
| 2026-11-18 | Reflexive answers must include the pronoun (me levanto) | That's how the form is actually used. |
| 2026-11-18 | Compound tenses included as multi-word answers | Commonly used tenses. |
| 2026-11-18 | Imperative later, not first iteration; data format allows missing persons | Different structure (no yo, negative form). |
| 2026-11-18 | Tense order: present → preterite → imperfect → future → present perfect → conditional → present subjunctive | Roughly by frequency and learning order. |
| 2026-11-18 | Spaced repetition with 5 Leitner boxes (next session / 1 / 3 / 7 / 21 days); wrong answers re-asked 3–5 questions later in the round | Simple, understandable, effective. |
| 2026-11-18 | Round length 20 default; max 5 new items per round | Manageable sessions. |
| 2026-11-18 | Tense selection per session on the home screen (one = focused, several = mix); unselected tenses keep their schedule and show due counts | Focused practice for learning a tense, mixing for retention. |
| 2026-11-18 | English UI via i18n layer from day one; Ukrainian possible later | Cheap now, expensive to retrofit. |
| 2026-11-18 | Light/dark mode and system font scaling from M1 | Cheap now, expensive to retrofit. |
| 2026-11-18 | Crash reporting: undecided for v1 (decide in M6) | Affects privacy policy. |
| 2026-11-18 | Data source: Wiktionary via kaikki.org (CC BY-SA 4.0); `verbs.json` offered under CC BY-SA 4.0, app code separate | Commercial use allowed; 42/42 spot-check accuracy; ~8,900 verbs with full tables. See `docs/data-source.md`. |
| 2026-11-18 | Jehle database not shipped | Confirmed CC BY-NC-SA 3.0 (non-commercial). |
| 2026-11-18 | Verb list and short translations are curated, committed files (auto-drafted, human-reviewed) | Frequency ranking from subtitles is biased (vulgar, noun-like participles); Wiktionary first glosses are sometimes poor labels. |
| 2026-11-18 | Two-stage data build: rare network `fetch` → committed snapshot; offline deterministic `build` in CI | 749 MB dump shouldn't be in the repo or needed for every build; Wiktionary changes over time. |
| 2026-11-18 | Reflexive verbs and compound tenses derived in the build script (pronoun + form; haber + participle) | Data has reflexive verbs inconsistently and no compound forms; both derivations are mechanical and testable. |
| 2026-11-18 | Imperfect subjunctive: one tense with -ra and -se as accepted alternatives | Both are correct Spanish. |
| 2026-11-18 | vos forms excluded for now | Not in scope; data has them tagged, so a "voseo" option is possible later. |
| 2026-11-18 | Repo set up for agents: `npm run check`, lint-enforced architecture rules, Expo web + Playwright screenshots, CI, branch + PR per milestone | Agents can verify their own work; mistakes caught automatically. |
| 2026-11-18 | Expo SDK 58, Node 24 (pinned in `.nvmrc` + `engines`) | Latest stable; Expo Go on the phone only runs the latest SDK. Node 24 is the current LTS. |
| 2026-11-18 | Web export as a single-page app (`web.output: "single"`), not static rendering | Web is only used for automated UI checks. Static rendering pre-builds light-mode HTML, and in dark mode the styles broke while the page started up (caught in the M0 screenshots). |
| 2026-11-18 | Expo companion packages installed with `npx expo install` (expo-constants, expo-linking, expo-font, expo-splash-screen, expo-status-bar, expo-system-ui) plus `test-renderer` | Required by Expo Router / the splash screen / Android dark mode, and `test-renderer` is a required peer of React Native Testing Library 14. Part of the §2 stack, not new libraries. |
| 2026-11-18 | Zustand and AsyncStorage not installed until first used (M3) | Keep M0 minimal; both are already approved in §2. |
| 2026-11-18 | Unit/component tests in `tests/`, browser tests in `e2e/` | Matches §3. |
| 2026-11-18 | Prettier formats code and config, not Markdown; `npm run lint` also runs `prettier --check` | Prettier pads Markdown tables, so one-row doc edits would rewrite whole tables. The check makes CI catch unformatted code. |
| 2026-11-19 | Typed routes (`experiments.typedRoutes`) turned off | Expo only regenerates the route types while the dev server runs, so `npm run typecheck` passed or failed depending on whether `npm start` had run since a screen was added, and CI never had them. Low value with a handful of screens. |
| 2026-11-19 | Any accent difference (missing, extra or misplaced á é í ó ú ü) counts as `correct_missing_accent`; ñ ≠ n | Same treatment as a missing accent: the letters are right, so show the correct accented form. |
| 2026-11-19 | `Exercise.check` returns `{ result, correctForm }`, not just the result | The screen needs the matched alternative (e.g. *-se* when the user typed it) or all alternatives when wrong. |
| 2026-11-19 | Settings are fixed defaults until M3 (`DEFAULT_SETTINGS` in `settingsStore.ts`) | The settings screen and persistence are M3; the practice screen already reads settings through one hook. |
| 2026-11-19 | Browser tests simulate a large system font via `window.__E2E_FONT_SCALE__` (web only; native always uses the OS setting) | Browsers ignore the phone's text-size setting, so it can't be emulated otherwise. |
| 2026-11-19 | After checking, the answer field and accent row are locked until "Next"; the keyboard's return key checks the answer | Prevents editing an answer after seeing the feedback; return-to-check matches phone habits. |
| 2026-11-19 | "Show all forms" is offered after every answer, not only after mistakes (collapsed by default) | Requested after testing on the phone: a correct answer is a good moment to see the whole pattern. Extends the earlier "mistakes show … Show all forms" entry. |
| 2026-11-19 | Visual theme "Olive grove": olive green on cream (light), olive/lime on warm charcoal (dark); all text pairs ≥ 4.5:1 contrast | Chosen by the owner from three green options rendered on the real app; blue/white felt too plain. |
| 2026-11-19 | Correct-answer feedback is visual only: the feedback card pops in, the answer box takes the result colour, and titles carry ✓ / ✗. No vibration for now | Owner preference. ✓ / ✗ also mean the result doesn't rely on colour alone. The pop is skipped when the phone's "Reduce Motion" setting is on. |
| 2026-11-19 | Custom fonts and the splash / loading screen postponed | Owner preference; revisit later (splash is still the Expo template placeholder). |
