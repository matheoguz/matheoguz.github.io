// Outils partagés par toutes les routes de l'API.

export const PACKS = [
  { id: 'p3', credits: 3, price: 399, name: '3 vidéos IA FruitStudio' },
  { id: 'p10', credits: 10, price: 999, name: '10 vidéos IA FruitStudio' },
  { id: 'p25', credits: 25, price: 1999, name: '25 vidéos IA FruitStudio' },
];

export const USER_RE = /^[A-Za-z0-9_-]{16,64}$/;

// --- HTTP -------------------------------------------------------------------
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// --- Redis (Upstash REST) ---------------------------------------------------
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export async function redis(...cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(cmd.map(String)),
  });
  const j = await r.json();
  if (j.error) throw new Error('Redis: ' + j.error);
  return j.result;
}

export const creditKey = (user) => `credits:${user}`;

export async function getCredits(user) {
  const free = parseInt(process.env.FREE_CREDITS || '0', 10);
  if (free > 0) await redis('SET', creditKey(user), free, 'NX');
  return parseInt((await redis('GET', creditKey(user))) || '0', 10);
}

// Retire 1 crédit. Renvoie false s'il n'y en avait pas.
export async function takeCredit(user) {
  await getCredits(user);
  const left = await redis('DECRBY', creditKey(user), 1);
  if (left < 0) {
    await redis('INCRBY', creditKey(user), 1);
    return false;
  }
  return true;
}

export async function giveCredits(user, n) {
  return redis('INCRBY', creditKey(user), n);
}

// --- fal.ai -----------------------------------------------------------------
function falHeaders() {
  return { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' };
}

// Appel direct (pour les modèles rapides : image, voix).
export async function falRun(model, input) {
  const r = await fetch(`https://fal.run/${model}`, { method: 'POST', headers: falHeaders(), body: JSON.stringify(input) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`fal ${model}: ${r.status} ${JSON.stringify(j.detail || j).slice(0, 300)}`);
  return j;
}

// File d'attente (pour la vidéo, qui prend plusieurs minutes).
export async function falSubmit(model, input) {
  const r = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: falHeaders(), body: JSON.stringify(input) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`fal queue ${model}: ${r.status} ${JSON.stringify(j.detail || j).slice(0, 300)}`);
  return j; // { request_id, status_url, response_url }
}

export async function falGet(url) {
  const r = await fetch(url, { headers: falHeaders() });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j };
}

// Seules les URL renvoyées par fal sont appelées avec la clé.
export function isFalUrl(u) {
  try { return new URL(u).hostname.endsWith('.fal.run'); } catch { return false; }
}
