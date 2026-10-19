// Thèmes visuels des sites clients. Règles suivies (Repos-/taste-skill) :
// une seule couleur d'accent par site, pas de palette « crème + cuivre » par défaut,
// pas d'Inter / Fraunces / Instrument Serif, un mode sombre pour chaque thème.
// "onAccent" est la couleur du texte posé sur l'accent (contraste AA vérifié).

export const THEMES = {
  restaurant: {
    label: 'Restaurant, café, traiteur',
    fonts: 'family=Playfair+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700',
    head: "'Playfair Display',Georgia,serif",
    body: "'Manrope',system-ui,sans-serif",
    light: { bg: '#f1f2ee', surface: '#ffffff', ink: '#18231d', muted: '#56625a', line: 'rgba(24,35,29,.12)', accent: '#2f5d46', onAccent: '#ffffff' },
    dark: { bg: '#101613', surface: '#18201b', ink: '#e8eee9', muted: '#9fb0a5', line: 'rgba(232,238,233,.12)', accent: '#7fc4a0', onAccent: '#0d1a13' },
    labels: { services: 'La carte', cta: 'Réserver', about: 'La maison' },
  },
  beaute: {
    label: 'Coiffeur, esthétique, barbier, onglerie',
    fonts: 'family=Unbounded:wght@500;600&family=Manrope:wght@400;500;600;700',
    head: "'Unbounded',system-ui,sans-serif",
    body: "'Manrope',system-ui,sans-serif",
    light: { bg: '#f6f6f7', surface: '#ffffff', ink: '#17171a', muted: '#5d5d66', line: 'rgba(23,23,26,.12)', accent: '#b0124f', onAccent: '#ffffff' },
    dark: { bg: '#121214', surface: '#1b1b1f', ink: '#f0eff3', muted: '#a4a3ad', line: 'rgba(240,239,243,.12)', accent: '#f47aa6', onAccent: '#2a0614' },
    labels: { services: 'Prestations et tarifs', cta: 'Prendre rendez-vous', about: 'Le salon' },
  },
  artisan: {
    label: 'Plombier, électricien, menuisier, BTP',
    fonts: 'family=Archivo:wght@400;500;600;700;800',
    head: "'Archivo',system-ui,sans-serif",
    body: "'Archivo',system-ui,sans-serif",
    light: { bg: '#f3f5f8', surface: '#ffffff', ink: '#111a24', muted: '#526070', line: 'rgba(17,26,36,.12)', accent: '#1e4fd1', onAccent: '#ffffff' },
    dark: { bg: '#0d1218', surface: '#151c25', ink: '#e7edf4', muted: '#97a5b5', line: 'rgba(231,237,244,.12)', accent: '#7aa2ff', onAccent: '#081633' },
    labels: { services: 'Nos interventions', cta: 'Demander un devis', about: "L'entreprise" },
  },
  commerce: {
    label: 'Boulangerie, boutique, épicerie, fleuriste',
    fonts: 'family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Geist:wght@400;500;600',
    head: "'Bricolage Grotesque',system-ui,sans-serif",
    body: "'Geist',system-ui,sans-serif",
    light: { bg: '#f3f4f4', surface: '#ffffff', ink: '#1c2226', muted: '#56626a', line: 'rgba(28,34,38,.12)', accent: '#b0412a', onAccent: '#ffffff' },
    dark: { bg: '#111517', surface: '#1a1f22', ink: '#ebeff1', muted: '#9ca8af', line: 'rgba(235,239,241,.12)', accent: '#ef8a6d', onAccent: '#2a0d05' },
    labels: { services: 'Nos produits', cta: 'Appeler', about: 'La maison' },
  },
  sante: {
    label: 'Coach, kiné, ostéo, bien-être, cours',
    fonts: 'family=Outfit:wght@500;600;700&family=Geist:wght@400;500;600',
    head: "'Outfit',system-ui,sans-serif",
    body: "'Geist',system-ui,sans-serif",
    light: { bg: '#f2f5f4', surface: '#ffffff', ink: '#14201c', muted: '#55655f', line: 'rgba(20,32,28,.12)', accent: '#0f6e66', onAccent: '#ffffff' },
    dark: { bg: '#0e1413', surface: '#161e1c', ink: '#e6efec', muted: '#9bb0aa', line: 'rgba(230,239,236,.12)', accent: '#5fd0c2', onAccent: '#052420' },
    labels: { services: 'Séances et tarifs', cta: 'Prendre rendez-vous', about: 'Mon approche' },
  },
};
