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
    {
      title: '🥕 L\'imposteur',
      cast: [['carotte', 'Carlos', 'grave'], ['fraise', 'Fraisy', 'aigue'], ['kiwi', 'Kiki', 'normal']],
      bg: 'frigo', music: 'suspense',
      lines: [
        [1, 'Attendez… on est combien de fruits dans ce bac ?', 'malin'],
        [2, 'Trois. Moi, toi et… lui.', 'neutre'],
        [1, 'Carlos. T\'es quel fruit exactement ?', 'malin'],
        [0, 'Euh… un fruit… orange. Genre une orange longue.', 'choque'],
        [2, 'C\'EST UN LÉGUME ! IL Y A UN LÉGUME PARMI NOUS !', 'fache'],
        [0, 'Bon ok. Mais j\'ai des feuilles, ça compte pas ?', 'triste'],
      ],
    },
    {
      title: '🍇 Papy raisin sec',
      cast: [['raisin', 'Raymond', 'aigue'], ['pomme', 'Paulo', 'normal']],
      bg: 'cuisine', music: 'drame',
      lines: [
        [1, 'Raymond, pourquoi t\'es triste ?', 'neutre'],
        [0, 'Mon grand-père est parti en vacances au soleil…', 'triste'],
        [1, 'Mais c\'est bien ça !', 'content'],
        [0, 'Il est resté trop longtemps. Maintenant c\'est un raisin sec.', 'triste'],
        [1, '…paix à son jus.', 'triste'],
      ],
    },
    {
      title: '🥥 Coco à la salle',
      cast: [['coco', 'Coco', 'grave'], ['banane', 'Bernard', 'normal']],
      bg: 'studio', music: 'fete',
      lines: [
        [1, 'Coco, tu fais quoi depuis tout à l\'heure ?', 'neutre'],
        [0, 'Je travaille ma coque. Regarde-moi ces abdos.', 'content'],
        [1, 'Tu es… une boule.', 'malin'],
        [0, 'Dur à l\'extérieur, tendre à l\'intérieur. Comme les vrais.', 'malin'],
        [1, 'Moi je suis mou partout et je vis très bien.', 'content'],
      ],
    },
    {
      title: '🥝 Kiwi en crise',
      cast: [['kiwi', 'Kiwi', 'aigue'], ['citron', 'Citronnelle', 'normal']],
      bg: 'nuit', music: 'lofi',
      lines: [
        [0, 'Tu savais qu\'il existe un oiseau qui s\'appelle comme moi ?', 'choque'],
        [1, 'Et alors ?', 'neutre'],
        [0, 'Et alors je suis peut-être un oiseau ! J\'ai des poils !', 'choque'],
        [1, 'Saute du frigo pour voir.', 'malin'],
        [0, 'Non merci. Je suis un fruit. J\'assume.', 'triste'],
      ],
    },
    {
      title: '🍒 La star',
      cast: [['cerise', 'Cerisette', 'aigue'], ['tomate', 'Tom', 'grave']],
      bg: 'studio', music: 'joyeuse',
      lines: [
        [0, 'Pousse-toi, c\'est moi qu\'on met sur le gâteau.', 'malin'],
        [1, 'Et moi on me met sur la pizza. Respect.', 'fache'],
        [0, 'La cerise sur le gâteau, chéri. Pas la tomate sur le gâteau.', 'content'],
        [1, 'Attends que je trouve un gâteau à la tomate.', 'fache'],
      ],
    },
    {
      title: '🍐 La bonne poire',
      cast: [['poire', 'Pierre', 'normal'], ['ananas', 'Ananas', 'grave']],
      bg: 'marche', music: 'joyeuse',
      lines: [
        [1, 'Pierre, tu peux me prêter 10 euros ?', 'malin'],
        [0, 'Bien sûr mon ami !', 'content'],
        [1, 'Et ta place au soleil ?', 'malin'],
        [0, 'Tiens, prends-la !', 'content'],
        [1, 'Et ta copine la pêche ?', 'malin'],
        [0, 'Attends… je suis une bonne poire en fait ?', 'choque'],
      ],
    },
    {
      title: '🍋 Le citron aigri',
      cast: [['citron', 'Citron', 'grave']],
      bg: 'cuisine', music: 'drame',
      lines: [
        [0, 'Pourquoi tout le monde fait cette tête quand il me goûte ?', 'triste'],
        [0, 'Je suis pas acide. Je suis honnête.', 'fache'],
        [0, 'Si la vie te donne des citrons… respecte-les.', 'malin'],
        [0, 'Abonne-toi. Ou je te pique les yeux.', 'fache'],
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Script au hasard : on mélange des morceaux de dialogue
  // ---------------------------------------------------------------------------
  const RANDOM_PARTS = {
    a1: [
      ['{B}, faut que je te dise un truc important.', 'neutre'],
      ['Eh {B} ! Pourquoi tu me regardes comme ça ?', 'fache'],
      ['{B}… je crois qu\'on va finir en smoothie.', 'choque'],
      ['Tu savais que les humains nous mangent ?', 'choque'],
      ['J\'ai entendu le frigo parler de toi…', 'malin'],
      ['{B}, tu veux sortir avec moi ce soir ?', 'amoureux'],
    ],
    b1: [
      ['Quoi ? Moi ? J\'ai rien fait !', 'choque'],
      ['Laisse-moi tranquille, je suis en train de mûrir.', 'fache'],
      ['Arrête, tu me fais flipper là.', 'triste'],
      ['Mdr t\'es trop bizarre toi.', 'content'],
      ['Parle-moi mieux, je suis un fruit de luxe.', 'fache'],
    ],
    a2: [
      ['Le couteau a disparu de la cuisine.', 'choque'],
      ['Hier la mamie a acheté du sucre et un mixeur.', 'malin'],
      ['Tout le monde dit que t\'es plus très frais.', 'malin'],
      ['Je t\'aime depuis le rayon fruits et légumes.', 'amoureux'],
      ['On est dans une vidéo TikTok là, souris !', 'content'],
    ],
    b2: [
      ['Bon… adieu le monde cruel.', 'triste'],
      ['Abonne-toi ou je pourris.', 'fache'],
      ['Ok mais d\'abord on va en compote ensemble.', 'content'],
      ['Je m\'en fiche, je suis bio.', 'malin'],
      ['Appelez mon avocat. Littéralement.', 'malin'],
      ['NOOOOOOOON !', 'choque'],
    ],
  };

  function randomTemplate() {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const fruits = Object.keys(E.FRUITS).sort(() => Math.random() - 0.5);
    const voices = Object.keys(VOICE_FX);
    const cast = fruits.slice(0, 2).map((f) => [f, E.FRUITS[f].label, pick(voices)]);
    const fill = ([text, emo]) => [text.replace('{B}', cast[1][1]), emo];
    const order = [['a1', 0], ['b1', 1], ['a2', 0], ['b2', 1]];
    return {
      cast,
      bg: pick(Object.keys(E.BACKGROUNDS)),
      music: pick(Object.keys(window.FruitSound.MUSIC).filter((m) => m !== 'aucune')),
      lines: order.map(([part, who]) => [who, ...fill(pick(RANDOM_PARTS[part]))]),
    };
  }

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
      title: '',
      music: tp.music || 'joyeuse',
      voiceMode: 'bla',
      sfx: true,
      effects: true,
      outro: true,
    };
  }

  // Complète un projet (ancienne sauvegarde, lien partagé) avec les réglages par défaut.
  function withDefaults(p) {
    const d = { camera: 'all', captions: true, title: '', music: 'joyeuse', voiceMode: 'bla', sfx: true, effects: true, outro: true };
    Object.keys(d).forEach((k) => { if (p[k] === undefined) p[k] = d[k]; });
    if (!E.BACKGROUNDS[p.background] && p.background !== 'perso') p.background = 'cuisine';
    if (!window.FruitSound.MUSIC[p.music]) p.music = 'aucune';
    p.title = String(p.title || '').slice(0, 40);
    return p;
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('fs_project') || 'null');
      if (saved && Array.isArray(saved.cast) && Array.isArray(saved.lines)) {
        // Ignore les personnages invalides (ancienne version, stockage modifié…)
        saved.cast = saved.cast.filter((c) => c && E.FRUITS[c.fruit]).slice(0, MAX_CHARS);
        saved.lines = saved.lines.filter((l) => l && typeof l.text === 'string');
        if (saved.cast.length) return withDefaults(saved);
      }
    } catch (e) { /* stockage indisponible */ }
    return fromTemplate(TEMPLATES[0]);
  }

  function save() {
    try { localStorage.setItem('fs_project', JSON.stringify(project)); } catch (e) { /* ignore */ }
  }

  function projectForRender() {
    return Object.assign({}, project, {
      outro: project.outro !== false && !!CFG.WATERMARK,
      lines: project.lines.map((l) => Object.assign({}, l, {
        audio: audioStore[l.id] ? audioStore[l.id].buffer : null,
        voiced: !!audioStore[l.id] || project.voiceMode === 'bla',
      })),
    });
  }

  // ---------------------------------------------------------------------------
  // Lien de partage : le script est rangé dans l'adresse (#s=...)
  // ---------------------------------------------------------------------------
  function encodeProject() {
    const ids = project.cast.map((c) => c.id);
    const data = {
      c: project.cast.map((c) => [c.fruit, c.name, c.voice]),
      l: project.lines.filter((l) => l.text.trim()).map((l) => [Math.max(0, ids.indexOf(l.charId)), l.text, l.emotion]),
      b: project.background === 'perso' ? 'cuisine' : project.background,
      m: project.music, t: project.title, v: project.voiceMode,
    };
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let bin = '';
    bytes.forEach((x) => { bin += String.fromCharCode(x); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeProject(str) {
    try {
      const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
      const d = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
      const cast = (d.c || []).filter((c) => Array.isArray(c) && E.FRUITS[c[0]]).slice(0, MAX_CHARS)
        .map(([fruit, name, voice]) => [fruit, String(name || E.FRUITS[fruit].label).slice(0, 20), VOICE_FX[voice] ? voice : 'normal']);
      if (!cast.length) return null;
      const lines = (d.l || []).filter((l) => Array.isArray(l)).slice(0, 40)
        .map(([ci, text, emo]) => [Math.min(cast.length - 1, Math.max(0, ci | 0)), String(text || '').slice(0, 200), E.EMOTIONS[emo] ? emo : 'neutre']);
      const p = fromTemplate({ cast, lines, bg: d.b, music: d.m });
      p.title = d.t || '';
      if (d.v === 'robot' || d.v === 'muet') p.voiceMode = d.v;
      return withDefaults(p);
    } catch (e) {
      return null;
    }
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
    const oldLabel = E.FRUITS[c.fruit].label;
    c[k] = e.target.value;
    if (k === 'fruit' && !c.nameEdited && c.name === oldLabel) {
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
    $('#titleInput').value = project.title || '';
    $('#musicSelect').value = project.music;
    $('#voiceMode').value = project.voiceMode;
    $('#sfxToggle').checked = project.sfx !== false;
    $('#fxToggle').checked = project.effects !== false;
    $('#outroToggle').checked = project.outro !== false;
    $('#outroWrap').hidden = !CFG.WATERMARK;
  }
  $('#musicSelect').innerHTML = Object.entries(window.FruitSound.MUSIC).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  $('#titleInput').addEventListener('input', (e) => { project.title = e.target.value.slice(0, 40); save(); });
  $('#musicSelect').addEventListener('change', (e) => { project.music = e.target.value; save(); previewMusic(); });
  $('#voiceMode').addEventListener('change', (e) => { project.voiceMode = e.target.value; save(); });
  $('#sfxToggle').addEventListener('change', (e) => { project.sfx = e.target.checked; save(); });
  $('#fxToggle').addEventListener('change', (e) => { project.effects = e.target.checked; save(); });
  $('#outroToggle').addEventListener('change', (e) => { project.outro = e.target.checked; save(); updateDuration(); });
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

  $('#templates').innerHTML = '<button class="chip random" data-i="r">🎲 Au hasard</button>' +
    TEMPLATES.map((t, i) => `<button class="chip" data-i="${i}">${t.title}</button>`).join('');
  $('#templates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    stopPlayback();
    if (mode !== 'idle') return;
    const random = b.dataset.i === 'r';
    if (!random && project.lines.some((l) => l.text.trim()) && !confirm('Remplacer ton dialogue actuel par ce script ?')) return;
    Object.keys(audioStore).forEach((k) => delete audioStore[k]);
    const keep = { title: project.title, voiceMode: project.voiceMode, sfx: project.sfx, effects: project.effects, outro: project.outro, captions: project.captions, camera: project.camera };
    project = Object.assign(fromTemplate(random ? randomTemplate() : TEMPLATES[+b.dataset.i]), keep, { title: '' });
    save();
    renderAll();
  });

  $('#shareScript').addEventListener('click', async () => {
    if (!project.lines.some((l) => l.text.trim())) return alert('Écris au moins une réplique !');
    const url = location.origin + location.pathname + '#s=' + encodeProject();
    try {
      if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        await navigator.share({ title: 'Mon script FruitStudio', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash($('#shareScript'), '✅ Lien copié !');
    } catch (e) {
      prompt('Copie ce lien :', url);
    }
  });

  function flash(btn, text) {
    const old = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = old; }, 1800);
  }

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
  let micPending = false;
  async function toggleRecord(lineId, btn) {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }
    if (micPending || recorder) return; // demande de micro déjà en cours
    audioCtx(); // créé pendant le clic (obligatoire sur iPhone)
    let stream;
    micPending = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      recorder = new MediaRecorder(stream);
    } catch (err) {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      alert('Impossible d\'accéder au micro. Autorise le micro dans ton navigateur puis réessaie.');
      return;
    } finally {
      micPending = false;
    }
    const chunks = [];
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

  let musicPreview = null;
  function previewMusic() {
    if (musicPreview) { try { musicPreview.disconnect(); } catch (e) { /* ignore */ } musicPreview = null; }
    if (mode !== 'idle' || project.music === 'aucune') return;
    const ctx = audioCtx();
    const out = ctx.createGain();
    out.connect(ctx.destination);
    out.gain.setValueAtTime(1, ctx.currentTime + 3.5);
    out.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
    musicPreview = out;
    window.FruitSound.schedule(ctx, out, out, { items: [], total: 4 }, ctx.currentTime + 0.05, { cast: [], music: project.music, voiceMode: 'muet', sfx: false });
    setTimeout(() => { if (musicPreview === out) { out.disconnect(); musicPreview = null; } }, 4300);
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
    const mix = ctx.createGain();
    mix.connect(dest);
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
      } else if (mode === 'play' && proj.voiceMode === 'robot' && 'speechSynthesis' in window && it.line.text.trim()) {
        timers.push(setTimeout(() => speak(it.line.text, it.rate), (it.start + 0.15) * 1000));
      }
    });
    window.FruitSound.schedule(ctx, analyser, mix, tl, t0, {
      cast: proj.cast, music: proj.music, voiceMode: proj.voiceMode, sfx: proj.sfx !== false,
    });
    return { ctx, proj, tl, analyser, mix, t0, sources, timers, level: 0, buf: new Float32Array(analyser.fftSize) };
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
    // coupe la musique, la voix bla-bla et les bruitages déjà programmés
    try { session.analyser.disconnect(); session.mix.disconnect(); } catch (e) { /* déjà coupé */ }
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
    if (musicPreview) { musicPreview.disconnect(); musicPreview = null; }
    if (mode !== 'idle') return;
    if (!project.lines.some((l) => l.text.trim() || audioStore[l.id])) return alert('Écris au moins une réplique !');
    mode = 'play';
    session = startSession(audioCtx().destination);
    $('#playBtn').textContent = '⏹ Stop';
  });

  // Boucle de rendu unique
  const idleTl = { items: [], total: 0 };
  function loop() {
    requestAnimationFrame(loop);
    if ((mode === 'play' || mode === 'export') && session) {
      const t = sessionTime();
      E.renderFrame(g, session.proj, session.tl, Math.max(0, t), {
        level: sessionLevel(),
        bgImage,
        watermark: CFG.WATERMARK,
      });
      const bar = mode === 'export' && $('#exportBar');
      if (bar) bar.style.width = Math.min(100, (t / session.tl.total) * 100) + '%';
      if (t > session.tl.total) {
        if (mode === 'play') stopPlayback();
        else if (mode === 'export') finishExport();
      }
    } else if (mode === 'idle') {
      E.renderFrame(g, project, idleTl, performance.now() / 1000, { bgImage, watermark: CFG.WATERMARK });
    }
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
    // On bloque tout de suite les autres boutons (double clic, aperçu) pendant le chargement de la police.
    mode = 'export';
    if (musicPreview) { musicPreview.disconnect(); musicPreview = null; }
    const ctx = audioCtx(); // créé pendant le clic (obligatoire sur iPhone)
    showOverlay('progress');
    try { await document.fonts.load('800 64px "Baloo 2"'); } catch (e) { /* police de secours */ }
    try {
      const dest = ctx.createMediaStreamDestination();
      session = startSession(dest);
      const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
      recMime = pickMime();
      recChunks = [];
      rec = new MediaRecorder(stream, recMime ? { mimeType: recMime, videoBitsPerSecond: 6e6 } : undefined);
      rec.ondataavailable = (ev) => ev.data.size && recChunks.push(ev.data);
      rec.onstop = onExportDone;
      rec.start(250);
    } catch (err) {
      endSession();
      rec = null;
      mode = 'idle';
      $('#exportOverlay').hidden = true;
      alert('La vidéo n\'a pas pu être créée sur ce navigateur. Essaie avec Chrome, Edge ou Safari à jour.');
    }
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
            removeKey('fs_pending');
            showStatus('❌ La génération a échoué. Ton crédit a été remboursé, réessaie avec un autre texte.');
            $('#iaGo').disabled = false;
            refreshCredits();
          } else if (j.position != null) {
            showStatus(`🎬 En file d'attente (position ${j.position + 1})…`);
          } else {
            showStatus('🎬 Animation de la bouche en cours… (2 à 5 min)');
          }
        } catch (e) {
          // Vidéo introuvable (expirée, autre code de récupération) : on arrête d'attendre.
          if (e.status === 404 || e.status === 400) {
            clearInterval(polling);
            removeKey('fs_pending');
            showStatus('❌ Cette vidéo est introuvable (expirée ou liée à un autre code).');
            $('#iaGo').disabled = false;
          }
          /* sinon : réessaie au prochain tour */
        }
      };
      polling = setInterval(tick, 6000);
      tick();
    }

    function done(video, image) {
      const pending = readJson('fs_pending') || {};
      removeKey('fs_pending');
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
    function removeKey(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

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
  const shared = location.hash.startsWith('#s=') ? decodeProject(location.hash.slice(3)) : null;
  if (shared) {
    project = shared;
    save();
    history.replaceState(null, '', location.pathname);
  }
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
