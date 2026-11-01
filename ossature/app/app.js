/* Ossature — démo. Tout se passe dans le navigateur, rien n'est envoyé. */
(() => {
  const D = window.DEMO;
  const TODAY = new Date(D.aujourdhui + 'T12:00:00');
  const JOURS = ['Lun. 2', 'Mar. 3', 'Mer. 4', 'Jeu. 5', 'Ven. 6'];
  const MAT_PREVU = { 'C-041': 5200, 'C-043': 8400, 'C-039': 2500, 'C-045': 21000, 'C-037': 3900 };

  /* ---------- Icônes ---------- */
  const PATHS = {
    home: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    site: '<path d="M2 20h20M4 20V10l8-6 8 6v10"/><path d="M9 20v-5h6v5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    quote: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    invoice: '<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    client: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    euro: '<path d="M4 10h11M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  };
  const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24">${PATHS[n] || ''}</svg>`;

  /* ---------- Outils ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtEur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const fmtEur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const eur = (n) => fmtEur.format(Math.round(n));
  const eur2 = (n) => fmtEur2.format(n);
  const pct = (n) => `${Math.round(n)} %`;
  const d = (s) => new Date(s + 'T12:00:00');
  const fdate = (s, opt = { day: 'numeric', month: 'short', year: 'numeric' }) => d(s).toLocaleDateString('fr-FR', opt);
  const fshort = (s) => fdate(s, { day: 'numeric', month: 'short' });
  const daysTo = (s) => Math.round((d(s) - TODAY) / 864e5);

  const salarie = (id) => D.salaries.find((s) => s.id === id);
  const client = (id) => D.clients.find((c) => c.id === id);
  const chantier = (id) => D.chantiers.find((c) => c.id === id);
  const devis = (id) => D.devis.find((x) => x.id === id);
  const fullName = (s) => `${s.prenom} ${s.nom}`;
  const initials = (s) => (s.prenom[0] + s.nom[0]).toUpperCase();

  const avatar = (s, cls = '') => s.photo
    ? `<img class="av ${cls}" src="${esc(s.photo)}" alt="${esc(fullName(s))}" data-i="${initials(s)}" loading="lazy" onerror="this.outerHTML='<span class=&quot;av ${cls}&quot;>'+this.dataset.i+'</span>'">`
    : `<span class="av ${cls}">${initials(s)}</span>`;

  const docState = (exp) => {
    const n = daysTo(exp);
    if (n < 0) return { cls: 'red', txt: `Expiré depuis le ${fshort(exp)}`, short: 'Expiré', level: 2 };
    if (n <= 45) return { cls: 'amber', txt: `Expire dans ${n} jour${n > 1 ? 's' : ''}`, short: `${n} j`, level: 1 };
    return { cls: 'green', txt: `Valide jusqu'au ${fdate(exp)}`, short: 'Valide', level: 0 };
  };
  const personAlerts = (s) => s.docs.map((x) => ({ ...x, st: docState(x.exp) })).filter((x) => x.st.level > 0);

  const totals = (dv) => {
    const ht = dv.lignes.reduce((a, l) => a + (Number(l[1]) || 0) * (Number(l[3]) || 0), 0);
    const tva = ht * dv.tva / 100;
    return { ht, tva, ttc: ht + tva };
  };

  const money = (c) => {
    const taux = c.tauxHoraire;
    const mat = Math.max(MAT_PREVU[c.id] || 0, c.coutMat);
    const prevue = c.budget - (MAT_PREVU[c.id] || 0) - c.heuresPrevues * taux;
    let heuresFin = c.heuresPrevues;
    if (c.statut === 'terminé') heuresFin = c.heuresReelles;
    else if (c.avancement > 0) heuresFin = Math.round(c.heuresReelles / c.avancement * 100);
    const projetee = c.budget - mat - heuresFin * taux;
    return { prevue, projetee, heuresFin, depasse: heuresFin > c.heuresPrevues * 1.05, engage: c.coutMat + c.heuresReelles * taux };
  };

  const statutChantier = (s) => ({ 'en cours': 'blue', 'à démarrer': 'amber', 'terminé': 'green' }[s] || '');
  const statutDevis = (s) => ({ brouillon: '', envoyé: 'blue', signé: 'green', refusé: 'red' }[s] || '');
  const statutFacture = (s) => ({ payée: 'green', envoyée: 'blue', 'en retard': 'red' }[s] || '');
  const pill = (txt, cls) => `<span class="pill ${cls}">${esc(txt.charAt(0).toUpperCase() + txt.slice(1))}</span>`;

  /* ---------- Alertes ---------- */
  function alerts() {
    const out = [];
    D.salaries.forEach((s) => personAlerts(s).forEach((x) => out.push({
      lvl: x.st.level, cls: x.st.level === 2 ? 'red' : 'amber', icon: 'shield',
      titre: `${x.nom} — ${fullName(s)}`, sub: x.st.txt, href: `#/equipe/${s.id}`,
    })));
    D.factures.filter((f) => f.statut === 'en retard').forEach((f) => out.push({
      lvl: 2, cls: 'red', icon: 'euro', titre: `Facture ${f.id} impayée — ${eur2(f.montantTTC)}`,
      sub: `${client(f.client).nom} · échéance dépassée de ${-daysTo(f.echeance)} jours`, href: '#/factures',
    }));
    D.chantiers.filter((c) => c.statut === 'en cours' && money(c).depasse).forEach((c) => {
      const m = money(c);
      out.push({ lvl: 1, cls: 'amber', icon: 'clock', titre: `${c.titre} : heures en dépassement`, sub: `Prévu ${c.heuresPrevues} h · fin estimée à ${m.heuresFin} h`, href: `#/chantiers/${c.id}` });
    });
    D.conges.filter((c) => c.statut === 'en attente').forEach((c) => {
      const s = salarie(c.salarie);
      out.push({ lvl: 0, cls: 'blue', icon: 'sun', titre: `Congés à valider — ${fullName(s)}`, sub: `${c.type} du ${fshort(c.du)} au ${fshort(c.au)} (${c.jours} jours)`, href: `#/equipe/${s.id}` });
    });
    return out.sort((a, b) => b.lvl - a.lvl);
  }

  /* ---------- Navigation ---------- */
  const NAV = [
    ['tableau', 'Tableau de bord', 'home'],
    ['chantiers', 'Chantiers', 'site'],
    ['planning', 'Planning', 'calendar'],
    ['equipe', 'Équipe', 'users'],
    ['devis', 'Devis', 'quote'],
    ['factures', 'Factures', 'invoice'],
    ['clients', 'Clients', 'client'],
  ];
  function renderNav(section) {
    const nbDocs = D.salaries.reduce((a, s) => a + personAlerts(s).length, 0);
    const nbRetard = D.factures.filter((f) => f.statut === 'en retard').length;
    const badge = { equipe: nbDocs, factures: nbRetard };
    document.getElementById('nav').innerHTML =
      `<div class="side-label">Pilotage</div>` +
      NAV.map(([k, label, i], n) => (n === 4 ? '<div class="side-label">Ventes</div>' : '') +
        `<a href="#/${k}" class="${section === k ? 'on' : ''}">${ic(i)}${label}${badge[k] ? `<span class="badge">${badge[k]}</span>` : ''}</a>`).join('');
    const mob = [['tableau', 'Accueil', 'home'], ['chantiers', 'Chantiers', 'site'], ['planning', 'Planning', 'calendar'], ['equipe', 'Équipe', 'users'], ['devis', 'Devis', 'quote']];
    document.getElementById('mnav').innerHTML = mob.map(([k, l, i]) => `<a href="#/${k}" class="${section === k ? 'on' : ''}">${ic(i)}${l}</a>`).join('');
    document.getElementById('top-actions').innerHTML =
      `<a class="icon-btn" href="#/tableau" title="Alertes">${ic('bell')}<span class="dot"></span></a>
       <button class="btn primary" data-act="new-quote">${ic('plus')}<span class="hide-m">Nouveau devis</span></button>`;
  }

  /* ---------- Pages ---------- */
  function pageTableau() {
    const ca = D.caMensuel, last = ca[ca.length - 1][1], prev = ca[ca.length - 2][1];
    const evo = (last - prev) / prev * 100;
    const aEnc = D.factures.filter((f) => f.statut !== 'payée');
    const retard = aEnc.filter((f) => f.statut === 'en retard');
    const attente = D.devis.filter((x) => x.statut === 'envoyé' || x.statut === 'brouillon');
    const enCours = D.chantiers.filter((c) => c.statut === 'en cours');
    const margeMoy = enCours.reduce((a, c) => a + money(c).projetee / c.budget * 100, 0) / enCours.length;
    const max = Math.max(...ca.map((x) => x[1]));
    const al = alerts();

    // Planning du jour
    const parChantier = {};
    Object.entries(D.planning).forEach(([sid, jours]) => { const j = jours[0]; if (chantier(j)) (parChantier[j] = parChantier[j] || []).push(sid); });

    return `
    <div class="page-head">
      <div><h1>Bonjour Julien</h1><p>Lundi 2 novembre 2026 · ${enCours.length} chantiers en cours, ${al.length} points à regarder.</p></div>
      <div class="row"><a class="btn" href="#/planning">${ic('calendar')}Planning de la semaine</a></div>
    </div>

    <div class="grid g-4">
      <a class="card kpi" href="#/factures"><div class="kpi-label">${ic('trend')}Chiffre d'affaires d'octobre</div>
        <div class="kpi-value">${eur(last)}</div><div class="kpi-sub"><span class="${evo >= 0 ? 'up' : 'down'}">${evo >= 0 ? '+' : ''}${evo.toFixed(1).replace('.', ',')} %</span> par rapport à septembre (HT)</div></a>
      <a class="card kpi" href="#/factures"><div class="kpi-label">${ic('euro')}À encaisser</div>
        <div class="kpi-value">${eur(aEnc.reduce((a, f) => a + f.montantTTC, 0))}</div><div class="kpi-sub"><span class="down">${eur(retard.reduce((a, f) => a + f.montantTTC, 0))}</span> en retard (TTC)</div></a>
      <a class="card kpi" href="#/devis"><div class="kpi-label">${ic('quote')}Devis en attente</div>
        <div class="kpi-value">${eur(attente.reduce((a, x) => a + totals(x).ht, 0))}</div><div class="kpi-sub">${attente.length} devis non signés (HT)</div></a>
      <a class="card kpi" href="#/chantiers"><div class="kpi-label">${ic('site')}Marge des chantiers en cours</div>
        <div class="kpi-value">${pct(margeMoy)}</div><div class="kpi-sub">Estimée à la fin, d'après les heures pointées</div></a>
    </div>

    <div class="grid g-main mt">
      <div class="card">
        <div class="card-head"><h2>Chiffre d'affaires facturé</h2><span class="t-sub">6 derniers mois, HT</span></div>
        <div class="card-body"><div class="chart">${ca.map(([m, v]) => `<div class="col"><span class="val">${Math.round(v / 1000)} k€</span><div class="b" style="height:${v / max * 78}%" title="${eur(v)}"></div><span class="lbl">${m}</span></div>`).join('')}</div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>À regarder</h2><span class="pill plain">${al.length}</span></div>
        <div class="list" style="margin-top:8px">${al.slice(0, 5).map((a) => `
          <a class="list-item" href="${a.href}"><span class="alert-ico ${a.cls}">${ic(a.icon)}</span>
            <div class="grow"><div class="t-strong ellipsis">${esc(a.titre)}</div><div class="t-sub ellipsis">${esc(a.sub)}</div></div></a>`).join('')}</div>
      </div>
    </div>

    <div class="grid g-main mt">
      <div class="card">
        <div class="card-head"><h2>Chantiers en cours</h2><a href="#/chantiers">Tout voir</a></div>
        <div class="table-wrap" style="margin-top:10px"><table class="table"><thead><tr><th>Chantier</th><th class="hide-m">Équipe</th><th>Avancement</th><th class="r hide-m">Marge estimée</th></tr></thead><tbody>
        ${enCours.map((c) => { const m = money(c); return `<tr class="link" data-href="#/chantiers/${c.id}">
          <td><div class="t-strong">${esc(c.titre)}</div><div class="t-sub">${esc(client(c.client).nom)} · fin le ${fshort(c.fin)}</div></td>
          <td class="hide-m"><div class="av-stack">${c.equipe.map((id) => avatar(salarie(id), 'sm')).join('')}</div></td>
          <td style="min-width:130px"><div class="row" style="gap:10px;flex-wrap:nowrap"><div class="bar accent" style="flex:1"><span style="width:${c.avancement}%"></span></div><span class="num t-sub">${c.avancement} %</span></div></td>
          <td class="r hide-m num"><span class="${m.depasse ? 'down' : ''}">${eur(m.projetee)}</span><div class="t-sub">${pct(m.projetee / c.budget * 100)}</div></td></tr>`; }).join('')}
        </tbody></table></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Aujourd'hui sur les chantiers</h2><a href="#/planning">Planning</a></div>
        <div class="list" style="margin-top:8px">${Object.entries(parChantier).map(([cid, ids]) => { const c = chantier(cid); return `
          <a class="list-item" href="#/chantiers/${cid}"><span style="width:4px;align-self:stretch;border-radius:4px;background:${c.couleur}"></span>
            <div class="grow"><div class="t-strong ellipsis">${esc(c.titre)}</div><div class="t-sub ellipsis">${ic('pin', '').replace('class="i ', 'style="width:12px;height:12px;vertical-align:-1px" class="i ')} ${esc(client(c.client).adresse)}</div></div>
            <div class="av-stack">${ids.map((id) => avatar(salarie(id), 'sm')).join('')}</div></a>`; }).join('')}
          <div class="list-item t-sub">${ic('sun')} Enzo en formation au CFA mercredi et jeudi.</div>
        </div>
      </div>
    </div>`;
  }

  let filtreChantier = 'tous';
  function pageChantiers() {
    const tabs = [['tous', 'Tous'], ['en cours', 'En cours'], ['à démarrer', 'À démarrer'], ['terminé', 'Terminés']];
    const list = D.chantiers.filter((c) => filtreChantier === 'tous' || c.statut === filtreChantier);
    return `
    <div class="page-head"><div><h1>Chantiers</h1><p>${D.chantiers.length} chantiers · ${eur(D.chantiers.filter((c) => c.statut !== 'terminé').reduce((a, c) => a + c.budget, 0))} HT en cours et à venir</p></div>
      <button class="btn primary" data-act="toast" data-msg="Dans la vraie appli, le chantier se crée tout seul quand le devis est signé.">${ic('plus')}Nouveau chantier</button></div>
    <div class="row" style="margin-bottom:16px">${tabs.map(([k, l]) => `<button class="btn sm ${filtreChantier === k ? 'dark' : ''}" data-act="filtre-chantier" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="grid g-3">${list.map((c) => { const m = money(c); return `
      <a class="card site-card" href="#/chantiers/${c.id}">
        <div class="cover ${c.photo ? '' : 'empty'}" ${c.photo ? `style="background-image:url('${c.photo}')"` : ''}>${c.photo ? '' : ic('site')}${pill(c.statut, statutChantier(c.statut))}</div>
        <div class="card-body">
          <div><div class="t-sub">${c.id}</div><h3 style="font-size:15.5px;font-weight:620;margin-top:2px">${esc(c.titre)}</h3><div class="t-sub">${esc(client(c.client).nom)}</div></div>
          <div class="row" style="gap:10px;flex-wrap:nowrap"><div class="bar accent" style="flex:1"><span style="width:${c.avancement}%"></span></div><span class="num t-sub">${c.avancement} %</span></div>
          <div class="site-meta"><div class="av-stack">${c.equipe.map((id) => avatar(salarie(id), 'sm')).join('')}</div><span>${fshort(c.debut)} → ${fshort(c.fin)}</span></div>
          <div class="site-meta" style="border-top:1px solid var(--line-2);padding-top:10px"><span>Budget <b class="num" style="color:var(--ink)">${eur(c.budget)}</b></span><span>Marge <b class="num ${m.depasse ? 'down' : ''}" style="${m.depasse ? '' : 'color:var(--ink)'}">${pct(m.projetee / c.budget * 100)}</b></span></div>
        </div></a>`; }).join('')}</div>`;
  }

  function pageChantier(id) {
    const c = chantier(id); if (!c) return notFound();
    const cl = client(c.client), m = money(c);
    const dv = D.devis.find((x) => x.client === c.client && x.statut === 'signé');
    const fac = D.factures.filter((f) => f.client === c.client);
    const heuresPct = Math.min(100, c.heuresReelles / c.heuresPrevues * 100);
    return `
    <a class="back" href="#/chantiers">${ic('back')}Chantiers</a>
    <div class="page-head"><div><div class="row">${pill(c.statut, statutChantier(c.statut))}<span class="t-sub">${c.id}</span></div>
      <h1 style="margin-top:6px">${esc(c.titre)}</h1><p>${esc(cl.nom)} · ${esc(cl.adresse)}</p></div>
      <div class="row"><button class="btn" data-act="toast" data-msg="Lien de suivi copié : le client voit l'avancement, les photos et ses factures.">${ic('link')}Lien de suivi client</button>
      <button class="btn dark" data-act="toast" data-msg="Photo ajoutée au chantier (démo).">${ic('image')}Ajouter des photos</button></div></div>

    ${c.photo ? `<div class="hero-site" style="background-image:url('${c.photo}')"></div>` : ''}

    <div class="grid g-4 ${c.photo ? 'mt' : ''}">
      <div class="card kpi"><div class="kpi-label">${ic('trend')}Avancement</div><div class="kpi-value">${c.avancement} %</div><div class="bar accent" style="margin-top:10px"><span style="width:${c.avancement}%"></span></div></div>
      <div class="card kpi"><div class="kpi-label">${ic('clock')}Heures pointées</div><div class="kpi-value">${c.heuresReelles} h <span class="t-sub" style="font-size:14px;font-weight:500">/ ${c.heuresPrevues} h</span></div><div class="bar ${m.depasse ? 'red' : ''}" style="margin-top:10px"><span style="width:${heuresPct}%"></span></div></div>
      <div class="card kpi"><div class="kpi-label">${ic('euro')}Marge prévue au devis</div><div class="kpi-value">${eur(m.prevue)}</div><div class="kpi-sub">${pct(m.prevue / c.budget * 100)} du budget</div></div>
      <div class="card kpi"><div class="kpi-label">${ic('alert')}Marge estimée à la fin</div><div class="kpi-value ${m.depasse ? 'down' : ''}">${eur(m.projetee)}</div><div class="kpi-sub">${m.depasse ? `Dépassement : environ ${m.heuresFin - c.heuresPrevues} h de plus que prévu` : 'Dans les clous'}</div></div>
    </div>

    <div class="grid g-main mt">
      <div class="card"><div class="card-head"><h2>Étapes du chantier</h2><span class="t-sub">Cliquez pour cocher</span></div>
        <div class="card-body"><div class="steps">${c.etapes.map(([t, ok], i) => `
          <div class="step ${ok ? 'done' : ''}" data-act="step" data-c="${c.id}" data-i="${i}" style="cursor:pointer"><span class="tick ${ok ? 'done' : ''}">${ok ? ic('check') : ''}</span><span>${esc(t)}</span></div>`).join('')}</div></div></div>
      <div class="card"><div class="card-head"><h2>Rentabilité</h2><span class="t-sub">HT</span></div>
        <div class="card-body">
          <div class="money-row"><span>Montant du devis</span><b class="num">${eur(c.budget)}</b></div>
          <div class="money-row"><span>Matériaux achetés</span><span class="num">− ${eur(c.coutMat)}</span></div>
          <div class="money-row"><span>Main-d'œuvre (${c.heuresReelles} h × ${c.tauxHoraire} €)</span><span class="num">− ${eur(c.heuresReelles * c.tauxHoraire)}</span></div>
          <div class="money-row total"><span>Reste à ce jour</span><span class="num">${eur(c.budget - m.engage)}</span></div>
          <p class="t-sub" style="margin:12px 0 0">Les heures viennent du pointage des salariés sur leur téléphone, les matériaux des factures fournisseurs prises en photo.</p>
        </div></div>
    </div>

    <div class="grid g-3 mt">
      <div class="card"><div class="card-head"><h3>Équipe</h3><a href="#/planning">Planning</a></div>
        <div class="list" style="margin-top:6px">${c.equipe.map((sid) => { const s = salarie(sid); return `<a class="list-item" href="#/equipe/${s.id}">${avatar(s)}<div class="grow"><div class="t-strong">${esc(fullName(s))}</div><div class="t-sub">${esc(s.poste)}</div></div></a>`; }).join('')}</div></div>
      <div class="card"><div class="card-head"><h3>Client</h3></div>
        <div class="card-body"><div class="t-strong">${esc(cl.nom)}</div><div class="t-sub" style="margin-bottom:12px">${esc(cl.type)}</div>
          <div class="row t-sub" style="margin-bottom:6px">${ic('pin')}${esc(cl.adresse)}</div>
          <div class="row t-sub" style="margin-bottom:6px">${ic('phone')}${esc(cl.tel)}</div>
          <div class="row t-sub">${ic('mail')}${esc(cl.email)}</div></div></div>
      <div class="card"><div class="card-head"><h3>Documents</h3></div>
        <div class="list" style="margin-top:6px">
          ${dv ? `<a class="list-item" href="#/devis/${dv.id}"><span class="doc-ico">${ic('quote')}</span><div class="grow"><div class="t-strong">Devis ${dv.id}</div><div class="t-sub">Signé · ${eur(totals(dv).ht)} HT</div></div></a>` : ''}
          ${fac.map((f) => `<a class="list-item" href="#/factures"><span class="doc-ico">${ic('invoice')}</span><div class="grow"><div class="t-strong">${f.id}</div><div class="t-sub ellipsis">${esc(f.objet)}</div></div>${pill(f.statut, statutFacture(f.statut))}</a>`).join('')}
        </div></div>
    </div>`;
  }

  function pagePlanning() {
    const rows = Object.keys(D.planning);
    const cellChip = (sid, j) => {
      const v = D.planning[sid][j];
      if (v === 'ecole') return `<span class="chip off">Formation CFA<small>Apprentissage</small></span>`;
      if (v === 'conge') return `<span class="chip off">Congés</span>`;
      const c = chantier(v); if (!c) return '';
      return `<span class="chip" draggable="true" data-s="${sid}" data-j="${j}" style="border-left-color:${c.couleur};background:${c.couleur}12">${esc(c.titre)}<small>${esc(client(c.client).nom)}</small></span>`;
    };
    const used = [...new Set(Object.values(D.planning).flat())].map(chantier).filter(Boolean);
    return `
    <div class="page-head"><div><h1>Planning</h1><p>Semaine du 2 au 6 novembre 2026 · glissez un chantier pour déplacer quelqu'un</p></div>
      <div class="row"><button class="btn" data-act="toast" data-msg="Chaque salarié reçoit son planning sur son téléphone.">${ic('send')}Envoyer aux équipes</button></div></div>
    <div class="card"><div class="plan-wrap"><div class="plan">
      <div class="ph" style="border-left:0">Salarié</div>${JOURS.map((j, i) => `<div class="ph ${i === 0 ? 'today' : ''}">${j} nov.${i === 0 ? ' · aujourd\'hui' : ''}</div>`).join('')}
      ${rows.map((sid) => { const s = salarie(sid); return `<div class="who">${avatar(s)}<div><b>${esc(fullName(s))}</b><span>${esc(s.poste)}</span></div></div>` +
        JOURS.map((_, j) => `<div class="cell" data-s="${sid}" data-j="${j}">${cellChip(sid, j)}</div>`).join(''); }).join('')}
    </div></div></div>
    <div class="legend mt">${used.map((c) => `<span><i style="background:${c.couleur}"></i>${esc(c.titre)}</span>`).join('')}</div>`;
  }

  function pageEquipe() {
    const masse = D.salaries.reduce((a, s) => a + (s.salaire || 0), 0);
    const nbAl = D.salaries.reduce((a, s) => a + personAlerts(s).length, 0);
    return `
    <div class="page-head"><div><h1>Équipe</h1><p>${D.salaries.length} personnes · masse salariale ${eur(masse)} brut par mois · ${nbAl} document${nbAl > 1 ? 's' : ''} à renouveler</p></div>
      <button class="btn primary" data-act="add-person">${ic('plus')}Ajouter un salarié</button></div>
    <div class="grid g-4">${D.salaries.map((s) => { const al = personAlerts(s); const enAttente = D.conges.find((c) => c.salarie === s.id && c.statut === 'en attente'); return `
      <a class="card person" href="#/equipe/${s.id}">${al.length ? `<span class="warn" title="Document à renouveler">${ic('alert')}</span>` : ''}
        ${avatar(s)}<h3>${esc(fullName(s))}</h3><div class="role">${esc(s.poste)}</div>
        <div class="foot"><span class="pill plain">${esc(s.contrat)}</span>${al.length ? `<span class="pill ${al.some((x) => x.st.level === 2) ? 'red' : 'amber'}">${al.length} document${al.length > 1 ? 's' : ''}</span>` : ''}${enAttente ? '<span class="pill blue">Congés à valider</span>' : ''}</div></a>`; }).join('')}</div>`;
  }

  const salaireVisible = {};
  function pageSalarie(id) {
    const s = salarie(id); if (!s) return notFound();
    const conges = D.conges.filter((c) => c.salarie === id);
    const chs = D.chantiers.filter((c) => c.equipe.includes(id) && c.statut !== 'terminé');
    const anc = Math.floor((TODAY - d(s.entree)) / (365.25 * 864e5));
    const pl = D.planning[id];
    return `
    <a class="back" href="#/equipe">${ic('back')}Équipe</a>
    <div class="card profile-head">${avatar(s, 'lg')}
      <div style="flex:1;min-width:200px"><h1>${esc(fullName(s))}</h1><div class="role">${esc(s.poste)}</div>
        <div class="row" style="margin-top:10px"><span class="pill plain">${esc(s.contrat)}</span><span class="pill plain">Depuis ${anc < 1 ? 'moins d\'un an' : `${anc} an${anc > 1 ? 's' : ''}`}</span>${personAlerts(s).length ? `<span class="pill red">${personAlerts(s).length} document(s) à renouveler</span>` : '<span class="pill green">Documents à jour</span>'}</div></div>
      <div class="row"><a class="btn" href="tel:${s.tel.replace(/ /g, '')}">${ic('phone')}Appeler</a><button class="btn" data-act="toast" data-msg="Fiche modifiable dans la vraie appli.">${ic('pen')}Modifier</button></div>
    </div>

    <div class="grid g-main mt">
      <div class="card"><div class="card-head"><h2>Informations</h2></div>
        <div class="card-body"><dl class="kv">
          <div><dt>Poste</dt><dd>${esc(s.poste)}</dd></div>
          <div><dt>Contrat</dt><dd>${esc(s.contrat)}${s.fin ? ` · jusqu'au ${fdate(s.fin)}` : ''}</dd></div>
          <div><dt>Date d'entrée</dt><dd>${fdate(s.entree, { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
          <div><dt>Heures cette semaine</dt><dd>${s.heures} h</dd></div>
          <div><dt>Téléphone</dt><dd>${esc(s.tel)}</dd></div>
          <div><dt>E-mail</dt><dd>${esc(s.email)}</dd></div>
          <div style="grid-column:1/-1"><dt>Contact en cas d'urgence</dt><dd>${esc(s.urgence)}</dd></div>
        </dl>
        ${s.salaire ? `<div class="salary" style="margin-top:20px"><div><div class="lock">${ic('lock')}Visible uniquement par le gérant</div>
          <div class="amount num">${salaireVisible[id] ? `${eur(s.salaire)} <span class="t-sub" style="font-size:13px;font-weight:500">brut / mois</span>` : '•••• €'}</div></div>
          <button class="btn sm" data-act="toggle-salary" data-id="${id}">${ic('eye')}${salaireVisible[id] ? 'Masquer' : 'Afficher'}</button></div>` : ''}
        </div></div>
      <div class="card"><div class="card-head"><h2>Documents obligatoires</h2><button class="btn sm ghost" data-act="toast" data-msg="Document ajouté (démo). Une alerte prévient 45 jours avant l'expiration.">${ic('plus')}Ajouter</button></div>
        <div class="card-body">${s.docs.length ? s.docs.map((x) => { const st = docState(x.exp); return `
          <div class="doc-row"><span class="doc-ico">${ic('file')}</span><div style="flex:1;min-width:0"><div class="t-strong">${esc(x.nom)}</div><div class="t-sub">${st.txt}</div></div>${pill(st.short, st.cls)}</div>`; }).join('') : '<p class="t-sub" style="margin:0">Aucun document obligatoire pour ce poste.</p>'}</div></div>
    </div>

    <div class="grid g-3 mt">
      <div class="card"><div class="card-head"><h3>Congés</h3>${s.cp != null ? `<span class="t-sub">Solde : <b style="color:var(--ink)">${s.cp} jours</b></span>` : ''}</div>
        <div class="card-body">${conges.length ? conges.map((c) => `
          <div class="doc-row"><div style="flex:1"><div class="t-strong">${esc(c.type)} · ${c.jours} jour${c.jours > 1 ? 's' : ''}</div><div class="t-sub">Du ${fshort(c.du)} au ${fshort(c.au)}</div></div>
          ${c.statut === 'en attente' ? `<div class="row"><button class="btn sm" data-act="conge" data-s="${id}" data-v="refusé">Refuser</button><button class="btn sm primary" data-act="conge" data-s="${id}" data-v="validé">Valider</button></div>` : pill(c.statut, c.statut === 'validé' ? 'green' : 'red')}</div>`).join('') : '<p class="t-sub" style="margin:0">Aucune demande.</p>'}</div></div>
      <div class="card"><div class="card-head"><h3>Cette semaine</h3><a href="#/planning">Planning</a></div>
        <div class="card-body">${pl ? pl.map((v, j) => { const c = chantier(v); return `<div class="money-row"><span class="t-sub">${JOURS[j]} nov.</span><span class="t-strong ellipsis" style="max-width:65%">${c ? esc(c.titre) : v === 'ecole' ? 'Formation CFA' : '—'}</span></div>`; }).join('') : '<p class="t-sub" style="margin:0">Au bureau toute la semaine.</p>'}</div></div>
      <div class="card"><div class="card-head"><h3>Chantiers</h3></div>
        <div class="list" style="margin-top:6px">${chs.length ? chs.map((c) => `<a class="list-item" href="#/chantiers/${c.id}"><span style="width:4px;align-self:stretch;border-radius:4px;background:${c.couleur}"></span><div class="grow"><div class="t-strong ellipsis">${esc(c.titre)}</div><div class="t-sub">${esc(client(c.client).nom)}</div></div></a>`).join('') : '<div class="list-item t-sub">Aucun chantier en cours.</div>'}</div></div>
    </div>`;
  }

  function pageDevis() {
    const signes = D.devis.filter((x) => x.statut === 'signé');
    const envoyes = D.devis.filter((x) => x.statut !== 'brouillon');
    const taux = envoyes.length ? signes.length / envoyes.length * 100 : 0;
    return `
    <div class="page-head"><div><h1>Devis</h1><p>${D.devis.length} devis · taux de signature ${pct(taux)}</p></div>
      <button class="btn primary" data-act="new-quote">${ic('plus')}Nouveau devis</button></div>
    <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Numéro</th><th>Client et objet</th><th class="hide-m">Date</th><th>Statut</th><th class="r">Montant HT</th></tr></thead><tbody>
      ${D.devis.map((x) => `<tr class="link" data-href="#/devis/${x.id}"><td class="t-strong num">${x.id}</td><td><div class="t-strong">${esc(client(x.client).nom)}</div><div class="t-sub">${esc(x.objet)}</div></td>
        <td class="hide-m t-sub">${fdate(x.date)}</td><td>${pill(x.statut, statutDevis(x.statut))}</td><td class="r num t-strong">${eur(totals(x).ht)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  }

  const TVA_TXT = {
    5.5: 'TVA à 5,5 % : travaux d\'amélioration de la performance énergétique d\'un logement achevé depuis plus de 2 ans (attestation du client requise).',
    10: 'TVA à 10 % : travaux d\'amélioration, de transformation ou d\'entretien d\'un logement achevé depuis plus de 2 ans (attestation du client requise).',
    20: 'TVA à 20 % : taux normal.',
  };
  function pageDevisDetail(id) {
    const x = devis(id); if (!x) return notFound();
    const cl = client(x.client), t = totals(x), lock = x.statut === 'signé';
    const fin = new Date(d(x.date)); fin.setMonth(fin.getMonth() + 1);
    return `
    <a class="back" href="#/devis">${ic('back')}Devis</a>
    <div class="page-head"><div><div class="row">${pill(x.statut, statutDevis(x.statut))}</div><h1 style="margin-top:6px">${esc(x.objet)}</h1><p>${esc(cl.nom)}</p></div>
      <div class="row"><button class="btn" data-act="print">${ic('download')}PDF</button>
        ${lock ? '' : `<button class="btn" data-act="send-quote" data-id="${x.id}">${ic('send')}Envoyer au client</button><button class="btn primary" data-act="sign" data-id="${x.id}">${ic('pen')}Faire signer</button>`}</div></div>
    <div class="card quote">
      <div class="quote-top">
        <div><h2>${esc(D.entreprise.nom)}</h2><div class="t-sub">${esc(D.entreprise.ville)} · SIRET ${D.entreprise.siret}<br>${esc(D.entreprise.gerant)}</div></div>
        <div style="text-align:right"><div class="t-strong" style="font-size:16px">Devis ${x.id}</div><div class="t-sub">Émis le ${fdate(x.date)}<br>Valable jusqu'au ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:20px">
        <div><div class="t-sub">Client</div><div class="t-strong">${esc(cl.nom)}</div><div class="t-sub">${esc(cl.adresse)}</div></div>
        <div class="field" style="margin:0;min-width:180px"><label>Taux de TVA</label><select data-act="tva" data-id="${x.id}" ${lock ? 'disabled' : ''}>${[5.5, 10, 20].map((v) => `<option value="${v}" ${x.tva === v ? 'selected' : ''}>${String(v).replace('.', ',')} %</option>`).join('')}</select></div>
      </div>
      <div class="table-wrap"><table class="qtable"><thead><tr><th style="width:46%">Désignation</th><th class="r">Qté</th><th>Unité</th><th class="r">Prix unit. HT</th><th class="r">Total HT</th><th></th></tr></thead><tbody>
        ${x.lignes.map((l, i) => `<tr>
          <td><input value="${esc(l[0])}" data-act="line" data-id="${x.id}" data-i="${i}" data-k="0" ${lock ? 'disabled' : ''}></td>
          <td style="width:80px"><input class="r" value="${String(l[1]).replace('.', ',')}" data-act="line" data-id="${x.id}" data-i="${i}" data-k="1" inputmode="decimal" ${lock ? 'disabled' : ''}></td>
          <td style="width:90px"><input value="${esc(l[2])}" data-act="line" data-id="${x.id}" data-i="${i}" data-k="2" ${lock ? 'disabled' : ''}></td>
          <td style="width:120px"><input class="r" value="${String(l[3]).replace('.', ',')}" data-act="line" data-id="${x.id}" data-i="${i}" data-k="3" inputmode="decimal" ${lock ? 'disabled' : ''}></td>
          <td class="r num t-strong" style="width:120px" data-line-total="${i}">${eur2(l[1] * l[3])}</td>
          <td style="width:36px">${lock ? '' : `<button class="btn sm ghost del" data-act="del-line" data-id="${x.id}" data-i="${i}" title="Supprimer">${ic('trash')}</button>`}</td></tr>`).join('')}
      </tbody></table></div>
      ${lock ? '' : `<button class="btn sm ghost" style="margin-top:8px" data-act="add-line" data-id="${x.id}">${ic('plus')}Ajouter une ligne</button>`}
      <div class="totals" id="totals">${totalsHtml(x, t)}</div>
      ${x.signature ? `<div class="sig-box"><div><div class="t-strong">Bon pour accord</div><div class="t-sub">Signé électroniquement par ${esc(cl.nom)} le ${new Date().toLocaleDateString('fr-FR')}</div></div><img src="${x.signature}" alt="Signature du client"></div>`
        : lock ? `<div class="sig-box"><div><div class="t-strong">Bon pour accord</div><div class="t-sub">Signé électroniquement par ${esc(cl.nom)}</div></div>${pill('signé', 'green')}</div>` : ''}
      <div class="legal">${TVA_TXT[x.tva]}<br>${esc(D.entreprise.decennale)}.<br>Acompte de 30 % à la signature, solde à la réception des travaux. Paiement en ligne par carte ou virement.</div>
    </div>`;
  }
  const totalsHtml = (x, t) => `
    <div class="money-row"><span>Total HT</span><span class="num">${eur2(t.ht)}</span></div>
    <div class="money-row"><span>TVA ${String(x.tva).replace('.', ',')} %</span><span class="num">${eur2(t.tva)}</span></div>
    <div class="money-row total"><span>Total TTC</span><span class="num">${eur2(t.ttc)}</span></div>
    <div class="money-row t-sub"><span>Acompte à la signature (30 %)</span><span class="num">${eur2(t.ttc * 0.3)}</span></div>`;

  let filtreFacture = 'toutes';
  function pageFactures() {
    const tabs = [['toutes', 'Toutes'], ['envoyée', 'À encaisser'], ['en retard', 'En retard'], ['payée', 'Payées']];
    const list = D.factures.filter((f) => filtreFacture === 'toutes' || f.statut === filtreFacture);
    const sum = (st) => D.factures.filter((f) => f.statut === st).reduce((a, f) => a + f.montantTTC, 0);
    return `
    <div class="page-head"><div><h1>Factures</h1><p>Factures au format électronique (Factur-X), prêtes pour l'obligation de facturation électronique</p></div>
      <button class="btn primary" data-act="toast" data-msg="Une facture se crée en un clic depuis un devis signé ou une situation de chantier.">${ic('plus')}Nouvelle facture</button></div>
    <div class="grid g-3" style="margin-bottom:16px">
      <div class="card kpi"><div class="kpi-label">${ic('clock')}À encaisser</div><div class="kpi-value">${eur(sum('envoyée'))}</div><div class="kpi-sub">Pas encore à échéance (TTC)</div></div>
      <div class="card kpi"><div class="kpi-label">${ic('alert')}En retard</div><div class="kpi-value down">${eur(sum('en retard'))}</div><div class="kpi-sub">Relance automatique tous les 7 jours</div></div>
      <div class="card kpi"><div class="kpi-label">${ic('check')}Encaissé en octobre</div><div class="kpi-value">${eur(sum('payée'))}</div><div class="kpi-sub">Acomptes payés en ligne (TTC)</div></div>
    </div>
    <div class="card"><div class="tabs">${tabs.map(([k, l]) => `<button class="${filtreFacture === k ? 'on' : ''}" data-act="filtre-facture" data-v="${k}">${l}</button>`).join('')}</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Numéro</th><th>Client et objet</th><th class="hide-m">Échéance</th><th>Statut</th><th class="r">Montant TTC</th><th class="hide-m"></th></tr></thead><tbody>
      ${list.map((f) => `<tr><td><div class="t-strong num">${f.id}</div><span class="einv">${ic('shield')}Factur-X</span></td><td><div class="t-strong">${esc(client(f.client).nom)}</div><div class="t-sub">${esc(f.objet)}</div></td>
        <td class="hide-m t-sub">${fdate(f.echeance)}</td><td>${pill(f.statut, statutFacture(f.statut))}${f.relances ? `<div class="t-sub" style="margin-top:3px">${f.relances} relance${f.relances > 1 ? 's' : ''} envoyée${f.relances > 1 ? 's' : ''}</div>` : ''}</td>
        <td class="r num t-strong">${eur2(f.montantTTC)}</td>
        <td class="r hide-m">${f.statut === 'en retard' ? `<button class="btn sm" data-act="relance" data-id="${f.id}">${ic('send')}Relancer</button>` : f.statut === 'envoyée' ? `<button class="btn sm ghost" data-act="paid" data-id="${f.id}">Marquer payée</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="empty-state">Rien ici.</td></tr>'}
      </tbody></table></div></div>`;
  }

  function pageClients() {
    return `
    <div class="page-head"><div><h1>Clients</h1><p>${D.clients.length} clients</p></div>
      <button class="btn primary" data-act="toast" data-msg="Client ajouté (démo).">${ic('plus')}Nouveau client</button></div>
    <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th class="hide-m">Contact</th><th>Chantiers</th><th class="r">Signé (HT)</th></tr></thead><tbody>
      ${D.clients.map((c) => { const chs = D.chantiers.filter((x) => x.client === c.id); const signe = D.devis.filter((x) => x.client === c.id && x.statut === 'signé').reduce((a, x) => a + totals(x).ht, 0); const first = chs[0]; return `
        <tr class="${first ? 'link' : ''}" ${first ? `data-href="#/chantiers/${first.id}"` : ''}><td><div class="t-strong">${esc(c.nom)}</div><div class="t-sub">${esc(c.adresse)}</div></td>
        <td class="hide-m"><div class="t-sub">${esc(c.tel)}</div><div class="t-sub">${esc(c.email)}</div></td>
        <td>${chs.length ? chs.map((x) => pill(x.statut, statutChantier(x.statut))).join(' ') : '<span class="t-sub">Devis en cours</span>'}</td>
        <td class="r num t-strong">${signe ? eur(signe) : '—'}</td></tr>`; }).join('')}
    </tbody></table></div></div>`;
  }

  function pageRecherche(q) {
    const n = q.toLowerCase();
    const hit = (s) => s.toLowerCase().includes(n);
    const res = [
      ...D.chantiers.filter((c) => hit(c.titre) || hit(client(c.client).nom)).map((c) => [`#/chantiers/${c.id}`, 'site', c.titre, `Chantier · ${client(c.client).nom}`]),
      ...D.salaries.filter((s) => hit(fullName(s)) || hit(s.poste)).map((s) => [`#/equipe/${s.id}`, 'users', fullName(s), s.poste]),
      ...D.devis.filter((x) => hit(x.id) || hit(x.objet) || hit(client(x.client).nom)).map((x) => [`#/devis/${x.id}`, 'quote', `Devis ${x.id}`, x.objet]),
      ...D.factures.filter((f) => hit(f.id) || hit(f.objet)).map((f) => ['#/factures', 'invoice', `Facture ${f.id}`, f.objet]),
    ];
    return `<div class="page-head"><div><h1>Recherche</h1><p>${res.length} résultat${res.length > 1 ? 's' : ''} pour « ${esc(q)} »</p></div></div>
      <div class="card"><div class="list">${res.map(([h, i, t, s]) => `<a class="list-item" href="${h}"><span class="doc-ico">${ic(i)}</span><div class="grow"><div class="t-strong">${esc(t)}</div><div class="t-sub">${esc(s)}</div></div></a>`).join('') || '<div class="empty-state">Aucun résultat.</div>'}</div></div>`;
  }

  const notFound = () => `<div class="empty-state">Page introuvable. <a href="#/tableau" style="color:var(--accent-ink)">Retour au tableau de bord</a></div>`;

  /* ---------- Routeur ---------- */
  const app = document.getElementById('app');
  let searchQ = '';
  function route() {
    const [sec = 'tableau', id] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    renderNav(sec === 'recherche' ? '' : sec);
    const pages = {
      tableau: pageTableau, chantiers: () => (id ? pageChantier(id) : pageChantiers()), planning: pagePlanning,
      equipe: () => (id ? pageSalarie(id) : pageEquipe()), devis: () => (id ? pageDevisDetail(id) : pageDevis()),
      factures: pageFactures, clients: pageClients, recherche: () => pageRecherche(searchQ),
    };
    app.innerHTML = (pages[sec] || notFound)();
    if (sec === 'planning') bindPlanning();
  }
  const rerender = () => { const y = scrollY; route(); scrollTo(0, y); };

  /* ---------- Fenêtres et messages ---------- */
  function toast(msg) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = `${ic('check')}${esc(msg)}`;
    document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
  }
  function modal(title, body, foot) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-label="${esc(title)}"><div class="modal-head"><h3>${esc(title)}</h3><button class="btn sm ghost" data-close>${ic('x')}</button></div><div class="modal-body">${body}</div><div class="modal-foot">${foot}</div></div>`;
    bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('[data-close]')) bg.remove(); });
    document.body.appendChild(bg);
    return bg;
  }

  function openSignature(id) {
    const x = devis(id);
    const m = modal('Signature du client', `<p class="t-sub" style="margin:0 0 10px">${esc(client(x.client).nom)} signe ici avec le doigt ou la souris. Montant : <b>${eur2(totals(x).ttc)} TTC</b>.</p><canvas class="pad"></canvas>`,
      `<button class="btn ghost" data-clear>Effacer</button><button class="btn primary" data-ok>${ic('check')}Valider la signature</button>`);
    const cv = m.querySelector('canvas'), r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f1419';
    let draw = false, used = false;
    const pos = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', (e) => { draw = true; used = true; cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); });
    cv.addEventListener('pointermove', (e) => { if (!draw) return; ctx.lineTo(...pos(e)); ctx.stroke(); });
    cv.addEventListener('pointerup', () => { draw = false; });
    m.querySelector('[data-clear]').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); used = false; };
    m.querySelector('[data-ok]').onclick = () => {
      if (!used) { toast('Le client doit signer avant de valider.'); return; }
      x.signature = cv.toDataURL('image/png'); x.statut = 'signé'; m.remove(); rerender();
      toast('Devis signé. Le chantier et la facture d\'acompte sont prêts.');
    };
  }

  function openAddPerson() {
    const m = modal('Ajouter un salarié', `
      <div class="field"><label>Photo</label><input type="file" accept="image/*" data-photo></div>
      <div class="grid g-2" style="gap:12px"><div class="field"><label>Prénom</label><input data-f="prenom" placeholder="Camille"></div><div class="field"><label>Nom</label><input data-f="nom" placeholder="Bernard"></div></div>
      <div class="field"><label>Poste</label><input data-f="poste" placeholder="Peintre en bâtiment"></div>
      <div class="grid g-2" style="gap:12px"><div class="field"><label>Contrat</label><select data-f="contrat"><option>CDI</option><option>CDD</option><option>Apprentissage</option><option>Intérim</option></select></div>
      <div class="field"><label>Salaire brut mensuel (€)</label><input data-f="salaire" inputmode="numeric" placeholder="2200"></div></div>`,
      `<button class="btn ghost" data-close>Annuler</button><button class="btn primary" data-ok>${ic('check')}Créer la fiche</button>`);
    let photo = null;
    m.querySelector('[data-photo]').onchange = (e) => { const f = e.target.files[0]; if (f) photo = URL.createObjectURL(f); };
    m.querySelector('[data-ok]').onclick = () => {
      const v = (k) => m.querySelector(`[data-f="${k}"]`).value.trim();
      if (!v('prenom') || !v('nom') || !v('poste')) { toast('Prénom, nom et poste sont obligatoires.'); return; }
      const id = (v('prenom') + v('nom')).toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + Date.now() % 1000;
      D.salaries.push({ id, prenom: v('prenom'), nom: v('nom'), poste: v('poste'), photo, contrat: v('contrat'), entree: D.aujourdhui, salaire: Number(v('salaire')) || null,
        tel: '—', email: '—', urgence: '—', cp: 0, heures: 0, docs: [{ nom: 'Carte BTP', exp: '2026-11-30' }, { nom: 'Visite médicale d\'embauche', exp: '2026-11-15' }] });
      m.remove(); location.hash = `#/equipe/${id}`;
      toast('Fiche créée. Pensez à la carte BTP et à la visite médicale.');
    };
  }

  /* ---------- Planning : glisser-déposer ---------- */
  function bindPlanning() {
    let from = null;
    app.querySelectorAll('.chip[draggable]').forEach((ch) => {
      ch.addEventListener('dragstart', (e) => { from = { s: ch.dataset.s, j: +ch.dataset.j }; ch.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      ch.addEventListener('dragend', () => ch.classList.remove('dragging'));
    });
    app.querySelectorAll('.cell').forEach((cell) => {
      cell.addEventListener('dragover', (e) => { e.preventDefault(); cell.classList.add('over'); });
      cell.addEventListener('dragleave', () => cell.classList.remove('over'));
      cell.addEventListener('drop', (e) => {
        e.preventDefault(); cell.classList.remove('over'); if (!from) return;
        const to = { s: cell.dataset.s, j: +cell.dataset.j };
        if (to.s === from.s && to.j === from.j) return;
        const target = D.planning[to.s][to.j];
        if (target === 'ecole' || target === 'conge') { toast('Cette personne n\'est pas disponible ce jour-là.'); return; }
        const moved = D.planning[from.s][from.j];
        D.planning[to.s][to.j] = moved; D.planning[from.s][from.j] = target;
        rerender(); toast(`${salarie(to.s).prenom} est sur « ${chantier(moved).titre} » ${JOURS[to.j].toLowerCase()} nov. Il est prévenu sur son téléphone.`);
      });
    });
  }

  /* ---------- Actions ---------- */
  document.addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-href]');
    if (row && !e.target.closest('button,a,input')) { location.hash = row.dataset.href; return; }
    const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
    const a = el.dataset.act;
    if (a === 'toast') toast(el.dataset.msg);
    if (a === 'filtre-chantier') { filtreChantier = el.dataset.v; rerender(); }
    if (a === 'filtre-facture') { filtreFacture = el.dataset.v; rerender(); }
    if (a === 'step') { const c = chantier(el.dataset.c), st = c.etapes[+el.dataset.i]; st[1] = !st[1]; rerender(); toast(st[1] ? 'Étape terminée. Le client la voit dans son suivi.' : 'Étape rouverte.'); }
    if (a === 'toggle-salary') { salaireVisible[el.dataset.id] = !salaireVisible[el.dataset.id]; rerender(); }
    if (a === 'conge') { const c = D.conges.find((x) => x.salarie === el.dataset.s && x.statut === 'en attente'); c.statut = el.dataset.v; rerender(); toast(`Demande ${el.dataset.v === 'validé' ? 'validée' : 'refusée'}. ${salarie(c.salarie).prenom} est prévenu.`); }
    if (a === 'add-person') openAddPerson();
    if (a === 'new-quote') {
      const n = 119 + D.devis.filter((x) => x.nouveau).length;
      const x = { id: `D-2026-${n}`, client: 'bernard', objet: 'Nouveau devis', date: D.aujourdhui, statut: 'brouillon', tva: 10, nouveau: true, lignes: [['', 1, 'u', 0]] };
      D.devis.unshift(x); location.hash = `#/devis/${x.id}`;
    }
    if (a === 'add-line') { devis(el.dataset.id).lignes.push(['', 1, 'u', 0]); rerender(); const ins = app.querySelectorAll('.qtable tbody tr:last-child input'); ins[0]?.focus(); }
    if (a === 'del-line') { const x = devis(el.dataset.id); x.lignes.splice(+el.dataset.i, 1); rerender(); }
    if (a === 'send-quote') { const x = devis(el.dataset.id); x.statut = 'envoyé'; rerender(); toast('Devis envoyé par e-mail. Le client peut le signer en ligne.'); }
    if (a === 'sign') openSignature(el.dataset.id);
    if (a === 'print') window.print();
    if (a === 'relance') { const f = D.factures.find((x) => x.id === el.dataset.id); f.relances = (f.relances || 0) + 1; rerender(); toast(`Relance envoyée à ${client(f.client).nom}, avec le lien de paiement.`); }
    if (a === 'paid') { const f = D.factures.find((x) => x.id === el.dataset.id); f.statut = 'payée'; rerender(); toast('Facture marquée comme payée.'); }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.act === 'line') {
      const x = devis(el.dataset.id), l = x.lignes[+el.dataset.i], k = +el.dataset.k;
      l[k] = k === 1 || k === 3 ? Number(el.value.replace(',', '.').replace(/\s/g, '')) || 0 : el.value;
      app.querySelector(`[data-line-total="${el.dataset.i}"]`).textContent = eur2(l[1] * l[3]);
      document.getElementById('totals').innerHTML = totalsHtml(x, totals(x));
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.act === 'tva') { devis(el.dataset.id).tva = Number(el.value); rerender(); }
  });

  /* ---------- Recherche ---------- */
  const sb = document.getElementById('search');
  sb.innerHTML = `${ic('search')}<input type="search" placeholder="Rechercher un chantier, un salarié, un devis…" aria-label="Rechercher">`;
  let tm;
  sb.querySelector('input').addEventListener('input', (e) => {
    clearTimeout(tm);
    tm = setTimeout(() => { searchQ = e.target.value.trim(); if (searchQ.length >= 2) { if (location.hash !== '#/recherche') location.hash = '#/recherche'; else route(); } }, 180);
  });

  window.addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
  route();
})();
