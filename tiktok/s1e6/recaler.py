# Recale minutage.json sur des débuts de phrase relevés à la main (ancres.json) ; les mots sont répartis sur les passages parlés de chaque phrase.
import json, re, subprocess
m = json.load(open('minutage.json')); S = json.load(open('script.json')); A = json.load(open('ancres.json'))
out = subprocess.run(['ffmpeg','-hide_banner','-i','voix.mp3','-af','silencedetect=noise=-35dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
fin_voix = m['duree_voix']
sil = [(a, b) for a, b in zip(st, en) if b < fin_voix]
debuts = [A[b] for _, b in S] + [fin_voix]
sent = []
for si in range(len(S)):
    a, b = debuts[si], debuts[si + 1]
    # passages parlés dans [a, b]
    parle = []; t = a
    for s, e in sil:
        if e <= a or s >= b: continue
        if s > t: parle.append((t, min(s, b)))
        t = max(t, e)
    if t < b: parle.append((t, b))
    # on retire la dernière pause (fin de phrase)
    tot = sum(e - s for s, e in parle)
    ws = [w for w in m['words'] if w['si'] == si]; L = [len(w['txt']) + 1 for w in ws]; Lt = sum(L)
    def reel(x):
        for s, e in parle:
            if x <= e - s: return s + x
            x -= e - s
        return parle[-1][1]
    acc = 0
    for w, l in zip(ws, L):
        t0 = reel(acc / Lt * tot); acc += l; t1 = reel(acc / Lt * tot - 1e-6)
        w['t'] = round(t0, 3); w['d'] = round(max(0.05, t1 - t0), 3)
    sent.append({'t0': ws[0]['t'], 't1': round(ws[-1]['t'] + ws[-1]['d'], 3)})
m['sent'] = sent
json.dump(m, open('minutage.json', 'w'), ensure_ascii=False)
for (txt, b), s in zip(S, sent): print(f"{s['t0']:6.2f}-{s['t1']:6.2f} {b:11s} {txt[:45]}")
