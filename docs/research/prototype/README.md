# Research prototype (reference only)

Python scripts used for the data research in `docs/data-source.md`. Not part of the app or the build.
M2 reimplements this in TypeScript under `scripts/build-verbs/`.

- `filter.py`: stream the kaikki Spanish verb dump on stdin, keep Spanish verbs with conjugation tables.
  `curl -sS https://kaikki.org/dictionary/Spanish/pos-verb/kaikki.org-dictionary-Spanish-by-pos-verb.jsonl | python3 filter.py verbs-filtered.jsonl`
- `proto.py`: tag → tense/person mapping, the 42-form accuracy spot check, first (rejected) frequency ranking.
- `rank2.py`: frequency ranking by infinitive + gerund + participle (used for `../candidate-verbs.tsv`).

The scripts expect a working directory containing `out/verbs-filtered.jsonl` and `raw/es_50k.txt`, passed as the first argument.
