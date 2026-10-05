import { json, preflight, getCredits, PACKS, USER_RE } from '../lib/common.js';

export function OPTIONS() {
  return preflight();
}

// GET /api/credits?user=XXX -> { credits, packs }
export async function GET(request) {
  const user = new URL(request.url).searchParams.get('user') || '';
  if (!USER_RE.test(user)) return json({ error: 'Utilisateur invalide' }, 400);
  try {
    const credits = await getCredits(user);
    return json({ credits, packs: PACKS.map(({ id, credits: c, price }) => ({ id, credits: c, price })) });
  } catch (e) {
    console.error(e);
    return json({ error: 'Serveur indisponible' }, 500);
  }
}
