// Exemples de l'éditeur : un plan d'évacuation dessiné au canvas (aucun plan réel) et un petit magasin tout prêt.
import { vide, normaliser } from './modele.js';
import { MODELES } from './catalogue.js';

// Plan dessiné à 40 px par mètre : bâtiment de 20 × 13 m, coin haut gauche à (100, 100) px.
// BARRE = les deux bouts de la barre d'échelle « 10 m » (pixels de l'image), pour régler l'échelle en 2 clics.
export const PX_M = 40, ORIGINE = { x: 100, y: 100 }, BARRE = [{ x: 100, y: 700 }, { x: 500, y: 700 }];
export const COINS = [{ x: 100, y: 100 }, { x: 900, y: 100 }, { x: 900, y: 620 }, { x: 100, y: 620 }];

export function planExemple() {
  const W = 1000, H = 780, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), m = (v) => v * PX_M, X = (x) => ORIGINE.x + m(x), Y = (y) => ORIGINE.y + m(y);
  g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = 1; for (let x = 0; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#111'; g.font = '700 22px Arial'; g.fillText('PLAN D\'ÉVACUATION — exemple (dessiné, pas un vrai plan)', 100, 52);
  g.font = '14px Arial'; g.fillStyle = '#444'; g.fillText('Rez-de-chaussée · Magasin « Le Panier » (fictif)', 100, 76);
  g.strokeStyle = '#111'; g.lineCap = 'square';
  const mur = (a, b, e = 8) => { g.lineWidth = e; g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.lineTo(X(b[0]), Y(b[1])); g.stroke(); };
  // murs extérieurs avec trous (entrée, vitrines, quai) puis cloison de la réserve
  mur([0, 0], [20, 0]); mur([20, 0], [20, 8.75]); mur([20, 11.25], [20, 13]); mur([20, 13], [5.2, 13]); mur([2.8, 13], [0, 13]); mur([0, 13], [0, 0]);
  mur([15, 0], [15, 2.4], 5); mur([15, 3.6], [15, 13], 5);
  g.lineWidth = 3; g.strokeStyle = '#1d4ed8'; for (const [a, b] of [[8, 10], [11, 13]]) { g.beginPath(); g.moveTo(X(a), Y(13)); g.lineTo(X(b), Y(13)); g.stroke(); }
  g.strokeStyle = '#111'; g.lineWidth = 1.5;
  const arc = (cx, cy, r, a0, a1) => { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a0, a1); g.stroke(); };
  arc(X(2.8), Y(13), m(1.2), -Math.PI / 2, 0); arc(X(5.2), Y(13), m(1.2), Math.PI, Math.PI * 1.5);
  arc(X(15), Y(2.4), m(1.2), 0, Math.PI / 2);
  // zones
  g.font = '700 18px Arial'; g.fillStyle = '#333'; g.textAlign = 'center';
  g.fillText('SURFACE DE VENTE', X(7.5), Y(5)); g.fillText('RÉSERVE', X(17.5), Y(6.5)); g.font = '15px Arial'; g.fillText('Caisses', X(9.5), Y(11.3));
  g.setLineDash([6, 5]); g.lineWidth = 1; g.strokeRect(X(0.3), Y(9.6), m(14.4), m(3.1)); g.setLineDash([]);
  // rayons esquissés
  g.strokeStyle = '#777'; g.lineWidth = 1.5; for (const y of [3.2, 5.4, 7.6]) for (const x of [4, 10]) g.strokeRect(X(x - 2), Y(y - 0.45), m(4), m(0.9));
  // sorties de secours
  g.fillStyle = '#15803d'; const fleche = (x, y, dx, dy) => { g.save(); g.translate(X(x), Y(y)); g.rotate(Math.atan2(dy, dx)); g.fillRect(-18, -5, 22, 10); g.beginPath(); g.moveTo(4, -12); g.lineTo(20, 0); g.lineTo(4, 12); g.fill(); g.restore(); };
  fleche(4, 11.8, 0, 1); fleche(19, 10, 1, 0); g.font = '700 12px Arial'; g.fillText('SORTIE', X(4), Y(12.4) - 4); g.fillText('SORTIE', X(18.6), Y(9.6));
  g.fillStyle = '#dc2626'; for (const [x, y] of [[0.4, 9], [14.6, 1], [19.6, 1]]) { g.beginPath(); g.arc(X(x), Y(y), 7, 0, 7); g.fill(); }
  // barre d'échelle
  g.textAlign = 'left'; g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(BARRE[0].x, BARRE[0].y); g.lineTo(BARRE[1].x, BARRE[1].y); g.stroke();
  for (let i = 0; i <= 10; i++) { const x = BARRE[0].x + i * PX_M; g.lineWidth = i % 5 ? 1.5 : 3; g.beginPath(); g.moveTo(x, 700 - (i % 5 ? 6 : 12)); g.lineTo(x, 706); g.stroke(); }
  g.fillStyle = '#111'; g.font = '700 14px Arial'; g.fillText('0', 96, 728); g.fillText('5 m', 288, 728); g.fillText('10 m', 486, 728);
  g.font = '13px Arial'; g.fillStyle = '#555'; g.fillText('Point rouge : extincteur · Flèche verte : sortie de secours', 560, 705);
  return { image: c.toDataURL('image/png'), largeurPx: W, hauteurPx: H };
}

// Le petit magasin d'exemple (mêmes dimensions que le plan) : murs, ouvertures, zones et objets.
export function magasinExemple() {
  const d = vide(); d.nom = 'Magasin d\'exemple « Le Panier »';
  const M = (id, a, b, e = 0.25) => d.murs.push({ id, a: { x: a[0], y: a[1] }, b: { x: b[0], y: b[1] }, epaisseur: e });
  M('m1', [0, 0], [20, 0]); M('m2', [20, 0], [20, 13]); M('m3', [20, 13], [0, 13]); M('m4', [0, 13], [0, 0]); M('m5', [15, 0], [15, 13], 0.15);
  d.ouvertures.push({ id: 'ou1', type: 'porte', mur: 'm3', position: 16, largeur: 2.4, hauteur: 2.3 }, { id: 'ou2', type: 'fenetre', mur: 'm3', position: 11, largeur: 2, hauteur: 1.6, allege: 0.6 },
    { id: 'ou3', type: 'fenetre', mur: 'm3', position: 8, largeur: 2, hauteur: 1.6, allege: 0.6 }, { id: 'ou4', type: 'porte', mur: 'm5', position: 3, largeur: 1.2, hauteur: 2.1 },
    { id: 'ou5', type: 'porte', mur: 'm2', position: 10, largeur: 2.5, hauteur: 2.6 });
  const Z = (id, nom, type, couleur, pts) => d.zones.push({ id, nom, type, couleur, points: pts.map(([x, y]) => ({ x, y })) });
  Z('z1', 'Surface de vente', 'vente', '#60a5fa', [[0, 0], [15, 0], [15, 9.6], [0, 9.6]]);
  Z('z2', 'Accueil et caisses', 'accueil', '#f59e0b', [[0, 9.6], [15, 9.6], [15, 13], [0, 13]]);
  Z('z3', 'Réserve', 'reserve', '#a78bfa', [[15, 0], [20, 0], [20, 13], [15, 13]]);
  let n = 0; const O = (modele, x, y, rotation = 0, plus = {}) => { const m = MODELES[modele]; n++; d.objets.push({ id: 'o' + n, modele, type: m.type, nom: plus.nom || m.nom, x, y, rotation, largeur: plus.largeur || m.l, profondeur: m.p, hauteur: m.h, couleur: plus.couleur || m.couleur, donnees: {} }); };
  ['Frais', 'Laitages', 'Surgelés'].forEach((nom, i) => O('frigo', 2.6 + i * 2.7, 0.55, 0, { nom: 'Froid · ' + nom }));
  [['Épicerie salée', 4, 3.2], ['Épicerie sucrée', 10, 3.2], ['Boissons', 4, 5.4], ['Petit-déjeuner', 10, 5.4], ['Hygiène', 4, 7.6], ['Entretien', 10, 7.6]].forEach(([nom, x, y]) => O('gondole', x, y, 0, { nom: 'Rayon ' + nom, largeur: 4 }));
  O('tete-gondole', 6.45, 5.4, 90, { nom: 'Tête de gondole · promo' });
  [3.5, 5, 6.5].forEach((y, i) => O('bac', 0.65, y, 90, { nom: 'Bac fruits et légumes ' + (i + 1) }));
  O('caisse', 8, 11, 0, { nom: 'Caisse 1' }); O('caisse', 11, 11, 0, { nom: 'Caisse 2' });
  O('repere-poste', 8.4, 12, 0, { nom: 'Poste caisse 1' }); O('comptoir', 14.1, 11.3, 90, { nom: 'Accueil' });
  O('plante', 1.2, 12.2); O('plante', 6.3, 12.3); O('ecran', 13.3, 9.9, 0, { nom: 'Écran promos' });
  O('rack', 19.35, 2, 90, { nom: 'Rack A' }); O('rack', 19.35, 5, 90, { nom: 'Rack B' });
  O('palette', 17, 2.2, 0, { nom: 'Palette arrivage 1' }); O('palette', 17, 3.6, 0, { nom: 'Palette arrivage 2' });
  O('poste-info', 17.5, 12.1, 180, { nom: 'Poste réception' }); O('sanitaires', 17.4, 7.6, 0, { nom: 'Sanitaires' });
  return normaliser(d);
}
