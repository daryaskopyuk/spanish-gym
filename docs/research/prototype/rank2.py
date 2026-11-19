import json, sys, collections
SP = sys.argv[1]
V = {}
for l in open(f'{SP}/out/verbs-filtered.jsonl', encoding='utf8'):
    d = json.loads(l); V.setdefault(d['word'], d)
BAD = {'obsolete','archaic','rare','misspelling','nonstandard','dated','alt-of','form-of','dialectal','uncommon'}
def ok(d):
    # keep if at least one of the first senses is not marked obsolete/rare/misspelling etc.
    tags = d['sense_tags'] or [[]]
    gl = ' '.join(d['glosses']).lower()
    if 'misspelling' in gl or 'obsolete form' in gl or 'alternative form' in gl: return False
    return any(not (set(t) & BAD) for t in tags)
freq = {}
for line in open(f'{SP}/raw/es_50k.txt', encoding='utf8'):
    w, c = line.rsplit(' ', 1); freq[w] = int(c)
# Method B: infinitive count + participle count + gerund count (rarely homographs)
def nonfinite(d):
    s = {d['word']}
    for f in d['forms']:
        t = set(f['tags'])
        if 'gerund' in t and ' ' not in f['form']: s.add(f['form'])
        if t >= {'participle','past','masculine','singular'}: s.add(f['form'])
    return s
score = collections.Counter()
dropped = []
for w, d in V.items():
    if w.endswith('se'): continue
    if not ok(d): dropped.append(w); continue
    score[w] = sum(freq.get(f, 0) for f in nonfinite(d))
top = [w for w, c in score.most_common(600) if c > 0]
print('kept verbs ranked:', len(top))
print('TOP 100:', ' '.join(top[:100]))
print('\n201-300:', ' '.join(top[200:300]))
print('\n401-500:', ' '.join(top[400:500]))
for w in ['unir','parar','nadar','casar','her','perar','piensar','hechar','aser','seer']:
    print(w, 'rank', top.index(w)+1 if w in top else '-', 'dropped' if w in dropped else '')
json.dump(top, open(f'{SP}/out/top_methodB.json','w'))
