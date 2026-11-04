// Démo supermarché : bon de commande de réassort. La démo ne passe AUCUNE commande chez un fournisseur :
// elle prépare le bon (pré-rempli, modifiable), puis le gérant l'envoie lui-même depuis son outil habituel
// (PDF, mail préparé, fichier CSV pour son logiciel) et le marque comme envoyé : la livraison est alors suivie.
//
//   FOURNISSEURS_FICHES[rid]   // fournisseur fictif du rayon : { nom, famille, contact, mail (.example), delai, refs }
//   const bc = creerBons({ hh, hTxt, rayon(rid), creneaux() -> [heures], surEnvoi(rid, { palettes, heure, numero, lignes }) -> heure d'envoi ou null, voir(rid) })
//   bc.ouvrir(rid, palettesSuggerees)   // fenêtre du bon de commande
//   bc.bon(rid) · bc.pdf(rid) -> Blob · bc.csv(rid) -> texte · bc.mailto(rid) -> URL   (utilisés aussi par les tests)

import { fenetre } from '../commun.js';
import { creerPdf } from '../pdf.js';
import { telechargerPdf } from '../cv.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const MAGASIN = { nom: 'Hyper Modèle', adresse: 'Adresse du magasin (fictive)', quai: 'Quai de réception, accès livraisons' };
export const MENTION = 'La commande part depuis votre outil habituel ; l\'écran prépare et suit.';

// un fournisseur fictif par famille de rayons (noms, contacts et adresses inventés ; domaine réservé .example)
export const FOURNISSEURS_FICHES = {
  r0: { nom: 'Maraîcher local (fictif)', famille: 'Fruits et légumes', contact: 'Julien Morel', mail: 'commandes@maraicher-local.example', delai: 'Commande avant 10h, livraison l\'après-midi',
    refs: [['FL-POM-01', 'Pommes Golden, colis 13 kg', 0.4], ['FL-TOM-02', 'Tomates grappe, colis 6 kg', 0.35], ['FL-SAL-03', 'Salades batavia, colis de 12', 0.25]] },
  r1: { nom: 'Grossiste épicerie (fictif)', famille: 'Épicerie', contact: 'Anne Lefèvre', mail: 'commandes@grossiste-epicerie.example', delai: 'Livraison sous 2 h dans la journée',
    refs: [['EP-PAT-01', 'Pâtes coquillettes 500 g', 0.4], ['EP-CAF-02', 'Café moulu 250 g', 0.3], ['EP-CON-03', 'Conserves de légumes 400 g', 0.3]] },
  r2: { nom: 'Boissons du Centre (fictif)', famille: 'Boissons', contact: 'Thomas Girard', mail: 'commandes@boissons-du-centre.example', delai: 'Livraison sous 2 h dans la journée',
    refs: [['BO-EAU-01', 'Eau minérale 6 × 1,5 L', 0.5], ['BO-JUS-02', 'Jus d\'orange 1 L', 0.25], ['BO-SOD-03', 'Sodas 6 × 33 cl', 0.25]] },
  r3: { nom: 'Plateforme frais (fictive)', famille: 'Frais et surgelés', contact: 'Isabelle Roux', mail: 'commandes@plateforme-frais.example', delai: 'Deux tournées par jour, matin et fin d\'après-midi',
    refs: [['FR-YAO-01', 'Yaourts nature 4 × 125 g', 0.35], ['FR-LAI-02', 'Lait demi-écrémé 1 L', 0.35], ['FR-SUR-03', 'Légumes surgelés 1 kg', 0.3]] },
  r4: { nom: 'Droguerie Centrale (fictive)', famille: 'Hygiène et entretien', contact: 'Olivier Mercier', mail: 'commandes@droguerie-centrale.example', delai: 'Livraison sous 2 h dans la journée',
    refs: [['HY-LES-01', 'Lessive liquide 2 L', 0.35], ['HY-PAP-02', 'Papier toilette, paquet de 12', 0.4], ['HY-GEL-03', 'Gel douche 250 ml', 0.25]] },
  r5: { nom: 'Bazar Distribution (fictif)', famille: 'Maison et bazar', contact: 'Sandrine Petit', mail: 'commandes@bazar-distribution.example', delai: 'Livraison sous 2 h dans la journée',
    refs: [['BZ-PIL-01', 'Piles AA, lot de 4', 0.3], ['BZ-AMP-02', 'Ampoules LED E27', 0.35], ['BZ-SAC-03', 'Sacs congélation, boîte de 50', 0.35]] },
};

const IC = {
  pdf: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6M9 15l3 3 3-3"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  csv: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>',
  ok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
};

export function creerBons({ hh, hTxt, rayon, creneaux, surEnvoi, voir = () => {}, surModif = () => {} }) {
  const bons = {}; let num = 0, ouvert = null;
  const jour = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const jourIso = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; };
  const total = (b) => b.lignes.reduce((n, l) => n + l.q, 0);

  function preparer(rid, suggestion) {
    const f = FOURNISSEURS_FICHES[rid], c = creneaux();
    let reste = suggestion;
    const lignes = f.refs.map(([ref, lib, part], i) => { const q = i === f.refs.length - 1 ? Math.max(0, reste) : Math.round(suggestion * part); reste -= q; return { ref, lib, q }; });
    return { rid, numero: `BC-${jourIso()}-${String(++num).padStart(3, '0')}`, lignes, heure: c[0], envoye: null, sugg: suggestion };
  }
  const bon = (rid) => bons[rid];

  // ---------- sorties : PDF, CSV, mail ----------
  function pdf(rid) {
    const b = bons[rid], f = FOURNISSEURS_FICHES[rid], r = rayon(rid);
    const d = creerPdf({ titre: `Bon de commande ${b.numero}`, auteur: MAGASIN.nom }).page();
    const X = 56, XD = d.LARG - 56;
    d.rect(0, 0, d.LARG, 6, '#2563eb');
    d.texte(X, 64, 'Bon de commande', { taille: 22, gras: true });
    d.texte(XD, 64, b.numero, { taille: 11, gras: true, align: 'droite' });
    d.texte(XD, 80, `Établi le ${jour()}`, { taille: 9.5, couleur: '#64748b', align: 'droite' });
    d.texte(X, 84, 'Document de démonstration · magasin, fournisseur et produits fictifs', { taille: 9, couleur: '#b45309' });
    let y = 120;
    d.rect(X, y, 230, 92, '#f1f5f9'); d.rect(X + 250, y, XD - X - 250, 92, '#f1f5f9');
    d.texte(X + 12, y + 18, 'MAGASIN', { taille: 8, gras: true, couleur: '#64748b' });
    d.texte(X + 12, y + 36, MAGASIN.nom, { taille: 11, gras: true });
    d.texte(X + 12, y + 52, MAGASIN.adresse, { taille: 9.5 });
    d.texte(X + 12, y + 66, MAGASIN.quai, { taille: 9.5 });
    d.texte(X + 12, y + 80, `Rayon : ${r.nom}`, { taille: 9.5 });
    d.texte(X + 262, y + 18, 'FOURNISSEUR', { taille: 8, gras: true, couleur: '#64748b' });
    d.texte(X + 262, y + 36, f.nom, { taille: 11, gras: true });
    d.texte(X + 262, y + 52, `Contact : ${f.contact}`, { taille: 9.5 });
    d.texte(X + 262, y + 66, f.mail, { taille: 9.5 });
    d.texte(X + 262, y + 80, f.delai, { taille: 9, couleur: '#475569' });
    y += 120;
    d.texte(X, y, `Livraison souhaitée : aujourd'hui (${jour()}) à ${hTxt(b.heure)}, au quai de réception`, { taille: 10.5, gras: true });
    y += 24;
    d.rect(X, y, XD - X, 24, '#0f172a');
    d.texte(X + 10, y + 16, 'Référence', { taille: 9, gras: true, couleur: '#ffffff' });
    d.texte(X + 110, y + 16, 'Désignation', { taille: 9, gras: true, couleur: '#ffffff' });
    d.texte(XD - 10, y + 16, 'Quantité (palettes)', { taille: 9, gras: true, couleur: '#ffffff', align: 'droite' });
    y += 24;
    b.lignes.forEach((l, i) => {
      if (i % 2) d.rect(X, y, XD - X, 24, '#f8fafc');
      d.texte(X + 10, y + 16, l.ref, { taille: 9.5 });
      d.texte(X + 110, y + 16, l.lib, { taille: 9.5 });
      d.texte(XD - 10, y + 16, String(l.q), { taille: 9.5, gras: true, align: 'droite' });
      y += 24;
    });
    d.trait(X, y, XD, y, '#0f172a', 1);
    d.texte(X + 110, y + 18, 'Total', { taille: 10, gras: true });
    d.texte(XD - 10, y + 18, `${total(b)} palette${total(b) > 1 ? 's' : ''}`, { taille: 10, gras: true, align: 'droite' });
    y += 56;
    y = d.paragraphe(X, y, XD - X, 'Merci de confirmer la commande et l\'heure de livraison par retour de mail. Les quantités sont exprimées en palettes complètes.', { taille: 9.5, couleur: '#334155' });
    y += 8;
    d.paragraphe(X, y, XD - X, `${MENTION} Ce bon a été préparé par l'écran du magasin à partir du stock du rayon ; il est envoyé par le magasin lui-même.`, { taille: 9, couleur: '#64748b' });
    d.texte(X, d.HAUT - 40, 'CRM visuel 3D · démonstration · aucune commande réelle', { taille: 8, couleur: '#94a3b8' });
    return d.blob();
  }
  function csv(rid) {
    const b = bons[rid], f = FOURNISSEURS_FICHES[rid], r = rayon(rid);
    const c = (v) => { const s = String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const t = [['numero_commande', 'date', 'magasin', 'rayon', 'fournisseur', 'email_fournisseur', 'reference', 'designation', 'quantite_palettes', 'livraison_souhaitee']]
      .concat(b.lignes.filter((l) => l.q > 0).map((l) => [b.numero, jour(), MAGASIN.nom, r.nom, f.nom, f.mail, l.ref, l.lib, l.q, `${jour()} ${hh(b.heure)}`]));
    return '﻿' + t.map((l) => l.map(c).join(';')).join('\r\n') + '\r\n';
  }
  function mailto(rid) {
    const b = bons[rid], f = FOURNISSEURS_FICHES[rid], r = rayon(rid);
    const corps = [`Bonjour ${f.contact},`, '', `Voici notre commande ${b.numero} pour le rayon ${r.nom.toLowerCase()} :`, '',
      ...b.lignes.filter((l) => l.q > 0).map((l) => `- ${l.ref} · ${l.lib} : ${l.q} palette${l.q > 1 ? 's' : ''}`), '',
      `Total : ${total(b)} palette${total(b) > 1 ? 's' : ''}.`, `Livraison souhaitée : aujourd'hui (${jour()}) à ${hTxt(b.heure)}, au quai de réception.`, '',
      'Merci de nous confirmer la commande et l\'heure de livraison.', '', 'Bonne journée,', `${MAGASIN.nom}`, '', '(Bon de commande en pièce jointe.)'].join('\n');
    return `mailto:${f.mail}?subject=${encodeURIComponent(`Commande ${b.numero} · ${MAGASIN.nom} · ${r.nom}`)}&body=${encodeURIComponent(corps)}`;
  }
  function telecharger(contenu, type, nom) {
    const u = URL.createObjectURL(new Blob([contenu], { type })), a = document.createElement('a');
    a.href = u; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // ---------- fenêtre ----------
  function corps(rid) {
    const b = bons[rid], f = FOURNISSEURS_FICHES[rid], r = rayon(rid);
    if (b.envoye) return `<div class="bc"><p class="bc-ok">${IC.ok}<span><b>Commande ${b.numero} marquée comme envoyée à ${hh(b.envoye)}.</b> ${total(b)} palettes chez ${esc(f.nom)}, livraison attendue à ${hTxt(b.heure)} : elle est suivie dans Livraisons, et l'alerte du rayon passe dans « Traité ».</span></p><p class="bc-mention">${MENTION}</p></div>`;
    const opts = creneaux().map((h) => `<option value="${h}" ${h === b.heure ? 'selected' : ''}>aujourd'hui, ${hTxt(h)}</option>`).join('');
    return `<div class="bc">
      <div class="bc-tete"><div><small>Fournisseur (fictif)</small><b>${esc(f.nom)}</b><span>${esc(f.contact)} · ${esc(f.mail)}</span><span>${esc(f.delai)}</span></div>
      <div><small>Pour</small><b>${MAGASIN.nom}</b><span>Rayon ${esc(r.nom.toLowerCase())}</span><span>N° ${b.numero} · ${jour()}</span></div></div>
      <table class="bc-t"><thead><tr><th>Référence</th><th>Désignation</th><th class="num">Palettes</th></tr></thead><tbody>
      ${b.lignes.map((l, i) => `<tr><td>${l.ref}</td><td>${esc(l.lib)}</td><td class="num"><input class="bc-q" type="number" inputmode="numeric" min="0" max="40" step="1" value="${l.q}" data-i="${i}" aria-label="Palettes de ${esc(l.lib)}"></td></tr>`).join('')}
      </tbody><tfoot><tr><td></td><td>Total</td><td class="num"><b id="bc-total">${total(b)} palettes</b></td></tr></tfoot></table>
      <label class="bc-liv"><span>Livraison souhaitée</span><select id="bc-liv">${opts}</select></label>
      <p class="bc-note">Quantités suggérées d'après le stock du rayon (${Math.round(r.stock * 100)} % avant commande) et les livraisons déjà prévues. Modifiables.</p>
      <p class="bc-mention">${MENTION}</p></div>`;
  }
  const pied = (rid) => (bons[rid].envoye
    ? '<button type="button" class="pg-bt prim" data-bc="voir">Voir dans Livraisons</button><button type="button" class="pg-bt" data-bc="fermer">Fermer</button>'
    : `<button type="button" class="pg-bt" data-bc="pdf">${IC.pdf}Télécharger le bon (PDF)</button><a class="pg-bt" id="bc-mail" href="${esc(mailto(rid))}" data-bc="mail">${IC.mail}Préparer le mail au fournisseur</a><button type="button" class="pg-bt" data-bc="csv">${IC.csv}Exporter pour votre logiciel (CSV)</button><button type="button" class="pg-bt prim bc-envoi" data-bc="envoyee" ${total(bons[rid]) ? '' : 'disabled'}>${IC.ok}Marquer comme envoyée</button>`);
  function afficher(rid) {
    ouvert = rid;
    fenetre.ouvrir({ titre: bons[rid].envoye ? 'Commande envoyée' : 'Préparer la commande', sous: `Bon de commande pré-rempli · ${rayon(rid).nom} · données fictives`, corps: corps(rid), pied: pied(rid), cle: 'bc' });
  }
  function ouvrir(rid, suggestion) {
    // même calcul que le bouton de l'alerte : le bon suit la quantité du moment (une retouche devient cette quantité)
    const b0 = bons[rid];
    if (!b0 || b0.envoye) bons[rid] = preparer(rid, suggestion);
    else if (b0.sugg !== suggestion) { const n = preparer(rid, suggestion); n.numero = b0.numero; num--; bons[rid] = n; }
    const c = creneaux(); if (!c.includes(bons[rid].heure)) bons[rid].heure = c[0];
    afficher(rid);
  }
  function majPied() {
    const b = bons[ouvert]; if (!b) return;
    const t = document.getElementById('bc-total'); if (t) t.textContent = `${total(b)} palette${total(b) > 1 ? 's' : ''}`;
    const m = document.getElementById('bc-mail'); if (m) m.href = mailto(ouvert);
    const e = document.querySelector('.fen [data-bc="envoyee"]'); if (e) e.disabled = !total(b);
  }
  document.addEventListener('input', (ev) => {
    if (fenetre.cle() !== 'bc' || !bons[ouvert]) return;
    const q = ev.target.closest('.bc-q'); if (q) { bons[ouvert].lignes[+q.dataset.i].q = Math.max(0, Math.min(40, Math.round(+q.value || 0))); bons[ouvert].sugg = total(bons[ouvert]); majPied(); surModif(ouvert, total(bons[ouvert])); }
  });
  document.addEventListener('change', (ev) => {
    if (fenetre.cle() !== 'bc' || !bons[ouvert]) return;
    if (ev.target.id === 'bc-liv') { bons[ouvert].heure = +ev.target.value; majPied(); }
    const q = ev.target.closest('.bc-q'); if (q) q.value = bons[ouvert].lignes[+q.dataset.i].q;
  });
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-bc]'); if (!a || fenetre.cle() !== 'bc' || !bons[ouvert]) return;
    const rid = ouvert, b = bons[rid], act = a.dataset.bc;
    if (act === 'pdf') telechargerPdf(pdf(rid), `Bon de commande ${b.numero}.pdf`);
    else if (act === 'csv') telecharger(csv(rid), 'text/csv;charset=utf-8', `commande-${b.numero}.csv`);
    else if (act === 'envoyee') { b.envoye = surEnvoi(rid, { palettes: total(b), heure: b.heure, numero: b.numero, lignes: b.lignes.map((l) => ({ ...l })) }); if (b.envoye !== null) afficher(rid); }
    else if (act === 'voir') { fenetre.fermer(); voir(rid); }
    else if (act === 'fermer') fenetre.fermer();
    // 'mail' : le lien mailto s'ouvre dans la messagerie du gérant, qui envoie lui-même
  });
  return { ouvrir, bon, pdf, csv, mailto, fiches: FOURNISSEURS_FICHES };
}
