import { json, preflight, redis, giveCredits, falGet, isFalUrl, USER_RE } from '../lib/common.js';

export function OPTIONS() {
  return preflight();
}

async function refundOnce(jobKey, user) {
  // HINCRBY renvoie 1 uniquement la première fois : on ne rembourse qu'une fois.
  const n = await redis('HINCRBY', jobKey, 'refunded', 1);
  if (n === 1) await giveCredits(user, 1);
}

// GET /api/status?job=...&user=... -> { status: 'pending'|'done'|'failed', video?, position? }
export async function GET(request) {
  const q = new URL(request.url).searchParams;
  const job = q.get('job') || '';
  const user = q.get('user') || '';
  if (!/^[0-9a-f-]{36}$/.test(job) || !USER_RE.test(user)) return json({ error: 'Paramètres invalides' }, 400);

  const key = `job:${job}`;
  const arr = await redis('HGETALL', key);
  if (!arr || !arr.length) return json({ error: 'Vidéo introuvable' }, 404);
  const j = {};
  for (let i = 0; i < arr.length; i += 2) j[arr[i]] = arr[i + 1];
  if (j.user !== user) return json({ error: 'Vidéo introuvable' }, 404);

  if (j.video) return json({ status: 'done', video: j.video });
  if (j.refunded) return json({ status: 'failed' });
  if (!isFalUrl(j.status_url) || !isFalUrl(j.response_url)) return json({ status: 'failed' });

  const st = await falGet(j.status_url);
  const expired = Date.now() - Number(j.created || 0) > 30 * 60 * 1000;
  if (!st.ok && !expired) return json({ status: 'pending' });

  if (st.ok && st.data.status === 'COMPLETED') {
    const res = await falGet(j.response_url);
    const video = res.ok && res.data.video && res.data.video.url;
    if (video) {
      await redis('HSET', key, 'video', video);
      return json({ status: 'done', video });
    }
    // Erreur passagère de fal (5xx) : la vidéo existe peut-être, on réessaie au prochain tour.
    if (res.status >= 500 && !expired) return json({ status: 'pending' });
    console.error('fal job failed', job, res.status, JSON.stringify(res.data).slice(0, 500));
    await refundOnce(key, user);
    return json({ status: 'failed' });
  }

  // Sécurité : au-delà de 30 minutes, on considère que c'est raté et on rembourse.
  if (expired) {
    await refundOnce(key, user);
    return json({ status: 'failed' });
  }

  return json({ status: 'pending', position: st.data.queue_position ?? null });
}
