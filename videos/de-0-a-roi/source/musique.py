# Beat trap / west coast façon GTA, composé par code (numpy seulement)
import numpy as np, json, wave, sys
SR = 44100
T = json.load(open(sys.argv[1]))
TOTAL = T[-1]['t0'] + T[-1]['d']
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
BPM = 140; B = 60 / BPM  # temps (trap en demi-temps)
t0 = {i: s['t0'] for i, s in enumerate(T)}
DROP = t0[1]; NUIT = t0[5]; ROUTE = t0[6]; GARAGE = t0[7]; VOTE = t0[12]
INTROS = [s['t0'] + .7 for s in T if s['intro']]

def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * g * (1 - max(0, pan))
    R[i:i + len(sig)] += sig * g * (1 + min(0, pan))

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** 4), len(x))

def highpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (1 - 1 / (1 + (f / fc) ** 4)), len(x))

def kick():
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * np.sin(ph) * env(n, .002, .18))

def k808(freq, dur=.9, glide=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.full(n, freq) if glide is None else freq + (glide - freq) * np.minimum(1, t / .12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.8 * np.sin(ph)) * env(n, .004, dur * .55)

def clap():
    n = int(.25 * SR); x = rng.standard_normal(n)
    x = highpass(x, 900) * (env(n, .001, .07) + .6 * np.concatenate([np.zeros(int(.012 * SR)), env(n - int(.012 * SR), .001, .05)]))
    return x * .7

def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); x = highpass(rng.standard_normal(n), 7000)
    return x * env(n, .0005, .06 if open_ else .015)

def nfreq(m): return 440 * 2 ** ((m - 69) / 12)

def pad(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for det in (-.12, 0, .12):
            f = nfreq(m + det); x += 2 * ((t * f) % 1) - 1
    x = lowpass(x / (len(notes) * 3), 1400)
    a = np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .4)
    return x * a

def bell(m, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = nfreq(m)
    return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t) + .2 * np.sin(2 * np.pi * f * 3.98 * t)) * env(n, .003, .35)

def riser(dur):
    n = int(dur * SR); x = highpass(rng.standard_normal(n), 2500); t = np.arange(n) / SR
    return x * (t / dur) ** 2.5 * .55

def impact():
    n = int(2.6 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 40 * np.exp(-t * 6)) * t) * env(n, .002, .9)
    crash = highpass(rng.standard_normal(n), 3000) * env(n, .001, .5) * .12
    return np.tanh(1.6 * boom) * .9 + crash

# grille d'accords : La mineur – Fa – Do – Mi (tension façon polar)
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59]]
BASS = [33, 29, 36, 28]
BAR = 4 * B
# 1) intro épique (le futur) : nappe + cloche
t = 0
while t < DROP:
    i = int(t / BAR) % 4; add(pad([m + 12 for m in CH[i]], BAR + .4), t, .6); t += BAR
for j, m in enumerate([69, 72, 76, 74, 72, 69, 67, 69]):
    add(bell(m), j * B, .35, pan=.3 if j % 2 else -.3)
add(riser(1.6), DROP - 1.6, .9)
add(impact(), DROP, .5)
# 2) le beat
t = DROP; k = 0
while t < VOTE - .01:
    bar = int((t - DROP) / BAR); i = bar % 4; pos = k % 16  # 16e de mesure en 8 croches doubles
    nuit = t >= NUIT; garage = t >= GARAGE; route = ROUTE <= t < GARAGE
    if pos == 0: add(pad(CH[i], BAR + .3), t, .38 if not nuit else .3)
    if pos in (0, 6, 10) or (route and pos == 14): add(kick(), t, .8)
    if pos in (0, 6) : add(k808(nfreq(BASS[i]), 1.1, nfreq(BASS[i] + (7 if pos == 6 and i == 3 else 0))), t, .55)
    if pos == 8: add(clap(), t, .55, pan=.05)
    if not garage or route:
        if pos % 2 == 0: add(hat(), t, .22, pan=.35)
        if bar % 2 == 1 and pos in (13, 15): [add(hat(), t + s * B / 6, .16, pan=.35) for s in range(3)]  # roulement
        if pos == 12 and bar % 4 == 3: add(hat(True), t, .15, pan=-.3)
    if garage and not route and pos in (4, 12): add(bell(81, .6), t, .05, pan=-.4)
    t += B / 2; k += 1
# 3) les présentations : montée + gros impact + petite mélodie
for ti in INTROS:
    add(riser(1.0), ti - 1.0, .5); add(impact(), ti, .5)
    for j, m in enumerate([76, 79, 81, 84]): add(bell(m, .9), ti + .15 + j * B / 2, .3, pan=-.2 + j * .13)
# 4) le vote : coupure, un coup, la nappe tient
add(impact(), VOTE, .45)
add(pad([57, 60, 64, 69], TOTAL - VOTE + .5), VOTE, .5)
# mixage
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
rms = np.sqrt(np.mean(mix ** 2)); mix = np.tanh(mix * (.2 / rms)); mix *= .9 / np.max(np.abs(mix))
fade = int(1.2 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', round(TOTAL, 2), 's')
