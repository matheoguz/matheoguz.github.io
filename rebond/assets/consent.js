/* Bandeau de consentement cookies (recommandations CNIL) :
   - « Tout refuser » aussi visible et aussi simple que « Tout accepter » ;
   - rien d'optionnel n'est chargé avant le choix ;
   - le choix est gardé 6 mois, puis redemandé ;
   - « Gérer les cookies » en bas de chaque page permet de changer d'avis à tout moment.
   Usage : window.RebondConsent.get().audience, window.RebondConsent.onChange(fn), window.RebondConsent.open() */
(() => {
  "use strict";
  const KEY = "rebond.consent", MAX_AGE = 182 * 86_400_000;
  const policy = document.currentScript?.dataset.policy || "legal/cookies.html";
  const listeners = [];
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY)); return c && Date.now() - c.at < MAX_AGE ? c : null; } catch { return null; } };
  const save = choice => {
    const c = { v: 1, at: Date.now(), audience: !!choice.audience };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
    listeners.forEach(fn => { try { fn(c); } catch {} });
  };

  const css = `
  .rb-consent{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;max-width:560px;margin:0 auto;
    background:var(--bg,#fff);color:var(--ink,#121417);border:1px solid var(--line,#E2E5E9);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.25);
    padding:18px;display:grid;gap:12px;font:15px/1.45 var(--f-body,system-ui,-apple-system,"Segoe UI",sans-serif)}
  .rb-consent h2{margin:0;font-size:1.05rem}
  .rb-consent p{margin:0;font-size:.9rem;color:var(--muted,#666E76)}
  .rb-consent a{color:var(--accent,#1D4ED8)}
  .rb-consent .rb-row{display:flex;gap:8px;flex-wrap:wrap}
  .rb-consent .rb-row button{flex:1 1 150px;min-height:42px;border-radius:8px;font:inherit;font-weight:700;cursor:pointer;border:1px solid var(--ink,#121417);background:var(--bg,#fff);color:var(--ink,#121417)}
  .rb-consent .rb-row button.rb-main{background:var(--ink,#121417);color:var(--bg,#fff)}
  .rb-consent label{display:flex;gap:10px;align-items:flex-start;font-size:.9rem;padding:10px;border:1px solid var(--line,#E2E5E9);border-radius:8px}
  .rb-consent input{width:18px;height:18px;margin-top:2px;flex:none;accent-color:var(--accent,#1D4ED8)}
  .rb-consent button:focus-visible{outline:2px solid var(--accent,#1D4ED8);outline-offset:2px}
  @media (max-width:760px){.rb-consent{bottom:calc(84px + env(safe-area-inset-bottom,0px))}}`;

  let node = null;
  function close() { node?.remove(); node = null; }
  function show(custom) {
    close();
    if (!document.getElementById("rb-consent-css")) { const st = document.createElement("style"); st.id = "rb-consent-css"; st.textContent = css; document.head.append(st); }
    const cur = read() || { audience: false };
    node = document.createElement("section");
    node.className = "rb-consent"; node.setAttribute("role", "dialog"); node.setAttribute("aria-label", "Cookies et stockage");
    const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };
    const link = el("a", { href: policy, textContent: "politique cookies" });
    const btn = (label, main, fn) => el("button", { type: "button", className: main ? "rb-main" : "", textContent: label, onclick: fn });
    if (!custom) {
      node.append(
        el("h2", { textContent: "Tes choix sur les cookies" }),
        el("p", {}, "Aucun cookie publicitaire ici. Nous utilisons le stockage nécessaire au site (connexion, préférences) et, seulement si tu l’acceptes, une mesure d’audience pour améliorer Rebond. Détails dans la ", link, "."),
        el("div", { className: "rb-row" },
          btn("Tout refuser", false, () => { save({ audience: false }); close(); }),
          btn("Personnaliser", false, () => show(true)),
          btn("Tout accepter", true, () => { save({ audience: true }); close(); })));
    } else {
      const aud = el("input", { type: "checkbox", checked: cur.audience, id: "rb-aud" });
      node.append(
        el("h2", { textContent: "Personnaliser" }),
        el("label", {}, el("input", { type: "checkbox", checked: true, disabled: true }), el("span", {}, el("b", { textContent: "Nécessaires · toujours actifs" }), el("br"), "Connexion à ton compte, sécurité, pointure et dernier choix de cookies. Sans eux, le site ne fonctionne pas.")),
        el("label", { htmlFor: "rb-aud" }, aud, el("span", {}, el("b", { textContent: "Mesure d’audience" }), el("br"), "Statistiques de visite anonymes (pages vues, appareil). Aucun outil n’est chargé sans ton accord.")),
        el("p", {}, "Tu peux changer d’avis à tout moment avec « Gérer les cookies » en bas de page. Voir la ", link, "."),
        el("div", { className: "rb-row" },
          btn("Tout refuser", false, () => { save({ audience: false }); close(); }),
          btn("Enregistrer mes choix", true, () => { save({ audience: aud.checked }); close(); })));
    }
    document.body.append(node);
    node.querySelector("button").focus({ preventScroll: true });
  }

  window.RebondConsent = { get: () => read() || { audience: false }, open: () => show(true), onChange: fn => listeners.push(fn) };
  const start = () => { if (!read()) show(false); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
