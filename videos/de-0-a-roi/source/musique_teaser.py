# Rock lent et chaud (guitare, basse, batterie feutrée) : original, ambiance bande-annonce
import numpy as np, wave, sys
SR = 44100; TOTAL = float(sys.argv[2]); N = int((TOTAL + 2) * SR)
L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(7)
BPM = 84; B = 60 / BPM; BAR = 4 * B
DRUMS = 3.4; INTROS = [21.8 + .5, 24.2 + .5]; LOGO = 29.8
def add(x, t, g=1, pan=0):
    i = int(t * SR)
    if i >= N: return
    x = x[:N - i]; L[i:i+len(x)] += x * g * (1 - max(0, pan)); R[i:i+len(x)] += x * g * (1 + min(0, pan))
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, fc): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR); return np.fft.irfft(X / (1 + (f/fc)**2), len(x))
def hp(x, fc): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR); return np.fft.irfft(X * (1 - 1/(1 + (f/fc)**2)), len(x))
def nf(m): return 440 * 2 ** ((m - 69) / 12)
def guitar(m, dur=2.0, bright=.5):  # Karplus-Strong
    p = int(SR / nf(m)); n = int(dur * SR); buf = rng.uniform(-1, 1, p); buf = lp(np.concatenate([buf, buf]), 2500 + 4000 * bright)[:p]
    out = np.zeros(n); d = .996
    for i in range(n):
        j = i % p; nxt = (j + 1) % p; out[i] = buf[j]; buf[j] = d * .5 * (buf[j] + buf[nxt])
    return out * env(n, .002, dur * .6)
def kick(): n = int(.5*SR); t = np.arange(n)/SR; ph = 2*np.pi*np.cumsum(50 + 60*np.exp(-t*30))/SR; return np.sin(ph) * env(n, .002, .22)
def snare(): n = int(.6*SR); x = hp(rng.standard_normal(n), 1200); body = np.sin(2*np.pi*190*np.arange(n)/SR) * env(n, .001, .05); return (x * env(n, .001, .16) + body) * .6
def hat(): n = int(.08*SR); return hp(rng.standard_normal(n), 7000) * env(n, .0005, .02)
def bass(m, dur): n = int(dur*SR); t = np.arange(n)/SR; f = nf(m); return lp(np.sin(2*np.pi*f*t) + .3*np.sin(4*np.pi*f*t), 600) * env(n, .01, dur*.7)
def organ(ms, dur):
    n = int(dur*SR); t = np.arange(n)/SR; x = sum(np.sin(2*np.pi*nf(m)*t) + .4*np.sin(4*np.pi*nf(m)*t) for m in ms)
    return x / len(ms) * np.minimum(1, t/.5) * np.minimum(1, np.maximum(0, (dur - t))/.5) * (1 + .15*np.sin(2*np.pi*5*t))
def impact(): n = int(3*SR); t = np.arange(n)/SR; return np.tanh(1.5*np.sin(2*np.pi*(40 + 35*np.exp(-t*5))*t) * env(n, .002, 1.0)) + hp(rng.standard_normal(n), 3000) * env(n, .001, .6) * .15
def riser(d): n = int(d*SR); t = np.arange(n)/SR; return hp(rng.standard_normal(n), 2500) * (t/d)**2.5 * .4
# Ré – Si mineur – Sol – La (grille douce)
CH = [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]]; BS = [38, 35, 31, 33]
t = 0; bar = 0
while t < LOGO - .01:
    i = bar % 4; c = CH[i]
    # guitare arpégée (croches)
    for k in range(8):
        tt = t + k * B / 2
        if tt >= LOGO: break
        m = c[[0, 1, 2, 3, 2, 1, 3, 2][k]] + (12 if bar % 2 and k in (3, 6) else 0)
        add(guitar(m, 1.6, .4), tt, .85, pan=-.35 + .1 * (k % 3))
    add(organ([m - 12 for m in c[:3]], BAR + .3), t, .10)
    if t >= DRUMS - .01:
        add(bass(BS[i], BAR * .9), t, .5); add(bass(BS[i] + 7, B * .9), t + 3 * B, .3)
        for k in range(4): add(kick() if k in (0, 2) else snare(), t + k * B, .6 if k in (0, 2) else .45)
        for k in range(8): add(hat(), t + k * B / 2, .12 if k % 2 else .18, pan=.4)
    t += BAR; bar += 1
add(riser(1.4), DRUMS - 1.4, .7)
for ti in INTROS: add(impact(), ti, .45)
add(riser(1.8), LOGO - 1.8, .9); add(impact(), LOGO, .8)
for m in [50, 62, 66, 69, 74]: add(guitar(m, 4.0, .7), LOGO + .02 * (m % 5), .4, pan=(m % 3 - 1) * .3)
add(organ([50, 57, 62, 66], TOTAL - LOGO + .5), LOGO, .2)
mix = np.stack([L, R], 1)[:int(TOTAL*SR)]
# petit écho de salle
d = int(.11*SR); mix[d:] += mix[:-d] * .18
rms = np.sqrt(np.mean(mix**2)); mix = np.tanh(mix * (.18/rms)); mix *= .9/np.max(np.abs(mix))
f = int(1.0*SR); mix[-f:] *= np.linspace(1, 0, f)[:, None]
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes()); w.close(); print('ok')
