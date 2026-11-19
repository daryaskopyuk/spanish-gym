# Ideas for later

A parking lot for feature ideas that are not planned yet. Nothing here is committed to.
When an idea is picked up, move it into a milestone in `docs/PLAN.md` and log any decisions in `docs/decisions.md`.

The short list of bigger "later" items (imperative, Ukrainian, iOS, accounts, …) lives in `docs/PLAN.md` §11 "Later". This file holds the details and newer ideas.

---

## Example sentences for verbs

**Idea:** show a short example sentence that uses the verb, so the learner sees it in context, not only as a bare form.

Possible shapes (pick one or combine):
- After answering, show one sentence with the conjugated form highlighted, plus the English translation.
  *hablo → "**Hablo** con mi madre todos los días." / "I talk to my mother every day."*
- A verb details screen with a few examples per tense.
- Later, an exercise built on it: the sentence with a gap to fill (this overlaps with "sentence fill-in" in the PLAN "Later" list).

Open questions:
- **Where do the sentences come from?** Options: Wiktionary usage examples (would need a new fetch; the current snapshot in `scripts/build-verbs/snapshot/` does not keep them), Tatoeba (CC-BY, has Spanish–English pairs), or hand-written for the most common verbs. Check the licence before shipping any of them.
- Do we need a sentence for every verb × tense × person, or is one example per verb (or per tense) enough?
- Translations: English first, keyed by language like the existing `translations` so Ukrainian can follow.
- Size: sentences make `verbs.json` bigger; maybe a separate generated file, still read only through `verbRepository.ts`.
