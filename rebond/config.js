// Réglages de Rebond. Tant que supabaseUrl et supabaseAnonKey sont vides,
// l'appli tourne en mode démo (données dans le navigateur, paiement simulé).
// Voir README.md, étape 2, pour remplir ces valeurs.
window.REBOND_CONFIG = {
  // Supabase > Project Settings > API
  supabaseUrl: "",          // ex. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",      // la clé « anon public » (jamais la clé service_role)

  // Contact affiché dans l'appli et les pages légales
  contactEmail: "contact@rebond.example",

  // Adresse où les vendeurs envoient les paires à authentifier
  authAddress: "Rebond – Authentification, [ADRESSE À COMPLÉTER]",
};
