// =============================================================================
// FruitStudio - Configuration
// =============================================================================
// C'est le SEUL fichier à modifier pour brancher la pub et le mode IA.
// =============================================================================

window.FRUIT_CONFIG = {
  // Adresse du serveur IA (le dossier fruits-api/ déployé sur Vercel).
  // Exemple : 'https://fruitstudio-api.vercel.app'
  // Laisse vide tant que le serveur n'est pas en ligne : l'onglet IA affichera "bientôt".
  API_BASE: '',

  // Google AdSense : ton identifiant éditeur (ca-pub-XXXXXXXXXXXXXXXX) et
  // l'identifiant d'un bloc d'annonce. Vide = aucun emplacement pub affiché.
  ADSENSE_CLIENT: '',
  ADSENSE_SLOT: '',

  // Ton compte TikTok, affiché sur la page (sans le @).
  TIKTOK_HANDLE: '',

  // Petit texte incrusté en bas des vidéos gratuites (pub gratuite pour le site).
  // Mets '' pour le retirer.
  WATERMARK: 'matheoguz.github.io/fruits',
};
