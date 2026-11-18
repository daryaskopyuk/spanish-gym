import json, sys
# Reads kaikki JSONL on stdin; writes compact verb entries with conjugation forms.
out = open(sys.argv[1], 'w', encoding='utf8')
n = kept = 0
for line in sys.stdin:
    n += 1
    try:
        d = json.loads(line)
    except Exception:
        continue
    if d.get('lang_code') != 'es' or d.get('pos') != 'verb':
        continue
    forms = [f for f in d.get('forms', []) if f.get('source') == 'conjugation']
    if not forms:
        continue
    kept += 1
    out.write(json.dumps({
        'word': d['word'],
        'etym': d.get('etymology_number'),
        'glosses': [s.get('glosses', [''])[0] for s in d.get('senses', [])[:6]],
        'sense_tags': [s.get('tags', []) for s in d.get('senses', [])[:6]],
        'forms': [{'form': f['form'], 'tags': f['tags']} for f in forms if 'combined-form' not in f['tags']],
    }, ensure_ascii=False) + '\n')
print('lines', n, 'kept', kept, file=sys.stderr)
