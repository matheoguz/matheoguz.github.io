import { json, preflight, PACKS, USER_RE } from '../lib/common.js';

export function OPTIONS() {
  return preflight();
}

// POST /api/checkout { user, pack } -> { url } (page de paiement Stripe)
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Requête invalide' }, 400); }
  const user = String(body.user || '');
  const pack = PACKS.find((p) => p.id === body.pack);
  if (!USER_RE.test(user) || !pack) return json({ error: 'Requête invalide' }, 400);

  const site = process.env.SITE_URL || 'https://matheoguz.github.io/fruits/';
  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': String(pack.price),
    'line_items[0][price_data][product_data][name]': pack.name,
    client_reference_id: user,
    'metadata[user]': user,
    'metadata[credits]': String(pack.credits),
    'metadata[pack]': pack.id,
    success_url: site + '?paid=1#ia',
    cancel_url: site + '#ia',
    locale: 'fr',
  });

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  const j = await r.json();
  if (!r.ok) {
    console.error('stripe checkout', j.error);
    return json({ error: 'Paiement indisponible pour le moment' }, 500);
  }
  return json({ url: j.url });
}
