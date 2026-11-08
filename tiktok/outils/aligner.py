import re, json, subprocess, sys
html = open('/home/user/matheoguz.github.io/tiktok/ep1/index.html').read()
block = html[html.index('const SCRIPT = ['):html.index('];', html.index('const SCRIPT = ['))]
SCRIPT = re.findall(r'\["(.*?)", "(.*?)"\]', block)
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','voix.mp3']))
out = subprocess.run(['ffmpeg','-hide_banner','-i','voix.mp3','-af','silencedetect=noise=-35dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
sil = list(zip(st, en))
speech_end = sil[-1][0] if sil and abs(sil[-1][1]-dur) < 0.05 else dur
inner = [s for s in sil if s[1] < speech_end]
# mots
words = []
for si, (txt, beat) in enumerate(SCRIPT):
    for m in txt.split():
        c = 'w'; raw = m
        if m[0] in '*!+~': c = {'*':'y','!':'r','+':'g','~':'b'}[m[0]]; raw = m[1:]
        words.append({'txt': raw, 'c': c, 'si': si})
# frontières candidates : après ponctuation
cand = [i for i, w in enumerate(words[:-1]) if re.search(r'[.:?!,…]$', w['txt'])]
L = [len(w['txt']) + 1 for w in words]
tot = sum(L); speech = speech_end - sum(e - s for s, e in inner)
# estimation : temps parlé proportionnel aux caractères ; on aligne par programmation dynamique
import itertools
cum = list(itertools.accumulate(L))
def est(i):  # temps "parlé" estimé à la fin du mot i
    return cum[i] / tot * speech
# convertir temps parlé -> temps réel en sautant les silences
def reel(tp):
    t = 0.0; restant = tp; pos = 0.0
    for s, e in inner:
        if restant <= s - pos: return pos + restant
        restant -= (s - pos); pos = e
    return pos + restant
# DP : associer chaque silence à une frontière candidate (ordre conservé), minimiser l'écart
B = [reel(est(i)) for i in cand]
n, m = len(cand), len(inner)
INF = 1e9
dp = [[INF] * (m + 1) for _ in range(n + 1)]; ch = [[None] * (m + 1) for _ in range(n + 1)]
dp[0][0] = 0
for i in range(n + 1):
    for j in range(m + 1):
        if dp[i][j] >= INF: continue
        v = dp[i][j]
        if i < n and v + 1.2 < dp[i+1][j]: dp[i+1][j] = v + 1.2; ch[i+1][j] = (i, j, 0)            # frontière sans pause
        if j < m and v + 1.5 < dp[i][j+1]: dp[i][j+1] = v + 1.5; ch[i][j+1] = (i, j, 1)            # pause sans frontière
        if i < n and j < m:
            mid = (inner[j][0] + inner[j][1]) / 2
            c = abs(B[i] - mid)
            if c < 3.5 and v + c < dp[i+1][j+1]: dp[i+1][j+1] = v + c; ch[i+1][j+1] = (i, j, 2)
i, j = n, m; ancre = {}
while (i, j) != (0, 0):
    pi, pj, k = ch[i][j]
    if k == 2: ancre[cand[pi]] = inner[pj]
    i, j = pi, pj
print('frontières', n, 'pauses', m, 'appariées', len(ancre), file=sys.stderr)
# reconstruire les temps : segments entre ancres, mots proportionnels
points = [(-1, (0.0, 0.0))] + sorted(ancre.items()) + [(len(words) - 1, (speech_end, speech_end))]
for (a, (_, debut)), (b, (fin, _)) in zip(points, points[1:]):
    seg = range(a + 1, b + 1)
    ls = sum(L[k] for k in seg); t = debut
    for k in seg:
        d = (fin - debut) * L[k] / ls
        words[k]['t'] = round(t, 3); words[k]['d'] = round(d, 3); t += d
sent = []
for si in range(len(SCRIPT)):
    ws = [w for w in words if w['si'] == si]
    sent.append({'t0': ws[0]['t'], 't1': round(ws[-1]['t'] + ws[-1]['d'], 3)})
json.dump({'duree_voix': speech_end, 'duree_fichier': dur, 'words': words, 'sent': sent}, open('minutage.json', 'w'), ensure_ascii=False)
for si, s in enumerate(sent): print(f"{s['t0']:6.2f} {SCRIPT[si][0][:60]}")
