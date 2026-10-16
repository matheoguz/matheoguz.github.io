/* Flocon — données, panier et paiement PayPal (site statique, GitHub Pages) */

/* =========================================================
   CONFIGURATION — à compléter avant d'ouvrir la boutique
   ========================================================= */
var CONFIG = {
  // Mode recommandé : ton "ID de compte marchand" PayPal
  // (PayPal > Paramètres > Infos sur le compte > ID de compte marchand).
  // Avec cet ID, le client paie directement dans PayPal et PayPal
  // te transmet le détail de la commande + l'adresse de livraison.
  paypalMerchantId: '',

  // Solution de secours utilisée tant que paypalMerchantId est vide :
  // lien PayPal.me + récapitulatif de commande envoyé par email.
  paypalMe: 'MatheoGuzzi',
  contactEmail: '', // email où tu reçois les commandes (obligatoire en mode secours)

  shippingFee: 4.90,
  freeShippingFrom: 39,
  deliveryDays: '3 à 7 jours ouvrés',
  christmasDeadline: '15 décembre',
  countries: ['France', 'Belgique', 'Luxembourg']
};

/* Photos libres de droits (licence Unsplash, usage commercial autorisé).
   À remplacer par les photos de ton fournisseur ou de tes échantillons. */
function U(id, w) {
  return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=72';
}

var PRODUCTS = [
  {
    id: 'guirlande-rideau',
    name: 'Rideau lumineux Étoiles',
    short: 'Guirlande rideau LED 3 m pour fenêtre ou mur',
    price: 19.90,
    tag: 'Le plus vu',
    images: ['photo-1681433241280-aae50a102255', 'photo-1608211194323-10b2dda88e25', 'photo-1534780087173-e6bc5e994fe0'],
    desc: "Transforme une fenêtre, une tête de lit ou un mur en ciel étoilé. Le rideau se fixe en deux minutes avec les crochets fournis et s'allume par USB : pas besoin de prise près de la fenêtre, une batterie externe suffit.",
    features: ['3 m de large, 12 fils lumineux tombants', '8 modes : fixe, scintillement, vagues…', 'Alimentation USB + télécommande', 'LED blanc chaud, ne chauffe pas'],
    specs: { 'Dimensions': '300 × 100 cm', 'Lumière': 'LED blanc chaud', 'Alimentation': 'USB 5 V (adaptateur non inclus)', 'Usage': 'Intérieur' }
  },
  {
    id: 'bougies-led',
    name: 'Bougies LED flamme vacillante',
    short: 'Lot de 6, sans flamme, avec minuteur',
    price: 14.90,
    tag: 'Sans danger',
    images: ['photo-1765628710664-dbce4f4d45b5', 'photo-1763290808558-921cf9257bf2', 'photo-1607838660853-a2cf34eec5b9'],
    desc: "L'ambiance d'une vraie bougie, sans le risque. La flamme LED bouge comme une vraie, la cire est véritable, et le minuteur les rallume chaque soir automatiquement. Parfait près du sapin, avec des enfants ou des animaux.",
    features: ['6 bougies en vraie cire (3 tailles)', 'Flamme LED qui vacille', 'Minuteur 6 h allumé / 18 h éteint', 'Fonctionne à piles (non incluses)'],
    specs: { 'Hauteurs': '10, 12,5 et 15 cm', 'Matière': 'Cire de paraffine + LED', 'Piles': '2 × AAA par bougie', 'Usage': 'Intérieur' }
  },
  {
    id: 'couronne-porte',
    name: 'Couronne de porte Sapin & Baies',
    short: 'Couronne 40 cm, nœud velours rouge',
    price: 24.90,
    tag: null,
    images: ['photo-1703187439179-9b8c323294a8', 'photo-1544890930-fa67ca7d3a11', 'photo-1639880005608-6e0688ce2c9c'],
    desc: "La première chose que voient tes invités. Branches de sapin artificiel bien fournies, baies rouges, pommes de pin et un grand nœud en velours. Elle se réutilise d'une année sur l'autre sans perdre ses aiguilles.",
    features: ['Diamètre 40 cm', 'Nœud en velours rouge', 'Pommes de pin et baies décoratives', 'Réutilisable chaque année'],
    specs: { 'Diamètre': '40 cm', 'Matière': 'PVC, velours, éléments naturels', 'Fixation': 'Boucle de suspension', 'Usage': 'Intérieur / porte abritée' }
  },
  {
    id: 'boules-noel',
    name: 'Coffret 24 boules incassables',
    short: 'Rouge, vert et or, finitions mixtes',
    price: 17.90,
    tag: null,
    images: ['photo-1767741857489-b28dcaa531a4', 'photo-1513885251266-04dcfa26e979', 'photo-1609125303972-255c84ac9f01'],
    desc: "De quoi habiller tout un sapin d'un coup. Les boules sont en plastique incassable avec des finitions brillantes, mates et pailletées : elles ont l'air de verre, mais survivent aux chats et aux enfants.",
    features: ['24 boules, 3 tailles (3, 4 et 6 cm)', 'Incassables', 'Finitions brillantes, mates et pailletées', 'Attaches incluses'],
    specs: { 'Quantité': '24 pièces', 'Tailles': '3 / 4 / 6 cm', 'Matière': 'Plastique incassable', 'Coloris': 'Rouge, vert, or' }
  },
  {
    id: 'calendrier-avent',
    name: "Calendrier de l'Avent à remplir",
    short: '24 sachets en tissu + pinces en bois',
    price: 16.90,
    tag: 'Avant le 1er déc.',
    images: ['photo-1764341127020-842a97295c15', 'photo-1606844358484-ab8725cab420', 'photo-1766425221306-4d44f4011d4a'],
    desc: "Tu choisis ce qu'il y a dedans : chocolats, petits mots, bons pour une soirée… 24 sachets en tissu numérotés, une corde et des mini-pinces en bois pour l'accrocher au mur ou sur une cheminée. Réutilisable chaque année.",
    features: ['24 sachets en tissu numérotés', 'Corde 2,5 m + 24 pinces en bois', 'Réutilisable', 'À commander avant mi-novembre pour le 1er décembre'],
    specs: { 'Sachets': '10 × 14 cm', 'Matière': 'Coton / jute', 'Corde': '2,5 m', 'Contenu': 'Sachets vides, à remplir' }
  },
  {
    id: 'chaussette-geante',
    name: 'Chaussette de Noël géante',
    short: 'Tricot rouge et blanc, 45 cm',
    price: 9.90,
    tag: null,
    images: ['photo-1543772857-a9d7ebc0cf63', 'photo-1642335911245-238e13dcabf2'],
    desc: "La chaussette à accrocher à la cheminée, à une étagère ou à la porte de la chambre. Grande taille pour y glisser de vrais cadeaux, tricot doux et revers en fausse fourrure.",
    features: ['Hauteur 45 cm', 'Tricot épais rouge et blanc', 'Revers en fausse fourrure', 'Boucle de suspension'],
    specs: { 'Hauteur': '45 cm', 'Matière': 'Acrylique tricoté', 'Entretien': 'Lavage à la main' }
  },
  {
    id: 'pack-salon',
    name: 'Pack Salon de Noël',
    short: 'Rideau lumineux + 6 bougies LED + chaussette',
    price: 37.90,
    tag: 'Pack',
    pack: ['guirlande-rideau', 'bougies-led', 'chaussette-geante'],
    images: ['photo-1766422646104-49661299db4b', 'photo-1681433241280-aae50a102255', 'photo-1765628710664-dbce4f4d45b5'],
    desc: "Tout ce qu'il faut pour transformer une pièce en salon de Noël en dix minutes : le rideau lumineux pour la fenêtre, les bougies LED pour la table et la chaussette pour la cheminée. Idéal à offrir.",
    features: ['Rideau lumineux Étoiles (3 m)', 'Lot de 6 bougies LED', 'Chaussette de Noël géante', "Moins cher que les 3 articles achetés séparément"],
    specs: { 'Contenu': '3 produits', 'Usage': 'Intérieur' }
  }
];

function getProduct(id) {
  for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
  return null;
}
function packWorth(p) {
  if (!p.pack) return 0;
  return p.pack.reduce(function (s, id) { var x = getProduct(id); return s + (x ? x.price : 0); }, 0);
}
function eur(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- Panier (stocké dans le navigateur) ---------- */
var CART_KEY = 'flocon_cart_v1';
function readCart() {
  try {
    var c = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(c) ? c.filter(function (l) { return getProduct(l.id) && l.qty > 0; }) : [];
  } catch (e) { return []; }
}
function writeCart(c) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {}
  updateCount();
}
function addToCart(id, qty) {
  var c = readCart();
  var line = c.find(function (l) { return l.id === id; });
  if (line) line.qty = Math.min(20, line.qty + qty);
  else c.push({ id: id, qty: qty });
  writeCart(c);
  toast('Ajouté au panier', true);
}
function setQty(id, qty) {
  var c = readCart().map(function (l) { if (l.id === id) l.qty = qty; return l; })
    .filter(function (l) { return l.qty > 0; });
  writeCart(c);
}
function cartTotals(c) {
  var sub = c.reduce(function (s, l) { return s + getProduct(l.id).price * l.qty; }, 0);
  sub = Math.round(sub * 100) / 100;
  var ship = sub === 0 || sub >= CONFIG.freeShippingFrom ? 0 : CONFIG.shippingFee;
  return { sub: sub, ship: ship, total: Math.round((sub + ship) * 100) / 100 };
}
function updateCount() {
  var n = readCart().reduce(function (s, l) { return s + l.qty; }, 0);
  document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; el.setAttribute('data-n', n); });
}

var toastTimer;
function toast(msg, withLink) {
  var t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = esc(msg) + (withLink ? ' <a href="panier.html">Voir le panier</a>' : '');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

/* ---------- En-tête et pied de page communs ---------- */
var ICON_FLAKE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M3 9.7l3.4.9-.9 3.4M21 14.3l-3.4-.9.9-3.4M3 14.3l3.4-.9-.9-3.4M21 9.7l-3.4.9.9 3.4"/></svg>';
var ICON_BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';

function renderChrome() {
  var top = document.getElementById('top');
  if (top) top.outerHTML =
    '<div class="topbar">Livraison offerte dès ' + CONFIG.freeShippingFrom + ' € · <strong>Commande avant le ' + CONFIG.christmasDeadline + '</strong> pour être livré avant Noël</div>' +
    '<header class="site"><div class="wrap head">' +
    '<a class="logo" href="index.html">' + ICON_FLAKE + 'Flocon</a>' +
    '<nav class="nav" aria-label="Navigation"><a href="index.html#boutique">Boutique</a><a href="produit.html?id=pack-salon">Le pack</a><a href="index.html#livraison">Livraison</a><a href="index.html#faq">FAQ</a></nav>' +
    '<a class="cart-btn" href="panier.html" aria-label="Panier">' + ICON_BAG + '<span class="lbl">Panier</span><span class="cart-count" data-n="0">0</span></a>' +
    '</div></header>';
  var foot = document.getElementById('foot');
  if (foot) foot.outerHTML =
    '<footer class="site"><div class="wrap"><div class="foot">' +
    '<div><a class="logo" href="index.html">' + ICON_FLAKE + 'Flocon</a><p>Déco de Noël lumineuse et chaleureuse, livrée chez toi depuis notre entrepôt européen.</p></div>' +
    '<div><h4>Boutique</h4><a href="index.html#boutique">Tous les produits</a><a href="produit.html?id=pack-salon">Pack Salon de Noël</a><a href="panier.html">Panier</a></div>' +
    '<div><h4>Infos</h4><a href="legal.html#livraison">Livraison</a><a href="legal.html#retours">Retours et remboursements</a><a href="legal.html#cgv">Conditions de vente</a><a href="legal.html#mentions">Mentions légales</a><a href="legal.html#confidentialite">Confidentialité</a></div>' +
    '</div><div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' Flocon</span><span>Paiement sécurisé via PayPal · Photos d\'ambiance : Unsplash</span></div></div></footer>';
  updateCount();
}

/* ---------- Carte produit ---------- */
function cardHTML(p) {
  return '<article class="card">' +
    '<a class="card-media" href="produit.html?id=' + p.id + '"><img loading="lazy" src="' + U(p.images[0], 700) + '" alt="' + esc(p.name) + '">' +
    (p.tag ? '<span class="tag' + (p.pack ? ' red' : '') + '">' + esc(p.tag) + '</span>' : '') + '</a>' +
    '<div class="card-body"><h3><a href="produit.html?id=' + p.id + '">' + esc(p.name) + '</a></h3><p>' + esc(p.short) + '</p>' +
    '<div class="card-foot"><span class="price">' + eur(p.price) + '</span><button class="add" data-add="' + p.id + '">Ajouter</button></div></div></article>';
}
function bindAddButtons(root) {
  (root || document).querySelectorAll('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      addToCart(b.getAttribute('data-add'), 1);
      b.classList.add('done'); b.textContent = 'Ajouté ✓';
      setTimeout(function () { b.classList.remove('done'); b.textContent = 'Ajouter'; }, 1600);
    });
  });
}

/* ---------- Commande ---------- */
function orderRef() {
  var d = new Date();
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return 'FL-' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function paypalCartForm(cart, t, c, ref) {
  var base = location.href.replace(/[^/]*$/, '');
  var f = document.createElement('form');
  f.method = 'post';
  f.action = 'https://www.paypal.com/cgi-bin/webscr';
  var fields = {
    cmd: '_cart', upload: '1', business: CONFIG.paypalMerchantId, currency_code: 'EUR', charset: 'utf-8', lc: 'FR',
    invoice: ref, custom: ref, no_shipping: '2', handling_cart: t.ship.toFixed(2),
    'return': base + 'merci.html?ref=' + encodeURIComponent(ref), cancel_return: base + 'panier.html',
    first_name: c.first, last_name: c.last, email: c.email, address1: c.address, city: c.city, zip: c.zip,
    country: { 'France': 'FR', 'Belgique': 'BE', 'Luxembourg': 'LU' }[c.country] || 'FR'
  };
  cart.forEach(function (l, i) {
    var p = getProduct(l.id), n = i + 1;
    fields['item_name_' + n] = p.name;
    fields['item_number_' + n] = p.id;
    fields['amount_' + n] = p.price.toFixed(2);
    fields['quantity_' + n] = String(l.qty);
  });
  Object.keys(fields).forEach(function (k) {
    var i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = fields[k]; f.appendChild(i);
  });
  document.body.appendChild(f);
  return f;
}

function orderSummaryText(cart, t, c, ref) {
  var lines = cart.map(function (l) { var p = getProduct(l.id); return '- ' + l.qty + ' × ' + p.name + ' (' + eur(p.price * l.qty) + ')'; });
  return 'Nouvelle commande Flocon ' + ref + '\n\n' + lines.join('\n') +
    '\n\nSous-total : ' + eur(t.sub) + '\nLivraison : ' + (t.ship ? eur(t.ship) : 'offerte') + '\nTOTAL : ' + eur(t.total) +
    '\n\nClient : ' + c.first + ' ' + c.last + '\nEmail : ' + c.email + '\nTéléphone : ' + (c.phone || '-') +
    '\nAdresse : ' + c.address + ', ' + c.zip + ' ' + c.city + ', ' + c.country +
    '\n\nPaiement : PayPal.me — vérifier la réception de ' + eur(t.total) + ' avant de passer la commande fournisseur.';
}

document.addEventListener('DOMContentLoaded', renderChrome);
