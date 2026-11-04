// CRM visuel 3D · site de vente : animations, héros à pastilles, essai en direct, questionnaire.
// Aucune donnée n'est envoyée : le bouton final ouvre simplement la messagerie (mailto).
(() => {
  const S = window.SITE || {};
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MAIL = 'matheoguzzi11@gmail.com';

  // Menu téléphone
  const burger = $('#burger'), mnav = $('#mnav');
  if (burger) {
    burger.onclick = () => { const on = mnav.classList.toggle('on'); burger.setAttribute('aria-expanded', on); };
    $$('a', mnav).forEach((a) => a.addEventListener('click', () => { mnav.classList.remove('on'); burger.setAttribute('aria-expanded', 'false'); }));
  }

  // Apparitions au défilement
  const io = 'IntersectionObserver' in window && !calme
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' })
    : null;
  $$('.rv').forEach((el) => (io ? io.observe(el) : el.classList.add('vu')));

  // Héros : les pastilles changent la capture affichée (comme les coloris)
  const vis = $('#heroVis');
  if (vis) {
    const imgs = $$('.ecran img', vis), sw = $('#heroSw');
    const nom = document.createElement('span');
    let cur = 0, minuteur = null;
    imgs.forEach((im, i) => {
      const b = document.createElement('button');
      b.className = 'sw'; b.type = 'button'; b.style.background = im.dataset.couleur;
      b.setAttribute('aria-label', 'Afficher : ' + im.dataset.nom);
      b.onclick = () => { montrer(i); clearInterval(minuteur); };
      sw.appendChild(b);
    });
    sw.appendChild(nom);
    nom.setAttribute('aria-live', 'polite');
    function montrer(i) {
      cur = i;
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      $$('.sw', sw).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
      nom.textContent = imgs[i].dataset.nom;
      vis.style.background = imgs[i].dataset.fond;
    }
    montrer(0);
    if (!calme) minuteur = setInterval(() => montrer((cur + 1) % imgs.length), 4200);

    // Fil d'événements de la démo (inventés)
    const h = $('#fil-h'), tx = $('#fil-t'), F = S.fil || [];
    let f = 0;
    if (!calme && F.length && h) setInterval(() => {
      tx.classList.add('sort');
      setTimeout(() => { f = (f + 1) % F.length; h.textContent = F[f][0]; tx.textContent = F[f][1]; tx.classList.remove('sort'); }, 350);
    }, 2800);
  }

  // Essayer en direct : l'iframe n'est chargée qu'au clic (sur téléphone, la démo s'ouvre en plein écran)
  const cadre = $('#cadre');
  if (cadre) {
    const onglets = $$('.onglet'), poster = $('img', cadre), lancer = $('#lancer');
    let choix = onglets[0], fr = null;
    const ajuster = () => { if (fr) fr.style.transform = `scale(${cadre.clientWidth / 1200})`; };
    const choisir = (o) => {
      choix = o;
      onglets.forEach((x) => x.setAttribute('aria-pressed', x === o));
      if (fr) { fr.src = o.dataset.src; fr.title = o.dataset.titre; }
      else { poster.src = o.dataset.img; poster.alt = o.dataset.alt; }
      $('#ouvrir').href = o.dataset.src;
    };
    onglets.forEach((o) => (o.onclick = () => choisir(o)));
    lancer.onclick = () => {
      if (innerWidth < 700) { location.href = choix.dataset.src; return; }
      fr = document.createElement('iframe');
      fr.src = choix.dataset.src; fr.title = choix.dataset.titre; fr.loading = 'eager';
      cadre.querySelectorAll('img, .voile').forEach((x) => x.remove());
      cadre.appendChild(fr); ajuster(); addEventListener('resize', ajuster);
    };
    choisir(choix);
  }

  // Questionnaire : 3 questions, puis une recommandation et le mail de réservation tout prêt
  const quiz = $('#quiz');
  if (quiz) {
    const Q = [
      ['Votre métier ?', 'metier', [['Auto-école', 'ae'], ['Commerce, magasin de proximité', 'commerce'], ['Supermarché, grande surface', 'gs'], ['Autre (agence, entrepôt, atelier…)', 'autre']]],
      ['Combien de sites ?', 'sites', [['Un seul', '1'], ['De 2 à 5', '2-5'], ['Plus de 5, ou un centre commercial', '5+']]],
      ['Combien de personnes dans l\'équipe ?', 'gens', [['Moins de 10', '-10'], ['De 10 à 50', '10-50'], ['Plus de 50', '50+']]],
    ];
    const R = {
      petite: ['Petite structure', 'À partir de 490 € + 99 €/mois', 'Une agence ou un magasin de proximité : la mise en place une fois, puis l\'abonnement mensuel, sans engagement. Le prix exact est fixé sur devis après la démo.'],
      sites: ['Plusieurs sites, grande surface', 'Sur devis', 'Supermarché, plusieurs agences, entrepôt : le devis tient compte de la taille des locaux à dessiner, du nombre de personnes, de caisses ou de rayons suivis, et des branchements à vos logiciels. Établi gratuitement après la démo.'],
      groupe: ['Centre commercial, grand groupe', 'Sur devis', 'Plusieurs bâtiments, beaucoup de personnel : on regarde ensemble ce qu\'il faut voir à l\'écran, puis on établit le devis, gratuitement, après la démo.'],
    };
    const IMG = S.quizImg || {}, qImg = $('#qImg');
    let i = 0, rep = {}, lib = {};
    const verdict = () => (rep.sites === '5+' || (rep.gens === '50+' && rep.sites !== '1')) ? 'groupe'
      : (rep.metier === 'gs' || rep.sites === '2-5' || rep.gens === '50+') ? 'sites' : 'petite';
    function rendre() {
      quiz.innerHTML = '';
      const box = document.createElement('div'); box.className = 'qanim'; quiz.appendChild(box);
      if (i < Q.length) {
        box.innerHTML = '<div class="qn"></div><div class="bar"><i></i></div><h3></h3><div class="ans" role="group"></div>';
        $('.qn', box).textContent = 'Question ' + (i + 1) + ' sur ' + Q.length;
        $('.bar i', box).style.width = (i / Q.length * 100 + 8) + '%';
        $('h3', box).textContent = Q[i][0];
        $('.ans', box).setAttribute('aria-label', Q[i][0]);
        Q[i][2].forEach(([l, v]) => {
          const b = document.createElement('button'); b.type = 'button'; b.textContent = l;
          b.onclick = () => { rep[Q[i][1]] = v; lib[Q[i][1]] = l; if (Q[i][1] === 'metier' && IMG[v] && qImg) qImg.src = IMG[v]; i++; rendre(); $('button', quiz)?.focus({ preventScroll: true }); };
          $('.ans', box).appendChild(b);
        });
      } else {
        const r = R[verdict()];
        const corps = 'Bonjour,\n\nJe souhaite réserver une démo de 10 minutes du CRM visuel 3D.\n\nMétier : ' + lib.metier + '\nNombre de sites : ' + lib.sites + '\nPersonnes dans l\'équipe : ' + lib.gens + '\nFormule indiquée sur le site : ' + r[0] + ' (' + r[1] + ')\nVille : \nNom de l\'établissement : \n\nMerci,\n';
        const href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Réserver une démo · CRM visuel 3D') + '&body=' + encodeURIComponent(corps);
        box.innerHTML = '<div class="qn">Notre conseil</div><div class="bar"><i style="width:100%"></i></div><div class="res"><span class="qui"></span><b></b><p></p><div class="row"><a class="btn" id="qGo">Réserver la démo</a><button class="link" type="button" id="qRe">Recommencer</button></div><p class="recap"></p></div>';
        $('.qui', box).textContent = r[0];
        $('b', box).textContent = r[1];
        $('.res p', box).textContent = r[2];
        $('#qGo', box).href = href;
        $('.recap', box).textContent = 'Le bouton ouvre votre messagerie avec vos réponses déjà écrites : rien n\'est envoyé sans vous.';
        $('#qRe', box).onclick = () => { i = 0; rep = {}; lib = {}; if (qImg && S.quizImg) qImg.src = S.quizImg.depart; rendre(); };
      }
    }
    rendre();
  }
  // Ce que ça vous rapporte : calcul fait sur l'appareil, rien n'est envoyé
  const calc = $('#calc');
  if (calc) {
    const nb = (id) => { const v = parseFloat(String($(id).value).replace(',', '.')); return isFinite(v) && v > 0 ? v : 0; };
    const fmt = (n, d = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
    const ABO = 99;
    const maj = () => {
      const pers = nb('#cPers'), min = nb('#cMin'), taux = nb('#cTaux'), jours = nb('#cJours');
      const heures = pers * min * jours / 60, cout = heures * taux;
      $('#cMinV').textContent = fmt(min) + ' min';
      $('#cHeures').textContent = fmt(heures, heures < 10 ? 1 : 0) + ' h';
      $('#cCout').textContent = fmt(Math.round(cout)) + ' €';
      const c = $('#cComp');
      if (cout <= 0) c.textContent = 'Indiquez vos chiffres pour voir le résultat.';
      else if (cout >= ABO) c.innerHTML = 'Soit <b>' + fmt(cout / ABO, 1) + ' fois</b> le prix de départ de l\'abonnement (99 €/mois).';
      else c.textContent = 'C\'est moins que le prix de départ de l\'abonnement (99 €/mois) : avec ces hypothèses, le temps gagné seul ne le justifie pas.';
    };
    $$('input', calc).forEach((x) => x.addEventListener('input', maj));
    maj();
  }
})();
