"""Minutage provisoire (avant la voix) : python3 estimer.py script.json sortie.json [car/s]"""
import json, re, sys
S = json.load(open(sys.argv[1])); CPS = float(sys.argv[3]) if len(sys.argv) > 3 else 16.5
words, sent, t = [], [], 0.2
for si, (txt, beat) in enumerate(S):
    t0 = t
    for m in txt.split():
        c = 'w'; raw = m
        if m[0] in '*!+~': c = {'*': 'y', '!': 'r', '+': 'g', '~': 'b'}[m[0]]; raw = m[1:]
        d = (len(raw) + 1) / CPS
        words.append({'txt': raw, 'c': c, 'si': si, 't': round(t, 3), 'd': round(d, 3)}); t += d
        if raw.endswith('…'): t += 0.35
        elif re.search(r'[.:?!]$', raw): t += 0.2
    sent.append({'t0': round(t0, 3), 't1': round(t, 3)}); t += 0.1
json.dump({'duree_voix': t, 'duree_fichier': t + 0.3, 'words': words, 'sent': sent}, open(sys.argv[2], 'w'), ensure_ascii=False)
print('durée estimée', round(t, 1), 's')
