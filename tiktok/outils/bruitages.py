"""Fabrique la piste de bruitages (synthétisés, libres de droits) à partir de la liste d'événements de l'épisode.
Usage : python3 bruitages.py evenements.json duree_s sortie.wav"""
import json, sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.1):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e

def ton(f, d, a=0.004, r=0.08, forme="sin"):
    n = int(d * SR); t = np.arange(n) / SR
    f = np.broadcast_to(f, (n,)) if np.ndim(f) else np.full(n, f)
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = np.sin(ph) if forme == "sin" else np.sign(np.sin(ph)) * 0.6
    return w * env(n, a, r)

def bruit(d, couleur=0.0):
    n = int(d * SR); b = rng.standard_normal(n)
    if couleur:  # bruit plus sourd (filtre passe-bas simple)
        for _ in range(int(couleur)):
            b = np.convolve(b, np.ones(6) / 6, mode="same")
    return b / (np.abs(b).max() + 1e-9)

def passe_bande(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))

def whoosh():
    d = 0.42; n = int(d * SR); t = np.arange(n) / SR
    b = bruit(d)
    out = np.zeros(n)
    # balayage de filtre : on mélange des bandes
    for k, (lo, hi) in enumerate([(300, 900), (700, 1800), (1500, 3500), (900, 2200)]):
        seg = passe_bande(b, lo, hi)
        w = np.exp(-((t - d * (0.25 + 0.18 * k)) / 0.09) ** 2)
        out += seg * w
    return out / (np.abs(out).max() + 1e-9) * 0.55

def pop():
    d = 0.09; n = int(d * SR); t = np.arange(n) / SR
    f = 900 * np.exp(-t * 30) + 380
    return ton(f, d, 0.001, 0.03) * 0.7

def bulle():
    d = 0.12; n = int(d * SR); t = np.arange(n) / SR
    return ton(500 + 1600 * t / d, d, 0.002, 0.05) * 0.5

def kaching():
    d = 0.75
    s = np.zeros(int(d * SR))
    c = bruit(0.06) * env(int(0.06 * SR), 0.001, 0.015) * 0.6  # « ka » métallique
    s[: len(c)] += passe_bande(c, 2000, 7000) * 3
    o = int(0.07 * SR)
    for f, g in [(2093, 0.5), (2637, 0.35), (3136, 0.25), (4186, 0.15)]:
        tn = ton(f, d - 0.07, 0.002, 0.25); s[o : o + len(tn)] += tn * g
    return s / (np.abs(s).max() + 1e-9) * 0.6

def ding():
    d = 0.9; s = np.zeros(int(d * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568]):
        o = int(i * 0.07 * SR); tn = ton(f, d - i * 0.07, 0.003, 0.22) * (0.5 - i * 0.08)
        s[o : o + len(tn)] += tn
    return s * 0.7

def coche():
    return ton(1760, 0.12, 0.001, 0.04) * 0.4 + ton(2640, 0.12, 0.001, 0.03) * 0.2

def tampon():
    d = 0.35; n = int(d * SR); t = np.arange(n) / SR
    choc = ton(110 * np.exp(-t * 8) + 50, d, 0.001, 0.08)
    clac = bruit(d, 1) * env(n, 0.0005, 0.02)
    return (choc * 0.9 + clac * 0.5) * 0.8

def wouf():
    # « wouf » de dessin animé : deux aboiements courts (fondamentale qui descend + souffle)
    s = np.zeros(int(0.55 * SR))
    for o in (0.0, 0.24):
        d = 0.17; n = int(d * SR); t = np.arange(n) / SR
        f0 = 420 * np.exp(-t * 6) + 180
        voix = ton(f0, d, 0.004, 0.07, "carre")
        souffle = passe_bande(bruit(d), 400, 2500) * env(n, 0.002, 0.05) * 0.5
        x = passe_bande(voix + souffle, 250, 3200)
        i = int(o * SR); s[i : i + n] += x
    return s / (np.abs(s).max() + 1e-9) * 0.6

def eau(d):
    d = max(0.5, min(d, 4)); n = int(d * SR)
    b = passe_bande(bruit(d), 1500, 7000)
    t = np.arange(n) / SR
    e = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.4)
    goutte = 0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2
    return b * e * goutte * 0.18

def moteur(d):
    d = max(0.5, min(d, 5)); n = int(d * SR); t = np.arange(n) / SR
    f = 95 + 15 * np.sin(2 * np.pi * 3 * t)
    m = ton(f, d, 0.05, 99, "carre") + ton(f * 2, d, 0.05, 99, "carre") * 0.4
    m = passe_bande(m + bruit(d) * 0.3, 80, 2500)
    e = np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3)
    return m / (np.abs(m).max() + 1e-9) * e * 0.22

def fin():
    s = np.zeros(int(1.2 * SR))
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        o = int(i * 0.11 * SR); tn = ton(f, 1.2 - i * 0.11, 0.004, 0.35 if i == 3 else 0.12) * 0.35
        s[o : o + len(tn)] += tn
    return s

SONS = {"whoosh": whoosh, "pop": pop, "bulle": bulle, "kaching": kaching, "ding": ding, "coche": coche, "tampon": tampon, "wouf": wouf, "fin": fin}

def main():
    evts = json.load(open(sys.argv[1])); duree = float(sys.argv[2]); sortie = sys.argv[3]
    piste = np.zeros(int((duree + 2) * SR))
    for e in evts:
        if e["type"] in ("eau", "moteur"):
            x = (eau if e["type"] == "eau" else moteur)(e["d"])
        else:
            x = SONS[e["type"]]()
        i = int(e["t"] * SR); j = min(len(piste), i + len(x))
        piste[i:j] += x[: j - i]
    piste = np.tanh(piste * 1.1) * 0.9
    pcm = (piste[: int(duree * SR)] * 32767).astype(np.int16)
    with wave.open(sortie, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("bruitages :", len(evts), "événements")

main()
