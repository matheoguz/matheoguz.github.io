(function () {
  "use strict";

  var data = window.TOP1;
  var cfg = data.config;
  var cats = data.categories;
  var products = data.products;

  var VERDICTS = {
    merite:  "Mérité",
    reserve: "Avec réserves",
    surcote: "Surcoté"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function formatDate(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function amazonUrl(p) {
    var url;
    if (p.url) {
      url = new URL(p.url);
    } else {
      url = new URL("https://www.amazon.fr/s");
      url.searchParams.set("k", p.query || (p.brand + " " + p.name));
    }
    if (cfg.affiliateTag) url.searchParams.set("tag", cfg.affiliateTag);
    return url.toString();
  }

  function catLabel(p) { return (cats[p.category] || {}).label || p.category; }
  function catIcon(p) { return (cats[p.category] || {}).icon || "tag"; }

  function plate(p, opts) {
    opts = opts || {};
    var photo = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.brand + " " + p.name) + '" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove(\'plate--photo\');this.remove()">'
      : "";
    return (
      '<div class="plate' + (p.image ? " plate--photo" : "") + '">' +
        '<span class="plate__num" aria-hidden="true">1</span>' +
        photo +
        '<div class="plate__top mono"><span>N°1 · ' + esc(catLabel(p)) + "</span>" +
          (opts.edition ? "<span>Éd. " + pad(cfg.edition) + "</span>" : "") + "</div>" +
        '<div class="plate__icon" aria-hidden="true"><svg><use href="#i-' + catIcon(p) + '"/></svg></div>' +
      "</div>"
    );
  }

  function verdict(p) {
    return '<span class="verdict verdict--' + esc(p.verdict) + '">' + (VERDICTS[p.verdict] || "") + "</span>";
  }

  var arrow = '<span class="roundarrow" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span>';

  /* ---------- en-tête ---------- */
  $(".js-edition").textContent = "Édition n°" + pad(cfg.edition);
  $(".js-date").textContent = formatDate(cfg.date);
  $(".js-count").textContent = Object.keys(cats).filter(function (k) {
    return products.some(function (p) { return p.category === k; });
  }).length;

  if (cfg.affiliateTag) $(".js-disclosure").hidden = false;

  if (cfg.tiktok) {
    var handle = cfg.tiktok.replace(/^@/, "");
    $$(".js-tiktok").forEach(function (a) {
      a.href = "https://www.tiktok.com/@" + encodeURIComponent(handle);
      a.target = "_blank";
      a.rel = "noopener";
      a.hidden = false;
    });
    $(".js-handle").textContent = "@" + handle;
    $(".js-follow").hidden = false;
  }

  /* ---------- à la une ---------- */
  var cover = products.find(function (p) { return p.featured; }) || products[0];
  var coverEl = $(".js-cover");
  if (cover) {
    coverEl.innerHTML =
      '<div class="cover__meta mono"><span>À la une</span><span>' + verdict(cover) + "</span></div>" +
      plate(cover, { edition: true }) +
      "<figcaption><div>" +
        '<p class="cover__brand">' + esc(cover.brand) + "</p>" +
        '<p class="cover__name">' + esc(cover.name) + "</p>" +
      "</div>" + arrow + "</figcaption>";
    coverEl.setAttribute("role", "button");
    coverEl.tabIndex = 0;
    coverEl.addEventListener("click", function () { go(cover.id); });
    coverEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(cover.id); }
    });
  }

  /* ---------- filtres ---------- */
  var current = "all";
  var filtersEl = $(".js-filters");
  var used = Object.keys(cats).filter(function (k) {
    return products.some(function (p) { return p.category === k; });
  });
  filtersEl.innerHTML =
    '<button class="chip" data-cat="all" aria-pressed="true">Tous les rayons</button>' +
    used.map(function (k) {
      return '<button class="chip" data-cat="' + esc(k) + '" aria-pressed="false">' + esc(cats[k].label) + "</button>";
    }).join("");

  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    current = b.getAttribute("data-cat");
    $$(".chip", filtersEl).forEach(function (c) {
      c.setAttribute("aria-pressed", String(c === b));
    });
    renderRows();
  });

  /* ---------- classement ---------- */
  var rowsEl = $(".js-rows");

  function renderRows() {
    var list = products.filter(function (p) { return current === "all" || p.category === current; });
    rowsEl.innerHTML = list.map(function (p, i) {
      var n = products.indexOf(p) + 1;
      return (
        '<li class="row" style="animation-delay:' + (i * 50) + 'ms">' +
          '<button class="row__btn" data-id="' + esc(p.id) + '" aria-label="' + esc(p.brand + " " + p.name + ", " + catLabel(p) + ", " + VERDICTS[p.verdict]) + '">' +
            '<span class="row__idx mono">' + pad(n) + "</span>" +
            '<span class="row__cat mono">' + esc(catLabel(p)) + "</span>" +
            '<span class="row__main">' +
              '<span class="row__brand" data-cat="' + esc(catLabel(p)) + '">' + esc(p.brand) + "</span>" +
              '<span class="row__name">' + esc(p.name) + "</span>" +
            "</span>" +
            '<span class="row__verdict">' + verdict(p) + "</span>" +
            '<span class="row__price">' + esc(p.price) + "</span>" +
            arrow +
          "</button>" +
        "</li>"
      );
    }).join("");
    $(".js-empty").hidden = list.length > 0;
  }
  renderRows();

  rowsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".row__btn");
    if (b) go(b.getAttribute("data-id"));
  });

  /* ---------- fiche produit ---------- */
  var sheet = $(".js-sheet");
  var sheetBody = $(".js-sheet-body");
  var lastFocus = null;

  function go(id) { location.hash = "#/p/" + id; }

  function openSheet(p) {
    var outRel = cfg.affiliateTag ? "sponsored noopener" : "noopener";
    sheetBody.innerHTML =
      '<div class="sheet__bar"><span class="mono">N°1 · ' + esc(catLabel(p)) + " · Éd. " + pad(cfg.edition) + "</span>" +
        '<button class="icon-btn js-close" aria-label="Fermer"><svg><use href="#i-close"/></svg></button></div>' +
      '<div class="sheet__body">' +
        plate(p) +
        '<div class="sheet__head">' +
          '<p class="sheet__brand">' + esc(p.brand) + "</p>" +
          '<h2 class="sheet__name" id="sheet-title">' + esc(p.name) + "</h2>" +
          '<div class="sheet__line">' + verdict(p) + '<span class="row__price">' + esc(p.price) + "</span></div>" +
        "</div>" +
        '<p class="sheet__headline">' + esc(p.headline) + "</p>" +
        '<dl class="facts-list">' +
          "<div><dt class=\"mono\">Pourquoi n°1</dt><dd>" + esc(p.why) + "</dd></div>" +
          "<div><dt class=\"mono\">Pour qui</dt><dd>" + esc(p.forWho) + "</dd></div>" +
          "<div><dt class=\"mono\">Le bémol</dt><dd>" + esc(p.catch) + "</dd></div>" +
          "<div><dt class=\"mono\">L'alternative</dt><dd>" + esc(p.alternative) + "</dd></div>" +
        "</dl>" +
        '<div class="sheet__actions">' +
          '<a class="btn btn--ink" href="' + esc(amazonUrl(p)) + '" target="_blank" rel="' + outRel + '">Voir sur Amazon <svg aria-hidden="true"><use href="#i-out"/></svg></a>' +
          '<button class="btn btn--ghost js-copy"><svg aria-hidden="true"><use href="#i-link"/></svg>Copier le lien</button>' +
        "</div>" +
        '<p class="sheet__note">Classement relevé le ' + formatDate(cfg.date) + ". Il peut avoir changé depuis." +
          (cfg.affiliateTag ? " Lien affilié : nous touchons une commission, sans surcoût pour vous." : "") + "</p>" +
      "</div>";

    document.title = p.brand + " " + p.name + " — N°1";
    if (!sheet.open) {
      lastFocus = document.activeElement;
      sheet.showModal();
    }
    sheetBody.scrollTop = 0;
    $(".js-close", sheet).focus();
  }

  function closeSheet() {
    if (sheet.open) sheet.close();
  }

  sheet.addEventListener("click", function (e) {
    if (e.target === sheet) { clearHash(); return; }
    if (e.target.closest(".js-close")) { clearHash(); return; }
    if (e.target.closest(".js-copy")) copyLink();
  });

  sheet.addEventListener("cancel", function (e) {
    e.preventDefault();
    clearHash();
  });

  sheet.addEventListener("close", function () {
    document.title = "N°1 — Le meilleur vendeur de chaque rayon, passé au crible";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });

  function clearHash() {
    history.pushState("", document.title, location.pathname + location.search);
    route();
  }

  function copyLink() {
    var url = location.href;
    var done = function () { toast("Lien copié"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
    } else {
      fallbackCopy(url);
      done();
    }
  }

  function fallbackCopy(text) {
    var t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    sheet.appendChild(t);
    t.select();
    try { document.execCommand("copy"); } catch (e) {}
    t.remove();
  }

  var toastEl = $(".js-toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
  }

  /* ---------- routage (#/p/id) ---------- */
  function route() {
    var m = location.hash.match(/^#\/p\/([\w-]+)/);
    var p = m && products.find(function (x) { return x.id === m[1]; });
    if (p) openSheet(p); else closeSheet();
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- barre au défilement ---------- */
  var bar = $(".bar");
  var onScroll = function () { bar.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
