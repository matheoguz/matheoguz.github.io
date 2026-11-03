// CV et lettres de motivation en PDF, fabriqués dans le navigateur à partir des données fictives des démos
// (générateur maison pdf.js, aucune librairie en ligne). Aperçu intégré (iframe sur un blob) et téléchargement.
//
//   const blob = await cvPdf({ nom, titre, pour, ville, email, telephone, profil, xp, formation, competences, langues, permis, couleur })
//     xp = [[de, a, intitulé, employeur, [points]]] · formation = [[année, diplôme, établissement]]
//   const blob = await lettrePdf({ nom, ville, email, dest: [lignes], lieuDate, objet, salutation, paragraphes, couleur })
//   ouvrirPdf(blob, 'CV - Léa Bonnet.pdf', 'CV de Léa Bonnet')   // fenêtre d'aperçu (Télécharger, Ouvrir, Fermer)
//   telechargerPdf(blob, 'CV - Léa Bonnet.pdf')

import { creerPdf } from './pdf.js';
import { photo } from './page.js';
import { fenetre } from './commun.js';

const MENTION = 'Document fictif · démonstration : personne, coordonnées et parcours sont inventés.';
const initiales = (n) => n.split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();

async function octetsPhoto(nom) {
  const u = photo(nom); if (!u) return null;
  try { const r = await fetch(u); if (!r.ok) return null; return new Uint8Array(await r.arrayBuffer()); } catch { return null; }
}

export async function cvPdf(p) {
  const C = p.couleur || '#1e3a8a', d = creerPdf({ titre: `CV de ${p.nom} (fictif)`, auteur: 'Démonstration CRM visuel 3D' });
  const img = await octetsPhoto(p.nom);
  const SB = 196, X = SB + 30, XD = 567, LM = XD - X;
  let y = 0;
  function cadre() {
    d.page(); d.rect(0, 0, SB, d.HAUT, C);
    d.rect(0, d.HAUT - 34, d.LARG, 34, '#f1f5f9'); d.texte(d.LARG / 2, d.HAUT - 14, MENTION, { taille: 7.5, couleur: '#475569', align: 'centre' });
  }
  cadre();
  // colonne de gauche
  if (img) { try { d.cercle(SB / 2, 96, 58, '#ffffff'); d.image(img, SB / 2 - 55, 41, 110, 110, { rond: true }); } catch { d.cercle(SB / 2, 96, 55, '#ffffff'); d.texte(SB / 2, 108, initiales(p.nom), { taille: 34, gras: true, couleur: C, align: 'centre' }); } }
  else { d.cercle(SB / 2, 96, 55, '#ffffff'); d.texte(SB / 2, 108, initiales(p.nom), { taille: 34, gras: true, couleur: C, align: 'centre' }); }
  let g = 190;
  const titreG = (t) => { d.texte(24, g, t.toUpperCase(), { taille: 8.5, gras: true, couleur: '#ffffff' }); d.trait(24, g + 6, SB - 24, g + 6, '#ffffff', 0.5); g += 22; };
  const ligneG = (t) => { g = d.paragraphe(24, g, SB - 48, t, { taille: 9, couleur: '#e2e8f0', interligne: 1.35 }) + 3; };
  titreG('Coordonnées'); [p.ville, p.email, p.telephone].filter(Boolean).forEach(ligneG); g += 12;
  if (p.competences?.length) { titreG('Compétences'); p.competences.forEach((c) => ligneG('• ' + c)); g += 12; }
  if (p.langues?.length) { titreG('Langues'); p.langues.forEach(ligneG); g += 12; }
  if (p.permis) { titreG('Permis'); ligneG(p.permis); }
  // colonne principale
  y = 74;
  d.texte(X, y, p.nom, { taille: 26, gras: true, couleur: '#0f172a' }); y += 22;
  d.texte(X, y, p.titre, { taille: 12.5, gras: true, couleur: C }); y += 14;
  if (p.pour) { y = d.paragraphe(X, y + 2, LM, p.pour, { taille: 9, couleur: '#64748b' }); }
  y += 6; d.trait(X, y, XD, y, '#cbd5e1', 0.8); y += 24;
  const besoin = (h) => { if (y + h > d.HAUT - 52) { cadre(); y = 60; } };
  const section = (t) => { besoin(40); d.texte(X, y, t.toUpperCase(), { taille: 10, gras: true, couleur: C }); d.rect(X, y + 5, 26, 2, C); y += 22; };
  if (p.profil) { section('Profil'); y = d.paragraphe(X, y, LM, p.profil, { taille: 10, couleur: '#334155' }) + 12; }
  if (p.xp?.length) {
    section('Expérience professionnelle');
    for (const [de, a, t, o, pts = []] of p.xp) {
      besoin(48);
      const dates = a ? `${de} – ${a}` : de, wd = d.largeur(dates, 9);
      y = d.paragraphe(X, y, LM - wd - 12, t, { taille: 10.5, gras: true }) - 10.5 * 1.38;
      d.texte(XD, y, dates, { taille: 9, couleur: '#64748b', align: 'droite' }); y += 14;
      y = d.paragraphe(X, y, LM, o, { taille: 9.5, couleur: '#64748b' }) + 1;
      for (const x of pts) { besoin(14); d.texte(X + 2, y, '•', { taille: 9.5, couleur: C }); y = d.paragraphe(X + 12, y, LM - 12, x, { taille: 9.5, couleur: '#334155' }); }
      y += 10;
    }
  }
  if (p.formation?.length) {
    section('Formation');
    for (const [an, dip, o] of p.formation) {
      besoin(32);
      const wd = d.largeur(String(an), 9);
      y = d.paragraphe(X, y, LM - wd - 12, dip, { taille: 10.5, gras: true }) - 10.5 * 1.38;
      d.texte(XD, y, String(an), { taille: 9, couleur: '#64748b', align: 'droite' }); y += 14;
      y = d.paragraphe(X, y, LM, o, { taille: 9.5, couleur: '#64748b' }) + 10;
    }
  }
  return d.blob();
}

export async function lettrePdf(p) {
  const C = p.couleur || '#1e3a8a', d = creerPdf({ titre: `Lettre de motivation de ${p.nom} (fictive)`, auteur: 'Démonstration CRM visuel 3D' });
  d.page(); d.rect(0, 0, d.LARG, 8, C);
  d.rect(0, d.HAUT - 34, d.LARG, 34, '#f1f5f9'); d.texte(d.LARG / 2, d.HAUT - 14, MENTION, { taille: 7.5, couleur: '#475569', align: 'centre' });
  const X = 64, XD = 531, L = XD - X;
  let y = 64;
  d.texte(X, y, p.nom, { taille: 13, gras: true }); y += 15;
  [p.ville, p.email, p.telephone].filter(Boolean).forEach((t) => { d.texte(X, y, t, { taille: 9.5, couleur: '#475569' }); y += 13; });
  let yd = y + 18;
  (p.dest || []).forEach((t, i) => { d.texte(XD, yd, t, { taille: 10, gras: i === 0, align: 'droite' }); yd += 14; });
  y = yd + 16; d.texte(XD, y, p.lieuDate, { taille: 10, couleur: '#475569', align: 'droite' }); y += 34;
  y = d.paragraphe(X, y, L, p.objet, { taille: 10.5, gras: true }) + 14;
  d.texte(X, y, p.salutation || 'Madame, Monsieur,', { taille: 10.5 }); y += 22;
  for (const para of p.paragraphes || []) { y = d.paragraphe(X, y, L, para, { taille: 10.5, couleur: '#1e293b', interligne: 1.45 }) + 10; if (y > d.HAUT - 90) { d.page(); y = 64; } }
  y += 10; d.texte(XD, y, p.nom, { taille: 10.5, gras: true, align: 'droite' });
  return d.blob();
}

export function telechargerPdf(blob, fichier) {
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = fichier; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}

let urlOuverte = null;
export function ouvrirPdf(blob, fichier, titre) {
  if (urlOuverte) URL.revokeObjectURL(urlOuverte);
  const u = urlOuverte = URL.createObjectURL(blob);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  fenetre.ouvrir({
    titre, large: true, cle: 'pdf',
    sous: 'PDF fabriqué à l\'instant dans votre navigateur, à partir de la fiche · document fictif',
    // les navigateurs sans lecteur PDF intégré (Chrome sur Android, par exemple) ne l'affichent pas dans la page
    corps: navigator.pdfViewerEnabled === false
      ? `<div class="pdf-sans"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg><b>${esc(fichier)}</b><p>Le PDF est prêt (${Math.max(1, Math.round(blob.size / 1024))} ko). Ce navigateur n'affiche pas les PDF dans la page : ouvrez-le ou téléchargez-le avec les boutons ci-dessous.</p></div>`
      : `<iframe class="pdf-cadre" src="${u}#view=FitH" title="${esc(titre)}"></iframe>`,
    pied: `<a class="pg-bt prim" href="${u}" download="${esc(fichier)}" data-pdf-dl>Télécharger le PDF</a><a class="pg-bt" href="${u}" target="_blank" rel="noopener">Ouvrir dans un onglet</a>`,
  });
}
