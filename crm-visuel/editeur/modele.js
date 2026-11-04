// Modèle de données de l'éditeur de maquette (format décrit dans FORMAT.md) : création, nettoyage, historique,
// sauvegarde locale. Module ES sans dépendance.
import { MODELES, TYPES } from './catalogue.js';

export const FORMAT = 'crm-visuel-maquette', VERSION = 1, CLE_LOCALE = 'crm-visuel-editeur-v1';
const r3 = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : d; };
const pt = (p) => ({ x: r3(p && p.x), y: r3(p && p.y) });
const txt = (s, d = '') => (typeof s === 'string' ? s.slice(0, 120) : d);
const coul = (s, d) => (/^#[0-9a-f]{6}$/i.test(s || '') ? s.toLowerCase() : d);
const borne = (v, a, b, d) => Math.max(a, Math.min(b, r3(v, d)));

export function vide() {
  return { format: FORMAT, version: VERSION, nom: 'Nouvelle maquette', unite: 'm', modifie: new Date().toISOString(),
    reglages: { hauteurMurs: 2.8, epaisseurMurs: 0.2, grille: 0.1 }, plan: null, murs: [], ouvertures: [], zones: [], objets: [],
    calques: { plan: true, murs: true, zones: true, objets: true } };
}

// Nettoie un projet lu (fichier, sauvegarde) : valeurs bornées, champs manquants remplis, inconnus retirés.
export function normaliser(d) {
  if (!d || typeof d !== 'object') throw new Error('Fichier illisible');
  if (d.format && d.format !== FORMAT) throw new Error('Ce fichier n\'est pas une maquette de l\'éditeur');
  const v = vide(), R = d.reglages || {};
  v.nom = txt(d.nom, v.nom); v.modifie = txt(d.modifie, v.modifie);
  v.reglages = { hauteurMurs: borne(R.hauteurMurs, 1, 12, 2.8), epaisseurMurs: borne(R.epaisseurMurs, 0.05, 1.5, 0.2), grille: borne(R.grille, 0.01, 1, 0.1) };
  const P = d.plan;
  if (P && typeof P.image === 'string' && P.image.startsWith('data:image/')) {
    const rc = P.recadrage || {};
    v.plan = { image: P.image, largeurPx: Math.max(1, Math.round(P.largeurPx || 1)), hauteurPx: Math.max(1, Math.round(P.hauteurPx || 1)),
      echelle: borne(P.echelle, 1e-5, 10, 0.01), x: r3(P.x), y: r3(P.y), rotation: borne(P.rotation, -360, 360, 0), opacite: borne(P.opacite, 0, 1, 0.5),
      recadrage: { gauche: borne(rc.gauche, 0, 0.45, 0), droite: borne(rc.droite, 0, 0.45, 0), haut: borne(rc.haut, 0, 0.45, 0), bas: borne(rc.bas, 0, 0.45, 0) },
      echelleFixee: !!P.echelleFixee };
  }
  const ids = new Set(), id = (x, pre) => { let s = txt(x).replace(/[^\w-]/g, ''); if (!s || ids.has(s)) { let n = 1; while (ids.has(pre + n)) n++; s = pre + n; } ids.add(s); return s; };
  v.murs = (Array.isArray(d.murs) ? d.murs : []).filter((m) => m && m.a && m.b).map((m) => ({ id: id(m.id, 'm'), a: pt(m.a), b: pt(m.b), epaisseur: borne(m.epaisseur, 0.05, 1.5, v.reglages.epaisseurMurs) }));
  const murs = new Set(v.murs.map((m) => m.id));
  v.ouvertures = (Array.isArray(d.ouvertures) ? d.ouvertures : []).filter((o) => o && murs.has(o.mur)).map((o) => {
    const porte = o.type !== 'fenetre';
    return { id: id(o.id, 'ou'), type: porte ? 'porte' : 'fenetre', mur: o.mur, position: borne(o.position, 0, 1000, 0), largeur: borne(o.largeur, 0.3, 20, porte ? 0.9 : 1.2),
      hauteur: borne(o.hauteur, 0.2, 10, porte ? 2.1 : 1.2), allege: porte ? 0 : borne(o.allege, 0, 5, 0.9) };
  });
  v.zones = (Array.isArray(d.zones) ? d.zones : []).filter((z) => z && Array.isArray(z.points) && z.points.length >= 3).map((z) => ({ id: id(z.id, 'z'), nom: txt(z.nom, 'Zone'), type: txt(z.type, 'zone') || 'zone', couleur: coul(z.couleur, '#60a5fa'), points: z.points.map(pt) }));
  v.objets = (Array.isArray(d.objets) ? d.objets : []).filter((o) => o && MODELES[o.modele] && !MODELES[o.modele].outil).map((o) => {
    const M = MODELES[o.modele];
    return { id: id(o.id, 'o'), modele: o.modele, type: TYPES.includes(o.type) ? o.type : M.type, nom: txt(o.nom, M.nom), x: r3(o.x), y: r3(o.y), rotation: r3(((r3(o.rotation) % 360) + 360) % 360),
      largeur: borne(o.largeur, 0.05, 100, M.l), profondeur: borne(o.profondeur, 0.05, 100, M.p), hauteur: borne(o.hauteur, 0.01, 20, M.h), couleur: coul(o.couleur, M.couleur),
      donnees: o.donnees && typeof o.donnees === 'object' && !Array.isArray(o.donnees) ? JSON.parse(JSON.stringify(o.donnees)) : {} };
  });
  const C = d.calques || {}; for (const k of Object.keys(v.calques)) v.calques[k] = C[k] !== false;
  return v;
}

export function nouvelId(doc, pre) { const tous = new Set([...doc.murs, ...doc.ouvertures, ...doc.zones, ...doc.objets].map((e) => e.id)); let n = 1; while (tous.has(pre + n)) n++; return pre + n; }

export function nouvelObjet(doc, modele, x, y) {
  const M = MODELES[modele], meme = doc.objets.filter((o) => o.modele === modele).length;
  return { id: nouvelId(doc, 'o'), modele, type: M.type, nom: M.nom.replace(/ \(.*\)$/, '') + ' ' + (meme + 1), x: r3(x), y: r3(y), rotation: 0, largeur: M.l, profondeur: M.p, hauteur: M.h, couleur: M.couleur, donnees: {} };
}

// copie profonde ; les chaînes (dont l'image du plan) sont partagées, pas recopiées
export function cloner(v) { if (Array.isArray(v)) return v.map(cloner); if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = cloner(v[k]); return o; } return v; }

export function creerHistorique(max = 120) {
  let pile = [], i = -1;
  return {
    pousser(doc) { pile = pile.slice(0, i + 1); pile.push(cloner(doc)); if (pile.length > max) pile.shift(); i = pile.length - 1; },
    annuler() { if (i <= 0) return null; i--; return cloner(pile[i]); },
    retablir() { if (i >= pile.length - 1) return null; i++; return cloner(pile[i]); },
    get peutAnnuler() { return i > 0; }, get peutRetablir() { return i < pile.length - 1; },
  };
}

export function versJSON(doc) { return JSON.stringify(normaliser(doc), null, 2); }

// sauvegarde locale ; si le plan est trop lourd pour le navigateur, on garde tout sauf l'image
export function sauverLocal(doc) {
  try { localStorage.setItem(CLE_LOCALE, JSON.stringify(doc)); return 'ok'; }
  catch (e) { try { localStorage.setItem(CLE_LOCALE, JSON.stringify({ ...doc, plan: null })); return 'sans-plan'; } catch (e2) { return 'non'; } }
}
export function lireLocal() { try { const s = localStorage.getItem(CLE_LOCALE); return s ? normaliser(JSON.parse(s)) : null; } catch (e) { return null; } }

// géométrie utile partout
export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
export function surface(points) { let s = 0; for (let k = 0; k < points.length; k++) { const a = points[k], b = points[(k + 1) % points.length]; s += a.x * b.y - b.x * a.y; } return Math.abs(s) / 2; }
export function centre(points) { let x = 0, y = 0; for (const p of points) { x += p.x; y += p.y; } return { x: x / points.length, y: y / points.length }; }

// Un mur et ses ouvertures : longueur, direction unitaire, ouvertures triées et bornées [debut, fin] le long du mur.
export function geometrieMur(mur, ouvertures) {
  const L = dist(mur.a, mur.b), ux = L ? (mur.b.x - mur.a.x) / L : 1, uy = L ? (mur.b.y - mur.a.y) / L : 0;
  const ouv = ouvertures.filter((o) => o.mur === mur.id).map((o) => { const w = Math.min(o.largeur, L), p = Math.max(w / 2, Math.min(L - w / 2, o.position)); return { o, debut: p - w / 2, fin: p + w / 2 }; }).sort((a, b) => a.debut - b.debut);
  return { L, ux, uy, nx: -uy, ny: ux, ouv };
}
// projette un point sur un segment : t (m depuis a), distance
export function projeter(p, a, b) { const L = dist(a, b) || 1e-9, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L; const t = Math.max(0, Math.min(L, (p.x - a.x) * ux + (p.y - a.y) * uy)); return { t, d: Math.hypot(a.x + ux * t - p.x, a.y + uy * t - p.y), x: a.x + ux * t, y: a.y + uy * t }; }
