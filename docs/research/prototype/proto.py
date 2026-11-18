import json, sys, collections, re
SP = sys.argv[1]
V = {}
for l in open(f'{SP}/out/verbs-filtered.jsonl', encoding='utf8'):
    d = json.loads(l)
    V.setdefault(d['word'], d)   # first etymology only (prototype)

PERSON = {('first-person','singular'):'yo', ('second-person','singular'):'tu', ('third-person','singular'):'el',
          ('first-person','plural'):'nosotros', ('second-person','plural'):'vosotros', ('third-person','plural'):'ellos'}
TENSE = {  # our id -> required tags, forbidden tags
  'present_indicative':   ({'indicative','present'}, set()),
  'preterite_indicative': ({'indicative','preterite'}, set()),
  'imperfect_indicative': ({'indicative','imperfect'}, set()),
  'future_indicative':    ({'indicative','future'}, set()),
  'conditional':          ({'conditional'}, set()),
  'present_subjunctive':  ({'subjunctive','present'}, set()),
  'imperfect_subjunctive_ra': ({'subjunctive','imperfect'}, {'imperfect-se'}),
  'imperfect_subjunctive_se': ({'subjunctive','imperfect','imperfect-se'}, set()),
}
REFL = re.compile(r'^(me|te|se|nos|os) ')
def table(d, tense):
    req, forb = TENSE[tense]
    t = collections.defaultdict(list)
    for f in d['forms']:
        tags = set(f['tags'])
        if not req <= tags or tags & forb or 'vos-form' in tags: continue
        if REFL.match(f['form']) and not d['word'].endswith('se'): continue
        for (p, n), key in PERSON.items():
            if p in tags and n in tags:
                if f['form'] not in t[key]: t[key].append(f['form'])
    return dict(t)

def participle(d):
    for f in d['forms']:
        if set(f['tags']) >= {'participle','past','masculine','singular'}: return f['form']
    for f in d['forms']:
        if set(f['tags']) == {'participle','past'}: return f['form']

# --- frequency: sum counts of all simple forms of each lemma
freq = {}
for line in open(f'{SP}/raw/es_50k.txt', encoding='utf8'):
    w, c = line.rsplit(' ', 1); freq[w] = int(c)
score = collections.Counter()
for w, d in V.items():
    if w.endswith('se'): continue
    forms = {w}
    for tense in TENSE:
        for vals in table(d, tense).values(): forms.update(vals)
    p = participle(d)
    if p: forms.add(p)
    score[w] = sum(freq.get(f, 0) for f in forms)
top = [w for w, _ in score.most_common(400)]
print('TOP 100:', ' '.join(top[:100]))
print('\n301-400:', ' '.join(top[300:400]))
json.dump(top, open(f'{SP}/out/top400.json','w'))

# --- accuracy spot-check against known forms
CHECK = [
 ('ser','present_indicative','yo','soy'),('ser','preterite_indicative','el','fue'),('ser','imperfect_indicative','nosotros','éramos'),
 ('ir','present_indicative','vosotros','vais'),('ir','preterite_indicative','ellos','fueron'),('ir','imperfect_indicative','yo','iba'),
 ('estar','present_indicative','tu','estás'),('estar','preterite_indicative','yo','estuve'),('tener','present_indicative','yo','tengo'),
 ('tener','future_indicative','el','tendrá'),('hacer','preterite_indicative','el','hizo'),('hacer','conditional','yo','haría'),
 ('decir','present_indicative','yo','digo'),('decir','preterite_indicative','ellos','dijeron'),('poder','preterite_indicative','yo','pude'),
 ('poder','present_indicative','tu','puedes'),('querer','future_indicative','yo','querré'),('saber','present_indicative','yo','sé'),
 ('saber','present_subjunctive','el','sepa'),('dar','present_subjunctive','el','dé'),('ver','imperfect_indicative','yo','veía'),
 ('pensar','present_indicative','ellos','piensan'),('dormir','preterite_indicative','el','durmió'),('pedir','present_indicative','yo','pido'),
 ('enviar','present_indicative','yo','envío'),('buscar','preterite_indicative','yo','busqué'),('llegar','present_subjunctive','yo','llegue'),
 ('coger','present_indicative','yo','cojo'),('conocer','present_indicative','yo','conozco'),('caer','present_indicative','yo','caigo'),
 ('oír','present_indicative','el','oye'),('leer','preterite_indicative','ellos','leyeron'),('reír','present_indicative','nosotros','reímos'),
 ('hablar','imperfect_subjunctive_ra','yo','hablara'),('hablar','imperfect_subjunctive_se','yo','hablase'),('vivir','present_indicative','vosotros','vivís'),
 ('haber','present_indicative','el','ha'),('haber','present_indicative','nosotros','hemos'),('venir','present_indicative','yo','vengo'),
 ('poner','future_indicative','nosotros','pondremos'),('salir','conditional','ellos','saldrían'),('llamarse','present_indicative','yo','me llamo'),
]
bad = 0
for verb, tense, person, exp in CHECK:
    got = table(V[verb], tense).get(person, [])
    if exp not in got: bad += 1; print('MISMATCH', verb, tense, person, 'expected', exp, 'got', got)
    elif len(got) > 1: print('ALTERNATIVES', verb, tense, person, got)
print(f'spot-check: {len(CHECK)-bad}/{len(CHECK)} match')
# completeness of top 300
incomplete = []
for w in top[:300]:
    for tense in TENSE:
        t = table(V[w], tense)
        if len(t) < 6: incomplete.append((w, tense, sorted(t))); break
print('top300 with an incomplete tense:', len(incomplete), incomplete[:8])
print('participles:', {w: participle(V[w]) for w in ['hacer','decir','ver','escribir','abrir','volver','romper','poner','morir','ir']})
