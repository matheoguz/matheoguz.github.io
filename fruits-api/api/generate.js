import { json, preflight, redis, takeCredit, giveCredits, falRun, falSubmit, USER_RE } from '../lib/common.js';

const FRUITS = {
  pomme: 'a shiny red apple', banane: 'a ripe yellow banana', fraise: 'a juicy red strawberry',
  orange: 'an orange (citrus fruit)', citron: 'a bright yellow lemon', pasteque: 'a watermelon slice',
  avocat: 'an avocado cut in half with its pit', peche: 'a fuzzy peach', ananas: 'a pineapple with its green crown',
  tomate: 'a red tomato', kiwi: 'a fuzzy brown kiwi fruit', cerise: 'a shiny red cherry with its stem',
  poire: 'a green pear', raisin: 'a bunch of purple grapes', coco: 'a hairy brown coconut', carotte: 'an orange carrot with green leaves',
};

const STYLES = {
  realiste: 'hyper-realistic 3D render, real fruit skin texture, photorealistic, cinematic lighting, shallow depth of field',
  pixar: '3D animated movie style, cute stylized character, soft global illumination, vibrant colors',
  cartoon: '2D cartoon illustration, bold clean outlines, flat vibrant colors',
};

const VOICES = ['Aria', 'Charlotte', 'Laura', 'Jessica', 'Lily', 'Charlie', 'Liam', 'George', 'Brian', 'Bill'];

const clean = (s, max) => String(s || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max);

export function OPTIONS() {
  return preflight();
}

// POST /api/generate { user, text, fruit, custom, style, voice, scene }
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Requête invalide' }, 400); }

  const user = String(body.user || '');
  const text = clean(body.text, 150);
  const style = STYLES[body.style] ? body.style : 'realiste';
  const voice = VOICES.includes(body.voice) ? body.voice : 'Aria';
  const scene = clean(body.scene, 80);
  const fruitDesc = body.fruit === 'autre' ? clean(body.custom, 40) : FRUITS[body.fruit];

  if (!USER_RE.test(user)) return json({ error: 'Utilisateur invalide' }, 400);
  if (text.length < 3) return json({ error: 'Le texte est trop court.' }, 400);
  if (!fruitDesc) return json({ error: 'Choisis un fruit.' }, 400);

  // Anti double-clic : une génération à la fois par utilisateur (20 s).
  const lock = await redis('SET', `lock:${user}`, '1', 'NX', 'EX', 20);
  if (lock !== 'OK') return json({ error: 'Une génération est déjà en cours, patiente quelques secondes.' }, 429);

  let charged = false;
  try {
    if (!(await takeCredit(user))) return json({ error: 'Plus de crédits' }, 402);
    charged = true;

    const prompt = [
      `A single cute anthropomorphic character: ${fruitDesc}, with big expressive eyes and a clearly visible mouth,`,
      `front facing, centered, looking straight at the camera, head and body fully visible,`,
      STYLES[style] + ',',
      scene ? `background: ${scene},` : 'background: a cozy kitchen counter, softly blurred,',
      'vertical 9:16 composition, high detail',
    ].join(' ');

    const [img, tts] = await Promise.all([
      falRun('fal-ai/flux/schnell', {
        prompt,
        image_size: 'portrait_16_9',
        num_inference_steps: 4,
        enable_safety_checker: true,
      }),
      falRun('fal-ai/elevenlabs/tts/multilingual-v2', { text, voice, stability: 0.4, similarity_boost: 0.75 }),
    ]);

    const image = img.images && img.images[0] && img.images[0].url;
    const audio = tts.audio && tts.audio.url;
    if (!image || !audio) throw new Error('Image ou voix manquante');
    if (img.has_nsfw_concepts && img.has_nsfw_concepts[0]) throw new Error('Image refusée par le filtre');

    const q = await falSubmit('fal-ai/kling-video/ai-avatar/v2/standard', {
      image_url: image,
      audio_url: audio,
      prompt: 'The fruit character talks expressively to the camera with natural lip sync, subtle head and body movement.',
    });

    const job = crypto.randomUUID();
    await redis('HSET', `job:${job}`, 'user', user, 'status_url', q.status_url, 'response_url', q.response_url, 'image', image, 'created', Date.now());
    await redis('EXPIRE', `job:${job}`, 60 * 60 * 24 * 7);
    return json({ job, image });
  } catch (e) {
    console.error('generate failed', e);
    if (charged) await giveCredits(user, 1);
    return json({ error: 'La génération a échoué, ton crédit a été remboursé. Réessaie dans un instant.' }, 500);
  } finally {
    await redis('DEL', `lock:${user}`).catch(() => {});
  }
}
