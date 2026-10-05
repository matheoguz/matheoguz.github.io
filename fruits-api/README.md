# FruitStudio API (mode IA payant)

Serveur du mode **IA réaliste** de `matheoguz.github.io/fruits/`.
Le Studio gratuit n'en a pas besoin : il marche déjà tout seul.

## Comment ça marche

1. Le visiteur achète des crédits → paiement **Stripe** → Stripe prévient `/api/stripe-webhook` → crédits ajoutés.
2. Il écrit un texte → `/api/generate` retire 1 crédit et lance sur **fal.ai** :
   - `fal-ai/flux/schnell` : image du fruit-personnage (~0,003 $)
   - `fal-ai/elevenlabs/tts/multilingual-v2` : la voix (~0,03 $)
   - `fal-ai/kling-video/ai-avatar/v2/standard` : la bouche qui parle (**0,0562 $ / seconde**)
3. Le site demande `/api/status` toutes les 6 s jusqu'à ce que la vidéo soit prête.
   Si la génération échoue, le crédit est **remboursé automatiquement**.

**Coût pour toi** : environ 0,35 $ pour 5 s, 0,90 $ max pour 15 s (texte limité à 250 caractères).
**Prix de vente** (modifiable dans `lib/common.js` → `PACKS`) : 3 vidéos 3,99 €, 10 vidéos 9,99 €, 25 vidéos 19,99 €.

## Mise en ligne (environ 20 minutes)

> Il faut une carte bancaire pour fal.ai. Pour Stripe, il faut avoir 18 ans,
> sinon le compte doit être ouvert par un parent.

1. **fal.ai** : crée un compte sur https://fal.ai, ajoute 10 $ de crédit, puis
   *Dashboard → Keys → Create key*. Garde la clé.
2. **Vercel** : sur https://vercel.com, *Add New → Project*, importe le dépôt
   `matheoguz.github.io` et mets **Root Directory = `fruits-api`**. Déploie.
3. **Base de données** : dans le projet Vercel, *Storage → Create → Upstash Redis* (gratuit),
   puis connecte-la au projet. Les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` sont ajoutées toutes seules.
4. **Stripe** : sur https://dashboard.stripe.com, récupère la *clé secrète* (`sk_live_...`).
   Puis *Développeurs → Webhooks → Ajouter un endpoint* :
   - URL : `https://TON-PROJET.vercel.app/api/stripe-webhook`
   - Événements : `checkout.session.completed` et `checkout.session.async_payment_succeeded`
   - Copie le *secret de signature* (`whsec_...`).
5. Dans Vercel, *Settings → Environment Variables*, ajoute (voir `.env.example`) :
   `FAL_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `ALLOWED_ORIGIN`.
   Puis *Deployments → Redeploy*.
6. Dans `fruits/config.js` du site, mets `API_BASE: 'https://TON-PROJET.vercel.app'`.

Pour tester sans payer pour de vrai : utilise d'abord les clés Stripe **test** (`sk_test_...`)
et la carte `4242 4242 4242 4242`.

## Routes

| Route | Rôle |
|---|---|
| `GET /api/credits?user=` | Solde de crédits + liste des packs |
| `POST /api/checkout` | Crée la page de paiement Stripe |
| `POST /api/stripe-webhook` | Ajoute les crédits après paiement (signature vérifiée, une seule fois par paiement) |
| `POST /api/generate` | Retire 1 crédit et lance la génération |
| `GET /api/status?job=&user=` | État de la vidéo, remboursement si échec |
