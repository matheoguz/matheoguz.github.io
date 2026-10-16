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
  return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=75';
}

var PRODUCTS = [
  {
    id: 'guirlande-rideau',
    name: 'Rideau lumineux Étoiles',
    short: 'Rideau LED trois mètres, lumière chaude',
    price: 19.90,
    tag: 'Signature',
    images: ['photo-1681433241280-aae50a102255', 'photo-1608211194323-10b2dda88e25', 'photo-1534780087173-e6bc5e994fe0'],
    desc: "Une fenêtre, une tête de lit ou un mur nu deviennent un ciel d'hiver. Douze fils de lumière chaude tombent en cascade ; le rideau se fixe en quelques minutes et s'alimente par USB, sans prise à proximité.",
    features: ['Trois mètres de large, douze fils lumineux', 'Huit effets, de la lumière fixe au scintillement lent', 'Alimentation USB et télécommande', 'LED blanc chaud, sans échauffement'],
    specs: { 'Dimensions': '300 × 100 cm', 'Lumière': 'LED blanc chaud', 'Alimentation': 'USB 5 V (adaptateur non inclus)', 'Usage': 'Intérieur' }
  },
  {
    id: 'bougies-led',
    name: 'Bougies à flamme LED',
    short: 'Coffret de six, vraie cire, minuteur',
    price: 14.90,
    tag: 'Sans flamme',
    images: ['photo-1765628710664-dbce4f4d45b5', 'photo-1763290808558-921cf9257bf2', 'photo-1607838660853-a2cf34eec5b9'],
    desc: "La lumière vivante d'une bougie, sans flamme ni fumée. La cire est véritable, la flamme LED vacille doucement, et le minuteur les rallume chaque soir. À poser près du sapin, sur une table de fête ou dans une chambre d'enfant.",
    features: ['Six bougies en cire, trois hauteurs', 'Flamme LED au mouvement naturel', 'Minuteur : six heures allumées, dix-huit éteintes', 'Fonctionnent sur piles (non incluses)'],
    specs: { 'Hauteurs': '10, 12,5 et 15 cm', 'Matière': 'Cire de paraffine, LED', 'Piles': '2 × AAA par bougie', 'Usage': 'Intérieur' }
  },
  {
    id: 'couronne-porte',
    name: 'Couronne Sapin & Baies',
    short: 'Quarante centimètres, nœud de velours',
    price: 24.90,
    tag: null,
    images: ['photo-1703187439179-9b8c323294a8', 'photo-1544890930-fa67ca7d3a11', 'photo-1639880005608-6e0688ce2c9c'],
    desc: "Le premier geste d'accueil de la saison. Des branches de sapin denses, des baies rouges, des pommes de pin et un large nœud de velours. Elle garde son allure d'une année à l'autre, sans perdre une aiguille.",
    features: ['Diamètre de quarante centimètres', 'Nœud en velours rouge profond', 'Pommes de pin et baies décoratives', 'Se conserve et se réutilise chaque année'],
    specs: { 'Diamètre': '40 cm', 'Matière': 'PVC, velours, éléments naturels', 'Fixation': 'Boucle de suspension', 'Usage': 'Intérieur ou porte abritée' }
  },
  {
    id: 'boules-noel',
    name: 'Coffret de vingt-quatre boules',
    short: 'Rouge, vert et or, incassables',
    price: 17.90,
    tag: 'Coffret',
    images: ['photo-1767741857489-b28dcaa531a4', 'photo-1513885251266-04dcfa26e979', 'photo-1609125303972-255c84ac9f01'],
    desc: "De quoi habiller un sapin entier dans une palette accordée. Finitions brillantes, mates et pailletées : l'éclat du verre soufflé, la résistance en plus.",
    features: ['Vingt-quatre boules, trois diamètres', 'Matière incassable', 'Finitions brillantes, mates et pailletées', 'Attaches fournies'],
    specs: { 'Quantité': '24 pièces', 'Diamètres': '3, 4 et 6 cm', 'Matière': 'Plastique incassable', 'Coloris': 'Rouge, vert, or' }
  },
  {
    id: 'calendrier-avent',
    name: "Calendrier de l'Avent",
    short: 'Vingt-quatre sachets en tissu à garnir',
    price: 16.90,
    tag: 'Avant le 1er décembre',
    images: ['photo-1764341127020-842a97295c15', 'photo-1606844358484-ab8725cab420', 'photo-1766425221306-4d44f4011d4a'],
    desc: "Vingt-quatre sachets numérotés, une cordelette et de petites pinces en bois. Vous choisissez ce qui s'y cache : chocolats, mots doux, promesses de sorties. Un rituel qui se réinvente chaque année.",
    features: ['Vingt-quatre sachets en tissu numérotés', 'Cordelette de 2,5 m et pinces en bois', 'Réutilisable', 'À commander avant mi-novembre pour le 1er décembre'],
    specs: { 'Sachets': '10 × 14 cm', 'Matière': 'Coton et jute', 'Cordelette': '2,5 m', 'Contenu': 'Sachets vides, à garnir' }
  },
  {
    id: 'chaussette-geante',
    name: 'Chaussette de Noël',
    short: 'Grand format, tricot et fausse fourrure',
    price: 9.90,
    tag: null,
    images: ['photo-1543772857-a9d7ebc0cf63', 'photo-1642335911245-238e13dcabf2'],
    desc: "La chaussette à suspendre à la cheminée, à une étagère ou à une porte. Assez grande pour de vrais présents, en tricot épais rouge et blanc, avec un revers en fausse fourrure.",
    features: ['Hauteur de quarante-cinq centimètres', 'Tricot épais rouge et blanc', 'Revers en fausse fourrure', 'Boucle de suspension'],
    specs: { 'Hauteur': '45 cm', 'Matière': 'Acrylique tricoté', 'Entretien': 'Lavage à la main' }
  },
  {
    id: 'pack-salon',
    name: 'Coffret Salon de Noël',
    short: 'Rideau lumineux, bougies et chaussette',
    price: 37.90,
    tag: 'Coffret cadeau',
    pack: ['guirlande-rideau', 'bougies-led', 'chaussette-geante'],
    images: ['photo-1766422646104-49661299db4b', 'photo-1681433241280-aae50a102255', 'photo-1765628710664-dbce4f4d45b5'],
    desc: "Trois pièces choisies pour transformer une pièce en salon de Noël en quelques minutes : la lumière pour la fenêtre, la chaleur des bougies pour la table, la chaussette pour la cheminée. Une idée de cadeau toute trouvée.",
    features: ['Rideau lumineux Étoiles, trois mètres', 'Coffret de six bougies à flamme LED', 'Chaussette de Noël grand format', 'Plus avantageux que les trois pièces séparément'],
    specs: { 'Contenu': '3 pièces', 'Usage': 'Intérieur' }
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
  renderDrawer();
}
function addToCart(id, qty) {
  var c = readCart();
  var line = c.find(function (l) { return l.id === id; });
  if (line) line.qty = Math.min(20, line.qty + qty);
  else c.push({ id: id, qty: qty });
  writeCart(c);
  openDrawer();
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
  document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = '(' + n + ')'; });
}

var toastTimer;
function toast(msg) {
  var t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
}

/* ---------- Icônes (traits fins) ---------- */
var ICON = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};

/* ---------- En-tête, menu, panier latéral, pied de page ---------- */
function renderChrome() {
  var top = document.getElementById('top');
  if (top) top.outerHTML =
    '<div class="topbar">Livraison offerte dès ' + CONFIG.freeShippingFrom + ' € &nbsp;·&nbsp; Commandez avant le ' + CONFIG.christmasDeadline + ' pour Noël</div>' +
    '<header class="site"><div class="wrap head">' +
      '<nav class="nav" aria-label="Navigation principale"><a href="index.html#collection">Collection</a><a href="produit.html?id=pack-salon">Coffret</a><a href="index.html#service">Service</a></nav>' +
      '<button class="icon-btn burger" id="burger" aria-label="Ouvrir le menu">' + ICON.menu + '</button>' +
      '<a class="logo" href="index.html">Flocon</a>' +
      '<div class="head-right"><button class="icon-btn" id="cartOpen" aria-label="Ouvrir le panier">' + ICON.bag + '<span class="lbl">Panier</span><span class="cart-count">(0)</span></button></div>' +
    '</div></header>' +
    '<div class="mnav" id="mnav" aria-hidden="true">' +
      '<div class="mnav-top"><span class="logo" style="justify-self:start;padding-left:0">Flocon</span><button class="icon-btn" id="mnavClose" aria-label="Fermer le menu">' + ICON.close + '</button></div>' +
      '<a class="big" href="index.html#collection">Collection</a><a class="big" href="produit.html?id=pack-salon">Coffret cadeau</a><a class="big" href="index.html#service">Service</a><a class="big" href="index.html#faq">Questions</a>' +
      '<div class="small"><a href="legal.html#livraison">Livraison</a><a href="legal.html#retours">Retours</a><a href="legal.html#mentions">Mentions légales</a></div>' +
    '</div>' +
    '<div class="veil" id="veil"></div>' +
    '<aside class="drawer" id="drawer" aria-label="Panier" aria-hidden="true">' +
      '<div class="drawer-head"><h2>Votre panier</h2><button class="icon-btn" id="cartClose" aria-label="Fermer le panier">' + ICON.close + '</button></div>' +
      '<div class="drawer-body" id="drawerBody"></div>' +
      '<div class="drawer-foot" id="drawerFoot"></div>' +
    '</aside>';

  var foot = document.getElementById('foot');
  if (foot) foot.outerHTML =
    '<footer class="site"><div class="wrap"><div class="foot">' +
      '<div><a class="logo" href="index.html">Flocon</a><p>Maison de décoration de Noël. Des pièces choisies pour la lumière qu\'elles apportent, expédiées depuis notre entrepôt européen.</p></div>' +
      '<div><h4>Boutique</h4><a href="index.html#collection">La collection</a><a href="produit.html?id=pack-salon">Coffret Salon de Noël</a><a href="panier.html">Panier</a></div>' +
      '<div><h4>Service</h4><a href="legal.html#livraison">Livraison</a><a href="legal.html#retours">Retours et remboursements</a><a href="legal.html#cgv">Conditions de vente</a><a href="legal.html#mentions">Mentions légales</a><a href="legal.html#confidentialite">Confidentialité</a></div>' +
    '</div><div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' Flocon</span><span>Paiement sécurisé par PayPal</span></div></div></footer>';

  var mnav = document.getElementById('mnav');
  document.getElementById('burger').onclick = function () { mnav.classList.add('open'); mnav.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); };
  document.getElementById('mnavClose').onclick = closeMenu;
  mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.getElementById('cartOpen').onclick = openDrawer;
  document.getElementById('cartClose').onclick = closeDrawer;
  document.getElementById('veil').onclick = closeDrawer;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); closeMenu(); } });

  updateCount();
  renderDrawer();
  initReveal();
}
function closeMenu() {
  var m = document.getElementById('mnav');
  if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
}
function openDrawer() {
  var d = document.getElementById('drawer');
  if (!d || /panier\.html/.test(location.pathname)) { toast('Ajouté au panier'); return; }
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
  document.getElementById('veil').classList.add('on');
  document.body.classList.add('lock');
}
function closeDrawer() {
  var d = document.getElementById('drawer');
  if (!d) return;
  d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
  document.getElementById('veil').classList.remove('on');
  document.body.classList.remove('lock');
}
function renderDrawer() {
  var body = document.getElementById('drawerBody'), foot = document.getElementById('drawerFoot');
  if (!body) return;
  var cart = readCart();
  if (!cart.length) {
    body.innerHTML = '<div class="drawer-empty"><p>Votre panier est vide.</p></div>';
    foot.innerHTML = '<a class="btn btn-dark btn-block" href="index.html#collection">Découvrir la collection</a>';
    return;
  }
  var t = cartTotals(cart);
  var pct = Math.min(100, Math.round(t.sub / CONFIG.freeShippingFrom * 100));
  var remain = CONFIG.freeShippingFrom - t.sub;
  body.innerHTML = cart.map(lineHTML).join('');
  foot.innerHTML =
    '<div class="progress"><span>' + (remain > 0 ? 'Plus que ' + eur(remain) + ' pour la livraison offerte' : 'Livraison offerte') + '</span><div class="bar"><span style="width:' + pct + '%"></span></div></div>' +
    '<div class="sum"><span class="caps">Sous-total</span><strong>' + eur(t.sub) + '</strong></div>' +
    '<a class="btn btn-dark btn-block" href="panier.html">Commander</a>';
  bindLineControls(body, renderDrawer);
}
function lineHTML(l) {
  var p = getProduct(l.id);
  return '<div class="line"><a href="produit.html?id=' + p.id + '"><img src="' + U(p.images[0], 240) + '" alt=""></a>' +
    '<div><h3><a href="produit.html?id=' + p.id + '">' + esc(p.name) + '</a></h3><small>' + eur(p.price) + '</small>' +
    '<div class="qty"><button data-dec="' + p.id + '" aria-label="Retirer un">&minus;</button><span>' + l.qty + '</span><button data-inc="' + p.id + '" aria-label="Ajouter un">+</button></div></div>' +
    '<div class="line-right"><span>' + eur(p.price * l.qty) + '</span><button class="rm" data-rm="' + p.id + '">Retirer</button></div></div>';
}
function bindLineControls(root, after) {
  root.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { var l = readCart().find(function (x) { return x.id === b.dataset.inc; }); setQty(l.id, Math.min(20, l.qty + 1)); if (after) after(); }; });
  root.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { var l = readCart().find(function (x) { return x.id === b.dataset.dec; }); setQty(l.id, l.qty - 1); if (after) after(); }; });
  root.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { setQty(b.dataset.rm, 0); if (after) after(); }; });
}

/* ---------- Apparition douce au défilement ---------- */
function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
}

/* ---------- Carte produit ---------- */
function cardHTML(p) {
  return '<article class="card reveal">' +
    '<div class="card-media"><a href="produit.html?id=' + p.id + '" aria-label="' + esc(p.name) + '">' +
      '<img loading="lazy" src="' + U(p.images[0], 800) + '" alt="' + esc(p.name) + '">' +
      (p.images[1] ? '<img class="alt" loading="lazy" src="' + U(p.images[1], 800) + '" alt="">' : '') +
      (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
    '</a>' +
    '<button class="quick" data-add="' + p.id + '">Ajouter au panier</button></div>' +
    '<div class="card-body"><div><h3><a href="produit.html?id=' + p.id + '">' + esc(p.name) + '</a></h3><p>' + esc(p.short) + '</p></div>' +
    '<span class="price">' + eur(p.price) + '</span></div></article>';
}
function bindAddButtons(root) {
  (root || document).querySelectorAll('[data-add]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); addToCart(b.getAttribute('data-add'), 1); });
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
