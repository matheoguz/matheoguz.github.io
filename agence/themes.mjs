// Thèmes visuels des sites clients. Chaque thème reprend le style d'un site de démo
// de /sites/ (restaurant, coiffeur, artisan) ou en ajoute un nouveau.
// Les images Unsplash listées ici sont celles déjà utilisées sur les démos.

const u = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const THEMES = {
  restaurant: {
    label: 'Restaurant, café, traiteur',
    fonts: 'family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@300;400;500;600',
    head: "'Playfair Display',Georgia,serif",
    body: "'Inter',system-ui,sans-serif",
    colors: { bg: '#f7f1e8', ink: '#2b2420', accent: '#7a2e2e', accent2: '#c49a5a', muted: '#6f645c', card: '#ffffff' },
    images: {
      hero: u('photo-1550966871-3ed3cdb5ed0c', 2000),
      about: u('photo-1663530761401-15eefb544889', 1000),
      band: u('photo-1414235077428-338989a2e8c0', 2000),
    },
    alts: { hero: 'La salle du restaurant', about: 'En cuisine', band: 'Une assiette de la maison' },
    labels: { services: 'La carte', servicesKicker: 'À déguster', cta: 'Réserver', about: 'Notre histoire' },
  },
  beaute: {
    label: 'Coiffeur, esthétique, barbier, onglerie',
    fonts: 'family=Unbounded:wght@500;700&family=Manrope:wght@400;500;700',
    head: "'Unbounded',system-ui,sans-serif",
    body: "'Manrope',system-ui,sans-serif",
    colors: { bg: '#fdf7f4', ink: '#1c1b1f', accent: '#b2584a', accent2: '#e8a598', muted: '#6b6670', card: '#ffffff' },
    images: {
      hero: u('photo-1600948836101-f9ffda59d250', 1800),
      about: u('photo-1634449571010-02389ed0f9b0', 1200),
      band: u('photo-1695527081848-1e46c06e6458', 1600),
    },
    alts: { hero: "L'intérieur du salon", about: 'Une coupe en cours', band: 'Coloration en cours' },
    labels: { services: 'Prestations & tarifs', servicesKicker: 'Nos prestations', cta: 'Prendre rendez-vous', about: 'Le salon' },
  },
  artisan: {
    label: 'Plombier, électricien, menuisier, BTP',
    fonts: 'family=Archivo:wght@500;700;800&family=Inter:wght@400;500;600',
    head: "'Archivo',system-ui,sans-serif",
    body: "'Inter',system-ui,sans-serif",
    colors: { bg: '#f4f7fb', ink: '#12202f', accent: '#0f3d6e', accent2: '#ff7a1a', muted: '#5a6878', card: '#ffffff' },
    images: {
      hero: u('photo-1676210134188-4c05dd172f89', 2000),
      about: u('photo-1749532125405-70950966b0e5', 1200),
    },
    alts: { hero: 'Intervention sur un chantier', about: 'Intervention dans une salle de bain' },
    labels: { services: 'Nos services', servicesKicker: 'Ce que nous faisons', cta: 'Demander un devis', about: "L'entreprise" },
  },
  commerce: {
    label: 'Boulangerie, boutique, épicerie, fleuriste',
    fonts: 'family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@400;500;700',
    head: "'Fraunces',Georgia,serif",
    body: "'DM Sans',system-ui,sans-serif",
    colors: { bg: '#faf6ef', ink: '#2a2118', accent: '#8a4f1c', accent2: '#e0b15c', muted: '#74685a', card: '#ffffff' },
    images: {},
    alts: {},
    labels: { services: 'Nos produits', servicesKicker: 'À la boutique', cta: 'Nous appeler', about: 'La maison' },
  },
  sante: {
    label: 'Coach, kiné, ostéo, bien-être, cours',
    fonts: 'family=Outfit:wght@500;700&family=Inter:wght@400;500;600',
    head: "'Outfit',system-ui,sans-serif",
    body: "'Inter',system-ui,sans-serif",
    colors: { bg: '#f3f7f5', ink: '#17241f', accent: '#2f6b57', accent2: '#9cc9b4', muted: '#5b6b65', card: '#ffffff' },
    images: {},
    alts: {},
    labels: { services: 'Séances & tarifs', servicesKicker: 'Accompagnement', cta: 'Prendre rendez-vous', about: 'Mon approche' },
  },
};
