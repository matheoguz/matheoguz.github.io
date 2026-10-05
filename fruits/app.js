// =============================================================================
// FruitStudio - Interface (Studio gratuit + mode IA)
// =============================================================================
(function () {
  'use strict';

  const CFG = window.FRUIT_CONFIG || {};
  const E = window.FruitEngine;
  const $ = (s, el) => (el || document).querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 9);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const VOICE_FX = { normal: 'Voix normale', aigue: 'Aiguë', 'tres-aigue': 'Très aiguë (hélium)', grave: 'Grave' };
  const MAX_CHARS = 3;

  // ---------------------------------------------------------------------------
  // Scripts prêts à l'emploi
  // ---------------------------------------------------------------------------
  const TEMPLATES = [
    {
      title: '💔 La banane trompée',
      cast: [['banane', 'Bernard', 'grave'], ['fraise', 'Fraisy', 'aigue'], ['pomme', 'Paulo', 'normal']],
      bg: 'cuisine',
      lines: [
        [1, 'Bernard… faut qu\'on parle.', 'triste'],
        [0, 'Quoi encore ? Je suis en train de mûrir là.', 'neutre'],
        [1, 'Je t\'ai vu hier soir dans le saladier… avec Paulo.', 'fache'],
        [2, 'Attends attends, c\'est pas ce que tu crois !', 'choque'],
        [0, 'On faisait juste une salade de fruits entre potes !', 'choque'],
        [1, 'Une salade de fruits ?! Sans moi ?!', 'fache'],
        [2, 'Bon… on se retrouve au mixeur alors.', 'malin'],
      ],
    },
    {
      title: '🍅 Tomate = fruit ?',
      cast: [['tomate', 'Tom', 'normal'], ['citron', 'Citronnelle', 'aigue']],
      bg: 'marche',
      lines: [
        [1, 'Excuse-moi mais t\'as rien à faire au rayon fruits toi.', 'malin'],
        [0, 'Je suis un fruit ! J\'ai des pépins ! Renseigne-toi !', 'fache'],
        [1, 'Alors pourquoi on te met dans la ratatouille ?', 'malin'],
        [0, '…', 'triste'],
        [0, 'Je vais appeler mon avocat.', 'fache'],
      ],
    },
    {
      title: '🥑 L\'avocat philosophe',
      cast: [['avocat', 'Maître Avocat', 'grave']],
      bg: 'nuit',
      lines: [
        [0, 'Tu sais ce qui est triste quand on est un avocat ?', 'triste'],
        [0, 'On est pas mûr… pas mûr… pas mûr…', 'neutre'],
        [0, 'Et d\'un coup c\'est trop tard. On est tout marron.', 'choque'],
        [0, 'Profite de ta vie frérot. Abonne-toi.', 'content'],
      ],
    },
    {
      title: '🏖️ Pastèque en vacances',
      cast: [['pasteque', 'Pastèque', 'normal'], ['ananas', 'Ananas', 'grave']],
      bg: 'plage',
      lines: [
        [0, 'Ahhh les vacances, enfin au soleil !', 'content'],
        [1, 'Fais gaffe frère, à cette chaleur tu vas finir en jus.', 'malin'],
        [0, 'Dit celui qui porte une couronne à la plage.', 'malin'],
        [1, 'Je suis le roi des fruits. Respect.', 'fache'],
        [0, 'Le roi des pizzas qui se sont trompées oui.', 'content'],
      ],
    },
    {
      title: '❤️ Coup de foudre',
      cast: [['peche', 'Pêchou', 'aigue'], ['orange', 'Orangina', 'normal']],
      bg: 'studio',
      lines: [
        [1, 'Euh… salut. Tu viens souvent dans ce panier ?', 'amoureux'],
        [0, 'Seulement le mardi. C\'est jour de marché.', 'amoureux'],
        [1, 'T\'es tellement belle… t\'as une peau de pêche.', 'amoureux'],
        [0, 'Normal. Je suis une pêche.', 'neutre'],
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // État du projet
  // ---------------------------------------------------------------------------
  let project;
  const audioStore = {}; // lineId -> { buffer, blob }

  function fromTemplate(tp) {
    const cast = tp.cast.map(([fruit, name, voice]) => ({ id: uid(), fruit, name, voice }));
    return {
      cast,
      lines: tp.lines.map(([ci, text, emotion]) => ({ id: uid(), charId: cast[ci].id, text, emotion })),
      background: tp.bg,
      camera: 'all',
      captions: true,
    };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('fs_project') || 'null');
      if (saved && saved.cast && saved.cast.length) return saved;
    } catch (e) { /* stockage indisponible */ }
    return fromTemplate(TEMPLATES[0]);
  }

  function save() {
    try { localStorage.setItem('fs_project', JSON.stringify(project)); } catch (e) { /* ignore */ }
  }

  function projectForRender() {
    return Object.assign({}, project, {
      lines: project.lines.map((l) => Object.assign({}, l, { audio: audioStore[l.id] ? audioStore[l.id].buffer : null })),
    });
  }

  // ---------------------------------------------------------------------------
  // Interface : personnages
  // ---------------------------------------------------------------------------
  function fruitOptions(sel) {
    return Object.entries(E.FRUITS).map(([k, f]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${f.emoji} ${f.label}</option>`).join('');
  }

  function renderCast() {
    const box = $('#castList');
    box.innerHTML = project.cast.map((c) => `
      <div class="row cast-row" data-id="${c.id}">
        <select data-k="fruit">${fruitOptions(c.fruit)}</select>
        <input type="text" data-k="name" value="${esc(c.name)}" maxlength="20" placeholder="Nom">
        <select data-k="voice">${Object.entries(VOICE_FX).map(([k, v]) => `<option value="${k}" ${k === c.voice ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="icon-btn" data-act="del" title="Supprimer" ${project.cast.length < 2 ? 'disabled' : ''}>🗑</button>
      </div>`).join('');
    $('#addChar').disabled = project.cast.length >= MAX_CHARS;
  }

  $('#castList').addEventListener('input', (e) => {
    const row = e.target.closest('[data-id]');
    const k = e.target.dataset.k;
    if (!row || !k) return;
    const c = project.cast.find((x) => x.id === row.dataset.id);
    c[k] = e.target.value;
    if (k === 'fruit' && !c.nameEdited) {
      c.name = E.FRUITS[c.fruit].label;
      row.querySelector('[data-k=name]').value = c.name;
    }
    if (k === 'name') c.nameEdited = true;
    save();
    renderLines();
  });

  $('#castList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act=del]');
    if (!b || project.cast.length < 2) return;
    const id = b.closest('[data-id]').dataset.id;
    project.cast = project.cast.filter((c) => c.id !== id);
    project.lines.forEach((l) => { if (l.charId === id) l.charId = project.cast[0].id; });
    save();
    renderAll();
  });

  $('#addChar').addEventListener('click', () => {
    if (project.cast.length >= MAX_CHARS) return;
    const used = project.cast.map((c) => c.fruit);
    const fruit = Object.keys(E.FRUITS).find((k) => !used.includes(k)) || 'pomme';
    project.cast.push({ id: uid(), fruit, name: E.FRUITS[fruit].label, voice: 'normal' });
    save();
    renderAll();
  });

  // ---------------------------------------------------------------------------
  // Interface : dialogue
  // ---------------------------------------------------------------------------
  function renderLines() {
    const box = $('#lineList');
    box.innerHTML = project.lines.map((l, i) => {
      const has = !!audioStore[l.id];
      return `
      <div class="line" data-id="${l.id}">
        <div class="row">
          <span class="line-num">${i + 1}</span>
          <select data-k="charId">${project.cast.map((c) => `<option value="${c.id}" ${c.id === l.charId ? 'selected' : ''}>${E.FRUITS[c.fruit].emoji} ${esc(c.name)}</option>`).join('')}</select>
          <select data-k="emotion">${Object.entries(E.EMOTIONS).map(([k, v]) => `<option value="${k}" ${k === l.emotion ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <button class="icon-btn rec ${has ? 'has' : ''}" data-act="rec" title="${has ? 'Réenregistrer ma voix' : 'Enregistrer ma voix'}">🎙️</button>
          ${has ? '<button class="icon-btn" data-act="listen" title="Écouter">🔊</button><button class="icon-btn" data-act="unrec" title="Supprimer l\'enregistrement">✖</button>' : ''}
          <button class="icon-btn" data-act="del" title="Supprimer la réplique">🗑</button>
        </div>
        <textarea data-k="text" rows="2" maxlength="200" placeholder="Ce que dit le fruit…">${esc(l.text)}</textarea>
      </div>`;
    }).join('');
    updateDuration();
  }

  $('#lineList').addEventListener('input', (e) => {
    const box = e.target.closest('[data-id]');
    const k = e.target.dataset.k;
    if (!box || !k) return;
    const l = project.lines.find((x) => x.id === box.dataset.id);
    l[k] = e.target.value;
    save();
    updateDuration();
  });

  $('#lineList').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('[data-id]').dataset.id;
    const act = b.dataset.act;
    if (act === 'del') {
      project.lines = project.lines.filter((l) => l.id !== id);
      delete audioStore[id];
      save();
      renderLines();
    } else if (act === 'rec') {
      toggleRecord(id, b);
    } else if (act === 'unrec') {
      delete audioStore[id];
      renderLines();
    } else if (act === 'listen') {
      playClip(id);
    }
  });

  $('#addLine').addEventListener('click', () => {
    const last = project.lines[project.lines.length - 1];
    const nextChar = last ? project.cast[(project.cast.findIndex((c) => c.id === last.charId) + 1) % project.cast.length] : project.cast[0];
    project.lines.push({ id: uid(), charId: nextChar.id, text: '', emotion: 'neutre' });
    save();
    renderLines();
    const tas = document.querySelectorAll('#lineList textarea');
    tas[tas.length - 1].focus();
  });

  function updateDuration() {
    const tl = E.buildTimeline(projectForRender());
    const recs = project.lines.filter((l) => audioStore[l.id]).length;
    $('#durationHint').textContent = `Durée : ${tl.total.toFixed(1)} s · ${project.lines.length} réplique(s) · ${recs} avec ta voix`;
  }

  // ---------------------------------------------------------------------------
  // Décor / options
  // ---------------------------------------------------------------------------
  let bgImage = null;
  const bgSel = $('#bgSelect');
  function renderOptions() {
    bgSel.innerHTML = Object.entries(E.BACKGROUNDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('') +
      (bgImage ? '<option value="perso">Ma photo</option>' : '');
    bgSel.value = project.background === 'perso' && !bgImage ? 'cuisine' : project.background;
    $('#camSelect').value = project.camera;
    $('#captionsToggle').checked = project.captions !== false;
  }
  bgSel.addEventListener('change', () => { project.background = bgSel.value; save(); });
  $('#camSelect').addEventListener('change', (e) => { project.camera = e.target.value; save(); });
  $('#captionsToggle').addEventListener('change', (e) => { project.captions = e.target.checked; save(); });
  $('#bgUpload').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      bgImage = img;
      project.background = 'perso';
      renderOptions();
    };
    img.src = URL.createObjectURL(f);
  });

  $('#templates').innerHTML = TEMPLATES.map((t, i) => `<button class="chip" data-i="${i}">${t.title}</button>`).join('');
  $('#templates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    if (project.lines.some((l) => l.text.trim()) && !confirm('Remplacer ton dialogue actuel par ce script ?')) return;
    stopPlayback();
    Object.keys(audioStore).forEach((k) => delete audioStore[k]);
    project = fromTemplate(TEMPLATES[+b.dataset.i]);
    save();
    renderAll();
  });

  function renderAll() {
    renderCast();
    renderLines();
    renderOptions();
  }

  // ---------------------------------------------------------------------------
  // Audio : enregistrement micro + lecture
  // ---------------------------------------------------------------------------
  let actx = null;
  function audioCtx() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  let recorder = null;
  async function toggleRecord(lineId, btn) {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      alert('Impossible d\'accéder au micro. Autorise le micro dans ton navigateur puis réessaie.');
      return;
    }
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType });
      recorder = null;
      try {
        const buf = await audioCtx().decodeAudioData(await blob.arrayBuffer());
        audioStore[lineId] = { buffer: trimSilence(buf), blob };
      } catch (err) {
        alert('L\'enregistrement n\'a pas pu être lu. Réessaie.');
      }
      renderLines();
    };
    recorder.start();
    btn.classList.add('on');
    btn.textContent = '⏹';
    btn.title = 'Arrêter';
  }

  // Coupe les blancs au début et à la fin de l'enregistrement.
  function trimSilence(buf) {
    const data = buf.getChannelData(0);
    const thr = 0.02;
    let s = 0, e = data.length - 1;
    while (s < e && Math.abs(data[s]) < thr) s++;
    while (e > s && Math.abs(data[e]) < thr) e--;
    const pad = Math.floor(buf.sampleRate * 0.08);
    s = Math.max(0, s - pad);
    e = Math.min(data.length, e + pad);
    if (e - s < buf.sampleRate * 0.2) return buf;
    const out = audioCtx().createBuffer(buf.numberOfChannels, e - s, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) out.copyToChannel(buf.getChannelData(c).subarray(s, e), c);
    return out;
  }

  function rateOf(charId) {
    const ch = project.cast.find((c) => c.id === charId);
    return E.RATES[ch && ch.voice] || 1;
  }

  function playClip(lineId) {
    const a = audioStore[lineId];
    const l = project.lines.find((x) => x.id === lineId);
    if (!a || !l) return;
    const ctx = audioCtx();
    const src = ctx.createBufferSource();
    src.buffer = a.buffer;
    src.playbackRate.value = rateOf(l.charId);
    src.connect(ctx.destination);
    src.start();
  }

  // ---------------------------------------------------------------------------
  // Lecture (aperçu) et export vidéo
  // ---------------------------------------------------------------------------
  const canvas = $('#stage');
  const g = canvas.getContext('2d');
  let mode = 'idle'; // idle | play | export
  let session = null;

  function startSession(dest) {
    const ctx = audioCtx();
    const proj = projectForRender();
    const tl = E.buildTimeline(proj);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.connect(dest);
    const t0 = ctx.currentTime + 0.15;
    const sources = [];
    const timers = [];
    tl.items.forEach((it) => {
      if (it.line.audio) {
        const src = ctx.createBufferSource();
        src.buffer = it.line.audio;
        src.playbackRate.value = it.rate;
        src.connect(analyser);
        src.start(t0 + it.start);
        sources.push(src);
      } else if (mode === 'play' && $('#ttsPreview').checked && 'speechSynthesis' in window && it.line.text.trim()) {
        timers.push(setTimeout(() => speak(it.line.text, it.rate), (it.start + 0.15) * 1000));
      }
    });
    return { ctx, proj, tl, analyser, t0, sources, timers, level: 0, buf: new Float32Array(analyser.fftSize) };
  }

  function speak(text, rate) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.pitch = Math.min(2, Math.max(0.1, rate * rate));
    u.rate = 1.1;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith('fr'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function sessionTime() {
    return session.ctx.currentTime - session.t0;
  }

  function sessionLevel() {
    session.analyser.getFloatTimeDomainData(session.buf);
    let sum = 0;
    for (let i = 0; i < session.buf.length; i++) sum += session.buf[i] * session.buf[i];
    const rms = Math.sqrt(sum / session.buf.length);
    const target = Math.min(1, Math.max(0, (rms - 0.012) * 9));
    session.level = target > session.level ? target : session.level * 0.7 + target * 0.3;
    return session.level;
  }

  function endSession() {
    if (!session) return;
    session.sources.forEach((s) => { try { s.stop(); } catch (e) { /* déjà arrêté */ } });
    session.timers.forEach(clearTimeout);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    session = null;
  }

  function stopPlayback() {
    if (mode === 'play') {
      endSession();
      mode = 'idle';
      $('#playBtn').textContent = '▶ Aperçu';
    }
  }

  $('#playBtn').addEventListener('click', () => {
    if (mode === 'play') return stopPlayback();
    if (mode !== 'idle') return;
    if (!project.lines.some((l) => l.text.trim() || audioStore[l.id])) return alert('Écris au moins une réplique !');
    mode = 'play';
    session = startSession(audioCtx().destination);
    $('#playBtn').textContent = '⏹ Stop';
  });

  // Boucle de rendu unique
  const idleTl = { items: [], total: 0 };
  function loop() {
    if ((mode === 'play' || mode === 'export') && session) {
      const t = sessionTime();
      E.renderFrame(g, session.proj, session.tl, Math.max(0, t), {
        level: sessionLevel(),
        bgImage,
        watermark: CFG.WATERMARK,
      });
      if (mode === 'export') $('#exportBar').style.width = Math.min(100, (t / session.tl.total) * 100) + '%';
      if (t > session.tl.total) {
        if (mode === 'play') stopPlayback();
        else if (mode === 'export') finishExport();
      }
    } else if (mode === 'idle') {
      E.renderFrame(g, project, idleTl, performance.now() / 1000, { bgImage, watermark: CFG.WATERMARK });
    }
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------------------
  // Export MP4 / WebM
  // ---------------------------------------------------------------------------
  let rec = null, recChunks = [], recMime = '';

  function pickMime() {
    const list = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return list.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
  }

  $('#exportBtn').addEventListener('click', async () => {
    if (mode !== 'idle') stopPlayback();
    if (mode !== 'idle') return;
    if (!project.lines.some((l) => l.text.trim() || audioStore[l.id])) return alert('Écris au moins une réplique !');
    if (!window.MediaRecorder || !canvas.captureStream) {
      return alert('Ton navigateur ne permet pas de créer la vidéo. Essaie avec Chrome, Edge ou Safari à jour.');
    }
    try { await document.fonts.load('800 64px "Baloo 2"'); } catch (e) { /* police de secours */ }
    const ctx = audioCtx();
    const dest = ctx.createMediaStreamDestination();
    mode = 'export';
    session = startSession(dest);
    const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    recMime = pickMime();
    recChunks = [];
    rec = new MediaRecorder(stream, recMime ? { mimeType: recMime, videoBitsPerSecond: 6e6 } : undefined);
    rec.ondataavailable = (ev) => ev.data.size && recChunks.push(ev.data);
    rec.onstop = onExportDone;
    rec.start(250);
    showOverlay('progress');
  });

  function finishExport() {
    endSession();
    mode = 'saving';
    if (rec && rec.state !== 'inactive') rec.stop();
  }

  function onExportDone() {
    const type = (rec && rec.mimeType) || recMime || 'video/webm';
    const blob = new Blob(recChunks, { type: type.split(';')[0] });
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const file = new File([blob], `fruitstudio-${Date.now()}.${ext}`, { type: blob.type });
    rec = null;
    mode = 'idle';
    showOverlay('done', file);
  }

  function showOverlay(state, file) {
    const ov = $('#exportOverlay');
    ov.hidden = false;
    if (state === 'progress') {
      ov.innerHTML = `<div class="spinner"></div><p>Création de la vidéo…</p><div class="bar"><div id="exportBar"></div></div><small>Laisse cet onglet ouvert</small><div class="ad-wrap small" data-ad-lazy></div>`;
      fillAds(ov);
      return;
    }
    const url = URL.createObjectURL(file);
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    ov.innerHTML = `<p style="font-size:1.4rem">✅ Vidéo prête !</p>
      <a class="btn primary" href="${url}" download="${file.name}">⬇ Télécharger</a>
      ${canShare ? '<button class="btn" id="shareBtn">📲 Partager (TikTok…)</button>' : ''}
      ${file.name.endsWith('.webm') ? '<small>Format WebM : si ton téléphone ne la lit pas, ouvre le site avec Safari ou Chrome récent pour avoir du MP4.</small>' : ''}
      <button class="btn small" id="closeOv">Fermer</button>`;
    $('#closeOv').onclick = () => { ov.hidden = true; URL.revokeObjectURL(url); };
    if (canShare) $('#shareBtn').onclick = () => navigator.share({ files: [file], title: 'Ma vidéo FruitStudio' }).catch(() => {});
  }

  // ---------------------------------------------------------------------------
  // Publicité (Google AdSense)
  // ---------------------------------------------------------------------------
  function loadAdsense() {
    if (!CFG.ADSENSE_CLIENT || document.querySelector('script[data-adsense]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.dataset.adsense = '1';
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(CFG.ADSENSE_CLIENT);
    document.head.appendChild(s);
  }

  function fillAds(root) {
    if (!CFG.ADSENSE_CLIENT || !CFG.ADSENSE_SLOT) return;
    loadAdsense();
    (root || document).querySelectorAll('[data-ad], [data-ad-lazy]').forEach((el) => {
      if (el.dataset.filled || el.offsetParent === null) return;
      el.dataset.filled = '1';
      el.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(CFG.ADSENSE_CLIENT)}" data-ad-slot="${esc(CFG.ADSENSE_SLOT)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* bloqueur de pub */ }
    });
  }

  // ---------------------------------------------------------------------------
  // Onglets
  // ---------------------------------------------------------------------------
  function showTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    $('#tab-studio').hidden = name !== 'studio';
    $('#tab-ia').hidden = name !== 'ia';
    if (name === 'ia') IA.open();
    else stopPlayback();
    fillAds();
  }
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
    history.replaceState(null, '', t.dataset.tab === 'ia' ? '#ia' : '#');
    showTab(t.dataset.tab);
  }));

  if (CFG.TIKTOK_HANDLE) {
    const a = $('#tiktokLink');
    a.href = 'https://www.tiktok.com/@' + encodeURIComponent(CFG.TIKTOK_HANDLE.replace(/^@/, ''));
    a.textContent = '@' + CFG.TIKTOK_HANDLE.replace(/^@/, '');
    a.hidden = false;
  }

  // ===========================================================================
  // MODE IA (serveur fruits-api)
  // ===========================================================================
  const IA = (function () {
    const API = (CFG.API_BASE || '').replace(/\/$/, '');
    const VOICES = [
      ['Aria', 'Aria — femme, expressive'],
      ['Charlotte', 'Charlotte — femme, douce'],
      ['Laura', 'Laura — femme, pétillante'],
      ['Jessica', 'Jessica — jeune femme'],
      ['Lily', 'Lily — femme, posée'],
      ['Charlie', 'Charlie — homme, jeune'],
      ['Liam', 'Liam — jeune homme'],
      ['George', 'George — homme, grave'],
      ['Brian', 'Brian — homme, profond'],
      ['Bill', 'Bill — homme âgé'],
    ];
    let opened = false;
    let fruit = 'fraise';
    let user = null;
    let polling = null;

    function getUser() {
      let u = null;
      try { u = localStorage.getItem('fs_uid'); } catch (e) { /* ignore */ }
      if (!u || !/^[A-Za-z0-9_-]{16,64}$/.test(u)) {
        const a = new Uint8Array(16);
        crypto.getRandomValues(a);
        u = Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
        try { localStorage.setItem('fs_uid', u); } catch (e) { /* ignore */ }
      }
      return u;
    }

    async function api(path, opts) {
      const r = await fetch(API + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(j.error || 'Erreur serveur'), { status: r.status });
      return j;
    }

    async function refreshCredits() {
      try {
        const j = await api('/api/credits?user=' + user);
        $('#creditCount').textContent = j.credits;
        renderPacks(j.packs || []);
        return j.credits;
      } catch (e) {
        $('#creditCount').textContent = '?';
        return null;
      }
    }

    function renderPacks(packs) {
      $('#packs').innerHTML = packs.map((p, i) => `
        <button class="pack ${i === 1 ? 'best' : ''}" data-pack="${esc(p.id)}">
          <b>${p.credits} vidéos</b><small>${(p.price / 100).toFixed(2).replace('.', ',')} €</small>
        </button>`).join('');
    }

    function setup() {
      user = getUser();
      $('#userCode').textContent = user;
      $('#iaFruits').innerHTML = Object.entries(E.FRUITS).map(([k, f]) => `<button data-f="${k}" title="${f.label}" class="${k === fruit ? 'sel' : ''}">${f.emoji}</button>`).join('') +
        '<button data-f="autre" title="Autre">✏️</button>';
      $('#iaVoice').innerHTML = VOICES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
      $('#iaFruits').addEventListener('click', (e) => {
        const b = e.target.closest('[data-f]');
        if (!b) return;
        fruit = b.dataset.f;
        document.querySelectorAll('#iaFruits button').forEach((x) => x.classList.toggle('sel', x === b));
        $('#iaCustomWrap').hidden = fruit !== 'autre';
      });
      $('#iaText').addEventListener('input', (e) => { $('#iaCount').textContent = e.target.value.length; });
      $('#packs').addEventListener('click', buy);
      $('#iaGo').addEventListener('click', generate);
      $('#restoreBtn').addEventListener('click', () => {
        const v = $('#restoreInput').value.trim();
        if (!/^[A-Za-z0-9_-]{16,64}$/.test(v)) return alert('Code invalide.');
        try { localStorage.setItem('fs_uid', v); } catch (e) { /* ignore */ }
        user = v;
        $('#userCode').textContent = v;
        refreshCredits();
        alert('Code restauré ✅');
      });
      renderHistory();
      const pending = readJson('fs_pending');
      if (pending && pending.job) watch(pending.job, pending.image);
    }

    async function buy(e) {
      const b = e.target.closest('[data-pack]');
      if (!b) return;
      b.disabled = true;
      try {
        const j = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ user, pack: b.dataset.pack }) });
        location.href = j.url;
      } catch (err) {
        alert('Le paiement n\'a pas pu démarrer : ' + err.message);
        b.disabled = false;
      }
    }

    async function generate() {
      const text = $('#iaText').value.trim();
      if (text.length < 3) return alert('Écris ce que le fruit doit dire.');
      if (fruit === 'autre' && !$('#iaCustom').value.trim()) return alert('Décris ton personnage.');
      const btn = $('#iaGo');
      btn.disabled = true;
      showStatus('⏳ Création du personnage et de la voix…');
      try {
        const j = await api('/api/generate', {
          method: 'POST',
          body: JSON.stringify({
            user, text, fruit,
            custom: fruit === 'autre' ? $('#iaCustom').value.trim() : '',
            style: $('#iaStyle').value,
            voice: $('#iaVoice').value,
            scene: $('#iaScene').value.trim(),
          }),
        });
        writeJson('fs_pending', { job: j.job, image: j.image, text });
        refreshCredits();
        watch(j.job, j.image);
      } catch (err) {
        if (err.status === 402) showStatus('😕 Plus de crédits. Choisis un pack ci-dessus pour continuer.');
        else showStatus('❌ ' + err.message);
        btn.disabled = false;
      }
    }

    function showStatus(msg) {
      $('#iaResult').hidden = false;
      $('#iaStatus').textContent = msg;
    }

    function watch(job, image) {
      clearInterval(polling);
      $('#iaGo').disabled = true;
      $('#iaVideo').hidden = true;
      $('#iaDownload').hidden = true;
      if (image) {
        $('#iaImage').src = image;
        $('#iaImage').hidden = false;
      }
      showStatus('🎬 Animation de la bouche en cours… (2 à 5 min, tu peux rester sur la page)');
      $('#iaResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
      const tick = async () => {
        try {
          const j = await api(`/api/status?job=${encodeURIComponent(job)}&user=${user}`);
          if (j.status === 'done') {
            clearInterval(polling);
            done(j.video, image);
          } else if (j.status === 'failed') {
            clearInterval(polling);
            localStorage.removeItem('fs_pending');
            showStatus('❌ La génération a échoué. Ton crédit a été remboursé, réessaie avec un autre texte.');
            $('#iaGo').disabled = false;
            refreshCredits();
          } else if (j.position != null) {
            showStatus(`🎬 En file d'attente (position ${j.position + 1})…`);
          } else {
            showStatus('🎬 Animation de la bouche en cours… (2 à 5 min)');
          }
        } catch (e) { /* réessaie au prochain tour */ }
      };
      polling = setInterval(tick, 6000);
      tick();
    }

    function done(video, image) {
      const pending = readJson('fs_pending') || {};
      localStorage.removeItem('fs_pending');
      $('#iaImage').hidden = true;
      const v = $('#iaVideo');
      v.src = video;
      v.hidden = false;
      const d = $('#iaDownload');
      d.href = video;
      d.target = '_blank';
      d.hidden = false;
      showStatus('✅ Ta vidéo est prête !');
      $('#iaGo').disabled = false;
      const hist = readJson('fs_history') || [];
      hist.unshift({ video, image, text: pending.text || '', at: Date.now() });
      writeJson('fs_history', hist.slice(0, 20));
      renderHistory();
    }

    function renderHistory() {
      const hist = readJson('fs_history') || [];
      $('#iaHistoryCard').hidden = !hist.length;
      $('#iaHistory').innerHTML = hist.map((h) => `
        <a href="${esc(h.video)}" target="_blank" rel="noopener">
          ${h.image ? `<img src="${esc(h.image)}" alt="" loading="lazy">` : ''}
          <span>${esc(h.text || 'Vidéo')}</span>
        </a>`).join('');
    }

    function readJson(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
    function writeJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }

    return {
      open() {
        if (!API) { $('#iaOff').hidden = false; return; }
        $('#iaOn').hidden = false;
        if (!opened) { opened = true; setup(); }
        refreshCredits();
      },
      afterPayment() {
        let n = 0;
        const iv = setInterval(async () => {
          n++;
          await refreshCredits();
          if (n > 6) clearInterval(iv);
        }, 2500);
      },
    };
  })();

  // ---------------------------------------------------------------------------
  // Démarrage
  // ---------------------------------------------------------------------------
  project = load();
  renderAll();
  requestAnimationFrame(loop);

  const params = new URLSearchParams(location.search);
  if (params.get('paid') === '1' || location.hash === '#ia') {
    showTab('ia');
    if (params.get('paid') === '1') {
      IA.afterPayment();
      history.replaceState(null, '', location.pathname + '#ia');
      setTimeout(() => alert('Merci ! 🎉 Tes crédits arrivent dans quelques secondes.'), 300);
    }
  } else {
    fillAds();
  }
})();
