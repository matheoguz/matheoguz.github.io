/**
 * Flocon — enregistrement des commandes dans un Google Sheet.
 *
 * Installation (une seule fois) :
 * 1. Crée un Google Sheet vide nommé « Flocon commandes ».
 * 2. Menu Extensions > Apps Script, efface le code et colle tout ce fichier.
 * 3. Paramètres du projet (roue dentée) > Propriétés du script > Ajouter :
 *      ADMIN_KEY = un mot de passe long que toi seul connais.
 * 4. Déployer > Nouveau déploiement > type « Application Web »
 *      Exécuter en tant que : Moi
 *      Qui a accès : Tout le monde
 *    Autorise l'accès, puis copie l'URL qui finit par /exec.
 * 5. Donne cette URL à Claude (elle va dans CONFIG.ordersEndpoint de store.js).
 *
 * Après chaque modification de ce code : Déployer > Gérer les déploiements >
 * modifier (crayon) > Version : Nouvelle version > Déployer (l'URL ne change pas).
 *
 * Les prix de vente doivent rester identiques à ceux de flocon/assets/store.js.
 * Les coûts fournisseur ne sont qu'ici : ils ne sont jamais visibles sur le site.
 */

var CATALOG = {
  // id: [nom, prix de vente TTC, coût fournisseur estimé (à corriger avec tes vrais prix)]
  'boules-tradition':  ['Coffret Tradition', 17.90, 4.19],
  'boules-or':         ['Coffret Or', 15.90, 5.49],
  'guirlande-sapin':   ['Guirlande Sapin & Rubans', 29.90, 15.79],
  'couronne-porte':    ['Couronne Sapin & Baies', 24.90, 6.49],
  'chaussette-geante': ['Chaussette de Noël', 9.90, 4.29],
  'boules-givre':      ['Coffret Givre', 17.90, 2.79],
  'guirlande-rideau':  ['Rideau lumineux Étoiles', 19.90, 3.89],
  'guirlande-givre':   ['Guirlande Cristal', 12.90, 3.00],
  'couronne-givre':    ['Couronne Neige', 27.90, 9.00],
  'suspensions-bois':  ['Suspensions en bois', 14.90, 6.49],
  'guirlande-cuivre':  ['Guirlande Fil de cuivre', 9.90, 3.09],
  'bougies-led':       ['Bougies à flamme LED', 14.90, 12.99],
  'calendrier-avent':  ["Calendrier de l'Avent", 16.90, 0],
  'pack-salon':        ['Coffret Salon de Noël', 37.90, 3.89 + 12.99 + 4.29]
};
var SHIPPING_FEE = 4.90;
var FREE_SHIPPING_FROM = 39;
var PAYPAL_RATE = 0.029;   // commission PayPal estimée (vérifie le taux de ton compte)
var PAYPAL_FIXED = 0.35;

var HEADERS = ['Date', 'Référence', 'Statut', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Code postal', 'Ville', 'Pays',
  'Articles', 'Nb articles', 'Sous-total', 'Livraison', 'Total payé', 'Coût fournisseur', 'Frais PayPal', 'Marge', 'Détail JSON'];
var STATUSES = ['En attente de paiement', 'Payée', 'Commandée au fournisseur', 'Expédiée', 'Livrée', 'Annulée'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Commandes') || ss.insertSheet('Commandes');
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max || 200);
}

function round2_(n) { return Math.round(n * 100) / 100; }

function isAdmin_(key) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  return !!expected && key === expected;
}

/** Le site envoie les commandes ici ; le tableau de bord change les statuts ici. */
function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'invalid_json' }); }

  if (body.action === 'status') {
    if (!isAdmin_(body.key)) return json_({ ok: false, error: 'forbidden' });
    if (STATUSES.indexOf(body.status) < 0) return json_({ ok: false, error: 'bad_status' });
    var sh = sheet_();
    var refs = sh.getRange(2, 2, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
    for (var i = 0; i < refs.length; i++) {
      if (refs[i][0] === body.ref) { sh.getRange(i + 2, 3).setValue(body.status); return json_({ ok: true }); }
    }
    return json_({ ok: false, error: 'not_found' });
  }

  if (body.action !== 'order') return json_({ ok: false, error: 'unknown_action' });

  var o = body.order || {}, c = o.customer || {};
  var ref = clean_(o.ref, 30);
  if (!/^FL-[0-9A-Z-]+$/.test(ref)) return json_({ ok: false, error: 'bad_ref' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || '')) return json_({ ok: false, error: 'bad_email' });
  if (!c.first || !c.last || !c.address || !c.zip || !c.city || !c.phone) return json_({ ok: false, error: 'missing_fields' });
  if (!Array.isArray(o.items) || !o.items.length || o.items.length > 20) return json_({ ok: false, error: 'bad_items' });

  // Prix recalculés ici : le total envoyé par le navigateur n'est jamais pris tel quel.
  var lines = [], count = 0, sub = 0, cost = 0;
  for (var j = 0; j < o.items.length; j++) {
    var it = o.items[j], p = CATALOG[it.id], q = Math.floor(Number(it.qty));
    if (!p || !(q >= 1 && q <= 20)) return json_({ ok: false, error: 'bad_item' });
    lines.push(q + ' × ' + p[0]);
    count += q; sub += p[1] * q; cost += p[2] * q;
  }
  sub = round2_(sub);
  var ship = sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  var total = round2_(sub + ship);
  var fees = round2_(total * PAYPAL_RATE + PAYPAL_FIXED);
  var margin = round2_(total - cost - fees);

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh2 = sheet_();
    var existing = sh2.getLastRow() > 1 ? sh2.getRange(2, 2, sh2.getLastRow() - 1, 1).getValues() : [];
    for (var k = 0; k < existing.length; k++) if (existing[k][0] === ref) return json_({ ok: true, ref: ref, duplicate: true, total: total });
    sh2.appendRow([new Date(), ref, STATUSES[0], clean_(c.first, 80), clean_(c.last, 80), clean_(c.email, 120), clean_(c.phone, 40),
      clean_(c.address, 200), clean_(c.zip, 20), clean_(c.city, 80), clean_(c.country, 40),
      lines.join(', '), count, sub, ship, total, round2_(cost), fees, margin, JSON.stringify(o.items)]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, ref: ref, total: total });
}

/** Le tableau de bord lit les commandes ici (clé admin obligatoire). */
function doGet(e) {
  if (!isAdmin_(e.parameter.key)) return json_({ ok: false, error: 'forbidden' });
  var sh = sheet_();
  var values = sh.getDataRange().getValues();
  var head = values.shift();
  var rows = values.map(function (r) {
    var obj = {};
    head.forEach(function (h, i) { obj[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    return obj;
  });
  return json_({ ok: true, statuses: STATUSES, orders: rows.reverse() });
}
