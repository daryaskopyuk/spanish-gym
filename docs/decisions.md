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
| 2026-11-18 | Repo set up for agents: `npm run check`, lint-enforced architecture rules, Expo web + Playwright screenshots, CI, branch + PR per milestone | Agents can verify their own work; mistakes caught automatically. |
