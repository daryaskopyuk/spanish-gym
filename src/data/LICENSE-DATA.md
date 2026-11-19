# License of `verbs.json`

`src/data/verbs.json` is generated from Wiktionary data and is licensed under the
**Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**:
https://creativecommons.org/licenses/by-sa/4.0/

This license covers the data file only. The app's source code is a separate work.

## Attribution

- Verb conjugations and definitions from **Wiktionary** (https://www.wiktionary.org/), CC BY-SA 4.0,
  extracted with **Wiktextract / kaikki.org** by Tatu Ylonen (https://kaikki.org/).
- Verb order (`frequencyRank`) based on **FrequencyWords** by Hermit Dave
  (https://github.com/hermitdave/FrequencyWords), derived from OpenSubtitles, CC BY-SA 4.0.

## Changes made

Forms were filtered (no vos forms, no archaic forms, no verb + pronoun combinations), reflexive
verbs were derived from their base verb, and short English translations were written by hand.
See `scripts/build-verbs/README.md`.
