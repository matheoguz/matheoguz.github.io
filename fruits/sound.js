// =============================================================================
// FruitStudio - Sons générés dans le navigateur (aucun fichier audio)
// Voix « bla-bla » façon jeu vidéo, musiques de fond et bruitages d'émotion.
// =============================================================================
(function () {
  'use strict';

  const MUSIC = {
    aucune: 'Aucune',
    joyeuse: 'Joyeuse 🎵',
    lofi: 'Lo-fi chill 🎧',
    fete: 'Fête 🎉',
    suspense: 'Suspense 😰',
    drame: 'Drame 😭',
  };

  // Hauteur de base de la voix bla-bla selon la voix choisie pour le personnage
  const BLA_BASE = { grave: 105, normal: 165, aigue: 245, 'tres-aigue': 350 };

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // numéro MIDI -> Hz

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  // ---------------------------------------------------------------------------
  // Instruments de base
  // ---------------------------------------------------------------------------
  function env(ctx, out, t, attack, hold, release, peak) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    g.connect(out);
    return g;
  }

  function osc(ctx, type, freq, t, dur, dest) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  function pluck(ctx, out, t, freq, vol) {
    const g = env(ctx, out, t, 0.005, 0.02, 0.35, vol);
    osc(ctx, 'triangle', freq, t, 0.4, g);
    const g2 = env(ctx, out, t, 0.005, 0.0, 0.12, vol * 0.4);
    osc(ctx, 'square', freq * 2, t, 0.15, g2);
  }

  function pad(ctx, out, t, freqs, dur, vol) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.4, dur * 0.3));
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    lp.connect(g);
    g.connect(out);
    freqs.forEach((f, i) => {
      const o = osc(ctx, 'sawtooth', f, t, dur, lp);
      o.detune.value = (i % 2 ? 6 : -6);
    });
  }

  function bass(ctx, out, t, freq, dur, vol) {
    const g = env(ctx, out, t, 0.01, dur * 0.6, dur * 0.35, vol);
    osc(ctx, 'triangle', freq, t, dur, g);
  }

  function kick(ctx, out, t, vol) {
    const g = env(ctx, out, t, 0.002, 0.02, 0.25, vol);
    const o = osc(ctx, 'sine', 150, t, 0.3, g);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  }

  let noiseBuf = null;
  function noise(ctx) {
    if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    const r = rng(1);
    for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
    return noiseBuf;
  }

  function hat(ctx, out, t, vol) {
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = env(ctx, out, t, 0.002, 0.0, 0.05, vol);
    src.connect(hp);
    hp.connect(g);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.1);
  }

  // ---------------------------------------------------------------------------
  // Musiques (boucles de 4 mesures)
  // ---------------------------------------------------------------------------
  const C4 = 60;
  const CHORDS = {
    pop: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], // Do Sol Lam Fa
    lofi: [[2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11], [9, 12, 16, 19]], // Rém7 Sol7 Do7M Lam7
    minor: [[9, 12, 16], [5, 9, 12], [0, 4, 7], [7, 11, 14]], // Lam Fa Do Sol
  };

  function scheduleMusic(jobs, ctx, out, style, t0, dur) {
    if (!MUSIC[style] || style === 'aucune') return;
    const bpm = { joyeuse: 118, lofi: 78, fete: 126, suspense: 96, drame: 68 }[style];
    if (!bpm) return;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const end = t0 + dur;
    for (let b = 0, tb = t0; tb < end; b++, tb += bar) {
      jobs.push({ t: tb, run: () => musicBar(ctx, out, style, b % 4, tb, beat, bar, end) });
    }
  }

  function musicBar(ctx, out, style, i, tb, beat, bar, end) {
    if (style === 'joyeuse') {
      const ch = CHORDS.pop[i];
      for (let k = 0; k < 8; k++) {
        const t = tb + k * beat / 2;
        if (t >= end) break;
        pluck(ctx, out, t, NOTE(C4 + 12 + ch[[0, 1, 2, 1, 0, 2, 1, 2][k]]), 0.16);
        if (k % 2 === 1) hat(ctx, out, t, 0.05);
      }
      for (let k = 0; k < 4; k++) bass(ctx, out, tb + k * beat, NOTE(C4 - 24 + ch[0]), beat * 0.9, 0.3);
    } else if (style === 'lofi') {
      const ch = CHORDS.lofi[i];
      pad(ctx, out, tb, ch.map((n) => NOTE(C4 + n)), bar, 0.06);
      kick(ctx, out, tb, 0.5);
      kick(ctx, out, tb + beat * 2.5, 0.4);
      for (let k = 0; k < 8; k++) hat(ctx, out, tb + k * beat / 2 + (k % 2 ? 0.03 : 0), k % 2 ? 0.025 : 0.04);
      bass(ctx, out, tb, NOTE(C4 - 24 + ch[0]), beat * 1.8, 0.28);
      pluck(ctx, out, tb + beat * 1.5, NOTE(C4 + 12 + ch[2]), 0.07);
    } else if (style === 'fete') {
      const ch = CHORDS.minor[i];
      for (let k = 0; k < 4; k++) {
        const t = tb + k * beat;
        kick(ctx, out, t, 0.7);
        hat(ctx, out, t + beat / 2, 0.07);
        bass(ctx, out, t + beat / 2, NOTE(C4 - 24 + ch[0]), beat * 0.45, 0.35);
      }
      [0, 1.5, 3].forEach((k) => ch.forEach((n) => pluck(ctx, out, tb + k * beat, NOTE(C4 + 12 + n), 0.07)));
    } else if (style === 'suspense') {
      for (let k = 0; k < 8; k++) bass(ctx, out, tb + k * beat / 2, NOTE(33 + (i === 3 && k > 3 ? 1 : 0)), beat * 0.35, 0.32);
      pad(ctx, out, tb, [NOTE(57), NOTE(60), NOTE(64 + (i % 2))], bar, 0.04);
      for (let k = 0; k < 4; k++) pluck(ctx, out, tb + k * beat, NOTE(93), 0.03);
    } else if (style === 'drame') {
      const ch = CHORDS.minor[i];
      pad(ctx, out, tb, ch.map((n) => NOTE(C4 + n)), bar, 0.07);
      bass(ctx, out, tb, NOTE(C4 - 24 + ch[0]), bar * 0.9, 0.25);
      [0, 1, 2, 3].forEach((k) => pluck(ctx, out, tb + k * beat, NOTE(C4 + 12 + ch[k % 3]), 0.08));
    }
  }

  // ---------------------------------------------------------------------------
  // Bruitages selon l'émotion (au début de la réplique)
  // ---------------------------------------------------------------------------
  function sfx(ctx, out, emotion, t) {
    switch (emotion) {
      case 'choque': // « dun dun duuun »
        [[0, 0.16, 50], [0.22, 0.16, 50], [0.44, 0.9, 46]].forEach(([dt, d, n]) => {
          const g = env(ctx, out, t + dt, 0.01, d, 0.25, 0.22);
          osc(ctx, 'sawtooth', NOTE(n), t + dt, d + 0.3, g);
          osc(ctx, 'sawtooth', NOTE(n + 12), t + dt, d + 0.3, g);
        });
        break;
      case 'fache': {
        kick(ctx, out, t, 0.9);
        const g = env(ctx, out, t, 0.02, 0.2, 0.3, 0.15);
        const o = osc(ctx, 'sawtooth', 70, t, 0.55, g);
        o.frequency.linearRampToValueAtTime(55, t + 0.5);
        break;
      }
      case 'amoureux':
        [72, 76, 79, 83, 84, 88].forEach((n, k) => pluck(ctx, out, t + k * 0.06, NOTE(n), 0.12));
        break;
      case 'triste': // trombone triste « wouah wouah wouaaah »
        [[0, 63], [0.35, 62], [0.7, 61], [1.05, 60]].forEach(([dt, n], k) => {
          const d = k === 3 ? 0.8 : 0.28;
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1200;
          const g = env(ctx, out, t + dt, 0.04, d, 0.15, 0.13);
          lp.connect(g);
          const o = osc(ctx, 'sawtooth', NOTE(n - 12), t + dt, d + 0.2, lp);
          if (k === 3) {
            const lfo = ctx.createOscillator();
            const lg = ctx.createGain();
            lfo.frequency.value = 6;
            lg.gain.value = 4;
            lfo.connect(lg);
            lg.connect(o.frequency);
            lfo.start(t + dt);
            lfo.stop(t + dt + d + 0.2);
          }
        });
        break;
      case 'content': {
        const g = env(ctx, out, t, 0.005, 0.03, 0.12, 0.2);
        const o = osc(ctx, 'sine', 400, t, 0.2, g);
        o.frequency.exponentialRampToValueAtTime(1300, t + 0.12);
        break;
      }
      case 'malin': { // sifflet qui monte et descend
        const g = env(ctx, out, t, 0.02, 0.4, 0.1, 0.08);
        const o = osc(ctx, 'sine', 700, t, 0.55, g);
        o.frequency.linearRampToValueAtTime(1500, t + 0.25);
        o.frequency.linearRampToValueAtTime(900, t + 0.5);
        break;
      }
      default:
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Voix « bla-bla » : une petite note par syllabe, calée sur les sous-titres
  // ---------------------------------------------------------------------------
  const FORMANTS = [650, 900, 1250, 1700, 2300];

  function babble(ctx, out, item, t0, voice) {
    const base = BLA_BASE[voice] || BLA_BASE.normal;
    const r = rng(hash(item.line.text + voice));
    item.words.forEach((w) => {
      const letters = w.w.replace(/[^\p{L}\p{N}]/gu, '');
      if (!letters) return;
      const syl = Math.max(1, Math.round(letters.length / 2.6));
      const step = (w.end - w.start) / syl;
      for (let k = 0; k < syl; k++) {
        const t = t0 + w.start + k * step;
        const d = Math.max(0.05, step * 0.72);
        const f = base * (0.88 + r() * 0.3) * (w.w.endsWith('?') && k === syl - 1 ? 1.25 : 1);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = FORMANTS[Math.floor(r() * FORMANTS.length)];
        bp.Q.value = 3;
        const g = env(ctx, out, t, 0.012, d * 0.55, d * 0.4, 0.5);
        bp.connect(g);
        const o = osc(ctx, 'sawtooth', f, t, d, bp);
        o.frequency.linearRampToValueAtTime(f * (0.9 + r() * 0.2), t + d);
        const body = env(ctx, out, t, 0.012, d * 0.55, d * 0.4, 0.12);
        osc(ctx, 'triangle', f, t, d, body);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Programme tous les sons d'une vidéo
  //   voiceOut : passe par l'analyseur (fait bouger la bouche)
  //   mixOut   : musique et bruitages (ne font pas bouger la bouche)
  // ---------------------------------------------------------------------------
  // Les notes sont créées au fur et à mesure (quelques secondes d'avance) :
  // tout créer d'un coup (des milliers de nœuds) fait ramer l'audio sur les longues vidéos.
  const LOOKAHEAD = 6;

  function schedule(ctx, voiceOut, mixOut, tl, t0, opts) {
    const jobs = [];
    const music = ctx.createGain();
    music.connect(mixOut);
    const full = 0.55, ducked = 0.28;
    music.gain.setValueAtTime(full, t0);
    tl.items.forEach((it) => {
      music.gain.setTargetAtTime(ducked, t0 + it.start - 0.05, 0.08);
      music.gain.setTargetAtTime(full, t0 + it.end + 0.1, 0.25);
    });
    scheduleMusic(jobs, ctx, music, opts.music, t0, tl.total);

    tl.items.forEach((it) => {
      const ch = opts.cast.find((c) => c.id === it.charId);
      if (!it.line.audio && opts.voiceMode === 'bla') jobs.push({ t: t0 + it.start, run: () => babble(ctx, voiceOut, it, t0, ch ? ch.voice : 'normal') });
      if (opts.sfx) jobs.push({ t: t0 + it.start - 0.05, run: () => sfx(ctx, mixOut, it.line.emotion, t0 + it.start - 0.05) });
    });
    if (opts.sfx && tl.end != null && tl.total > tl.end) jobs.push({ t: t0 + tl.end, run: () => sfx(ctx, mixOut, 'amoureux', t0 + tl.end) });

    jobs.sort((a, b) => a.t - b.t);
    let next = 0;
    let timer = null;
    const pump = () => {
      while (next < jobs.length && jobs[next].t < ctx.currentTime + LOOKAHEAD) jobs[next++].run();
      if (next >= jobs.length) clearInterval(timer);
    };
    pump();
    if (next < jobs.length) timer = setInterval(pump, 1000);
    return { stop() { clearInterval(timer); } };
  }

  window.FruitSound = { MUSIC, schedule, sfx };
})();
