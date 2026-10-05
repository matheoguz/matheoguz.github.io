import { createHmac, timingSafeEqual } from 'node:crypto';
import { redis, giveCredits, USER_RE } from '../lib/common.js';

// Vérifie la signature Stripe (en-tête Stripe-Signature: t=...,v1=...).
function verify(raw, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')).filter((p) => p.length === 2 && p[0] !== 'v1'));
  const sigs = header.split(',').filter((kv) => kv.startsWith('v1=')).map((kv) => kv.slice(3));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

// POST /api/stripe-webhook (appelé par Stripe, pas par le site)
export async function POST(request) {
  const raw = await request.text();
  if (!verify(raw, request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) {
    return new Response('Signature invalide', { status: 400 });
  }
  const event = JSON.parse(raw);
  const types = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
  if (!types.includes(event.type)) return new Response('ignoré', { status: 200 });

  const s = event.data.object;
  if (s.payment_status !== 'paid') return new Response('en attente', { status: 200 });

  const user = s.metadata && s.metadata.user;
  const credits = parseInt((s.metadata && s.metadata.credits) || '0', 10);
  if (!USER_RE.test(user || '') || !(credits > 0)) return new Response('métadonnées manquantes', { status: 200 });

  // Une session = un seul ajout de crédits, même si Stripe renvoie l'événement.
  const first = await redis('SET', `paid:${s.id}`, '1', 'NX', 'EX', 60 * 60 * 24 * 90);
  if (first === 'OK') await giveCredits(user, credits);
  return new Response('ok', { status: 200 });
}
