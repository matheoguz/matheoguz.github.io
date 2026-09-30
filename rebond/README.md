# Rebond

Marketplace de sneakers de seconde main entre particuliers.

- **0 % de commission vendeur** : le vendeur touche le prix affiché.
- **Protection acheteur** : 3 % du prix, plafonnée à 5 €. L'argent reste bloqué jusqu'à ce que l'acheteur confirme la réception.
- **Vérification d'authenticité** en option dès 80 € (7,90 €) : la paire passe par Rebond avant d'arriver chez l'acheteur.
- Offres négociées dans la messagerie, pointure mémorisée, prix moyen par modèle.

L'appli tourne dans deux modes, avec la même interface :

| Mode | Quand | Données | Paiement |
|---|---|---|---|
| **Démo** | `config.js` est vide (état actuel) | Dans le navigateur de chaque visiteur, avec 14 paires « Exemple » | Simulé |
| **Live** | `config.js` contient l'URL et la clé publique Supabase | Base Supabase partagée, comptes, photos, temps réel | Stripe (séquestre + versement au vendeur) |

## Contenu

```
rebond/
├── index.html            Structure de la page
├── config.js             Réglages (Supabase, e-mail de contact, adresse d'authentification)
├── assets/
│   ├── app.js            L'appli : pages, mode démo, mode live (Supabase)
│   ├── styles.css        Styles de l'appli
│   ├── consent.js        Bandeau cookies (règles CNIL)
│   ├── legal.css         Styles des pages légales
│   ├── fonts.css, fonts/ Polices hébergées sur le site (aucun appel à Google)
│   ├── vendor/           Bibliothèque Supabase hébergée sur le site
│   └── icons/            Icônes (onglet, écran d'accueil du téléphone)
├── legal/                CGU/CGV, confidentialité, cookies, mentions légales, règles et signalement
├── manifest.webmanifest  Appli installable sur téléphone
├── sw.js                 Service worker (hors ligne, installation)
└── supabase/
    ├── schema.sql        Tables, règles d'accès (RLS), fonctions, stockage des photos
    ├── cron.sql          Tâches automatiques
    └── functions/        Fonctions serveur Stripe
        ├── create-checkout/     Crée le paiement (le serveur recalcule les montants)
        ├── stripe-webhook/      Paiement reçu → commande ; session expirée → remise en vente
        ├── connect-onboarding/  Porte-monnaie vendeur (Stripe Connect Express)
        └── order-action/        Réception confirmée → versement ; annulation → remboursement ; authentification
```

## Essayer en local

```bash
cd rebond
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

---

## Passer en mode live

Compte environ 1 h la première fois. Tout se fait d'abord en **mode test** Stripe (aucun argent réel).

> Pour encaisser de l'argent, il faut une structure déclarée (une micro-entreprise suffit pour démarrer) et être majeur. Stripe vérifie l'identité du titulaire du compte.

### Étape 1 · Créer le projet Supabase

1. Crée un compte sur [supabase.com](https://supabase.com), puis **New project**. Choisis une **région en Europe** (Paris ou Francfort) : c'est ce qu'annonce la politique de confidentialité.
2. **SQL Editor** → **New query** → colle tout le contenu de `supabase/schema.sql` → **Run**. Le script peut être relancé sans risque.
3. **Authentication → URL Configuration** :
   - *Site URL* : `https://matheoguz.github.io/rebond/`
   - *Redirect URLs* : ajoute la même adresse (et `http://localhost:8000/` pour tester en local).
4. **Authentication → Providers → Email** : laisse « Confirm email » activé.
5. (Conseillé) **Authentication → Email Templates** : traduis les e-mails en français.

### Étape 2 · Brancher l'appli

1. **Project Settings → API** : copie *Project URL* et la clé **anon public**.
2. Colle-les dans `config.js` (`supabaseUrl`, `supabaseAnonKey`). La clé anon est faite pour être publique : ce sont les règles RLS du schéma qui protègent les données. **Ne mets jamais la clé `service_role` dans `config.js`.**
3. Renseigne aussi `contactEmail` et `authAddress`.
4. Publie. Crée ton compte sur le site, puis passe-toi modérateur (SQL Editor) :
   ```sql
   update public.profiles set is_admin = true where username = 'ton-pseudo';
   ```
   Le menu **Profil → Modération** apparaît (signalements, authentification).

À ce stade, les comptes, annonces, photos, favoris, messages, offres, signalements et la modération marchent. Il manque le paiement.

### Étape 3 · Brancher Stripe

1. Crée un compte [Stripe](https://dashboard.stripe.com), reste en **mode test**, et active **Connect** (type de compte : *Express*).
2. **Developers → API keys** : copie la clé secrète `sk_test_…`.
3. Installe la ligne de commande Supabase et relie le projet (le *project ref* est dans l'URL du projet) :
   ```bash
   cd rebond
   npx supabase init          # crée supabase/config.toml, sans toucher aux fonctions
   npx supabase login
   npx supabase link --project-ref <REF-DU-PROJET>
   ```
4. Enregistre les secrets des fonctions :
   ```bash
   npx supabase secrets set \
     STRIPE_SECRET_KEY=sk_test_... \
     SITE_URL=https://matheoguz.github.io/rebond/ \
     ALLOWED_ORIGIN=https://matheoguz.github.io \
     CRON_SECRET=$(openssl rand -hex 24)
   ```
   (`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement aux fonctions.)
5. Déploie les fonctions :
   ```bash
   npx supabase functions deploy create-checkout
   npx supabase functions deploy connect-onboarding
   npx supabase functions deploy order-action
   npx supabase functions deploy stripe-webhook --no-verify-jwt
   ```
6. Crée **deux** webhooks dans Stripe (**Developers → Webhooks → Add endpoint**), tous deux vers `https://<REF-DU-PROJET>.supabase.co/functions/v1/stripe-webhook` :
   - **Ton compte** : événements `checkout.session.completed` et `checkout.session.expired`.
   - **Comptes connectés** : événement `account.updated`.

   Puis enregistre leurs clés de signature :
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
   ```
7. Active les extensions `pg_cron` et `pg_net` (**Database → Extensions**), complète puis exécute `supabase/cron.sql`.
8. Teste un achat complet avec la carte `4242 4242 4242 4242` (date future, n'importe quel code), côté vendeur active le porte-monnaie avec les données de test Stripe, déclare l'envoi, confirme la réception : le virement apparaît dans Stripe.

### Étape 4 · Ouvrir au public

1. Complète tous les passages surlignés `[EN MAJUSCULES]` dans `legal/*.html` (entreprise, SIRET, médiateur, date) et **fais relire les textes par un·e juriste**. Ce sont des modèles sérieux, pas un avis juridique.
2. Adhère à un **médiateur de la consommation** (obligatoire : tu vends des services, la protection et l'authentification, à des particuliers).
3. Passe Stripe en **mode live** : nouvelles clés, `STRIPE_SECRET_KEY` et webhooks live, puis redéploie.
4. Relis la checklist ci-dessous.

## Comment l'argent circule

1. L'acheteur paie sur Stripe Checkout : prix + protection + livraison (+ authentification). La paire est **réservée 30 minutes** pendant le paiement.
2. L'argent est encaissé sur le compte Stripe de Rebond et **reste bloqué**.
3. Le vendeur envoie la paire et saisit le numéro de suivi. Si la vérification est choisie, il l'envoie à `authAddress` ; un modérateur la valide ou la refuse (remboursement automatique).
4. L'acheteur confirme la réception (ou, sans réponse, 14 jours après l'envoi) : Stripe **transfère** le prix et les frais de port au vendeur. Rebond garde la protection et l'authentification.
5. Si le vendeur n'envoie rien sous 5 jours, l'acheteur peut annuler : **remboursement intégral**.

> Les frais Stripe (environ 1,5 % + 0,25 € par carte européenne) sont payés par Rebond sur la protection acheteur. Au-delà d’environ 300 € de total, le plafond de 5 € ne les couvre plus : surveille-le, ou ajuste `FEES` dans `assets/app.js` **et** `supabase/functions/_shared/common.ts`.

## Sécurité

- Le navigateur n'a que la clé publique. Toutes les règles d'accès sont dans la base (RLS) : un membre ne lit que ses conversations et ses commandes, ne peut ni se déclarer modérateur, ni marquer une paire vendue, ni créer une commande.
- Les montants sont **recalculés par le serveur** (prix en base ou offre acceptée), jamais pris dans la requête du navigateur.
- Les webhooks Stripe sont vérifiés par signature. Chaque paiement n'est traité qu'une fois.
- Les numéros de carte et les IBAN ne passent jamais par Rebond.

Ces règles ont été testées sur une base PostgreSQL locale : 31 scénarios (faux vendeur, acheteur qui modifie un prix, inconnu qui lit une conversation, auto-promotion admin, suppression de compte pendant une commande…), tous refusés comme prévu.

## Checklist avant le lancement

- [ ] Structure juridique créée (SIRET), compte bancaire pro
- [ ] Passages `[À COMPLÉTER]` des pages légales remplis, textes relus par un·e juriste
- [ ] Médiateur de la consommation désigné et indiqué dans les CGU
- [ ] Registre des traitements RGPD tenu (modèle sur cnil.fr)
- [ ] Contrat de sous-traitance (DPA) Supabase accepté, région UE
- [ ] Procédure DAC7 : export annuel des vendeurs ≥ 30 ventes ou ≥ 2 000 € (requête SQL sur `orders`), déclaration sur impots.gouv
- [ ] Assurance responsabilité civile professionnelle
- [ ] Adresse et process d'authentification réels (qui contrôle, en combien de temps, photos du contrôle conservées)
- [ ] Stripe en mode live, webhooks live, test d'un vrai achat de faible montant
- [ ] E-mails d'authentification Supabase traduits, domaine d'envoi personnalisé (SMTP) pour éviter les spams

## Pistes pour la suite

- **Notifications par e-mail** (nouveau message, commande payée, colis envoyé) : webhook de base Supabase → fonction → [Resend](https://resend.com).
- **Étiquettes d'envoi automatiques** : API Boxtal ou Sendcloud, à la place de la saisie manuelle du numéro de suivi.
- **Appli sur les stores** : le site est déjà installable (« Ajouter à l'écran d'accueil ») ; pour l'App Store et le Play Store, l'emballer avec [Capacitor](https://capacitorjs.com).
- **Mesure d'audience** respectueuse (Matomo auto-hébergé), branchée sur `RebondConsent.onChange`.
