export type Track = { title: string; artist: string };

export type Scene =
  | "moon"
  | "heart"
  | "love"
  | "pulse"
  | "road"
  | "rain"
  | "sun"
  | "wave"
  | "fire"
  | "stars";

export type Mood = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  /** Short SEO / social description, e.g. "Music for your 2AM moments." */
  seo: string;
  description: string;
  /** Original one-liner shown on the mood page (never copyrighted lyrics). */
  caption: string;
  scene: Scene;
  /** Accent colors: [primary, secondary, deep]. */
  colors: [string, string, string];
  tracks: Track[];
};

export const moods: Mood[] = [
  {
    slug: "late-night",
    seo: "Music for your 2AM moments.",
    name: "Late Night",
    emoji: "🌙",
    tagline: "For when the world is asleep and your mind isn't.",
    description:
      "Slow R&B, hazy synths and soft voices for the hours after midnight. Lights off, headphones on, thoughts wide open.",
    caption: "2:47 AM. Still awake. Still thinking about it.",
    scene: "moon",
    colors: ["#8b7bff", "#3b2fbf", "#0b0820"],
    tracks: [
      { title: "After Hours", artist: "The Weeknd" },
      { title: "Get You", artist: "Daniel Caesar" },
      { title: "Snooze", artist: "SZA" },
      { title: "Marvins Room", artist: "Drake" },
      { title: "Do I Wanna Know?", artist: "Arctic Monkeys" },
      { title: "Apocalypse", artist: "Cigarettes After Sex" },
      { title: "everything i wanted", artist: "Billie Eilish" },
      { title: "Wicked Games", artist: "The Weeknd" },
      { title: "Self Control", artist: "Frank Ocean" },
      { title: "Lovers Rock", artist: "TV Girl" },
    ],
  },
  {
    slug: "heartbreak",
    seo: "Songs for when it hurts — and for healing after.",
    name: "Heartbreak",
    emoji: "💔",
    tagline: "It's okay to not be okay tonight.",
    description:
      "The songs that understand you better than your friends do right now. Cry, scream, heal — in that order.",
    caption: "You said forever. I believed you.",
    scene: "heart",
    colors: ["#ff4d6d", "#9d1037", "#1a0510"],
    tracks: [
      { title: "Someone Like You", artist: "Adele" },
      { title: "drivers license", artist: "Olivia Rodrigo" },
      { title: "Someone You Loved", artist: "Lewis Capaldi" },
      { title: "when the party's over", artist: "Billie Eilish" },
      { title: "Ivy", artist: "Frank Ocean" },
      { title: "Call Out My Name", artist: "The Weeknd" },
      { title: "Too Good at Goodbyes", artist: "Sam Smith" },
      { title: "Glimpse of Us", artist: "Joji" },
      { title: "Back to December", artist: "Taylor Swift" },
      { title: "I miss you, I'm sorry", artist: "Gracie Abrams" },
    ],
  },
  {
    slug: "in-love",
    seo: "Songs for when someone lives in your head rent-free.",
    name: "In Love",
    emoji: "❤️",
    tagline: "Butterflies, but make it a playlist.",
    description:
      "Warm, glowing love songs for when someone lives rent-free in your head. Send one to them. You know who.",
    caption: "Every song sounds like you now.",
    scene: "love",
    colors: ["#ff7eb3", "#c2185b", "#1c0614"],
    tracks: [
      { title: "Best Part", artist: "Daniel Caesar" },
      { title: "Thinkin Bout You", artist: "Frank Ocean" },
      { title: "Perfect", artist: "Ed Sheeran" },
      { title: "I Wanna Be Yours", artist: "Arctic Monkeys" },
      { title: "Adore You", artist: "Harry Styles" },
      { title: "Lover", artist: "Taylor Swift" },
      { title: "Loving Is Easy", artist: "Rex Orange County" },
      { title: "All of Me", artist: "John Legend" },
      { title: "Just the Way You Are", artist: "Bruno Mars" },
      { title: "Crazy in Love", artist: "Beyoncé" },
    ],
  },
  {
    slug: "gym",
    seo: "High-energy songs for your hardest sets.",
    name: "Gym",
    emoji: "🏋️",
    tagline: "One more rep. Then another.",
    description:
      "Heavy bass, hard drops and zero excuses. Built for PRs, last sets and the walk back to the locker room like a main character.",
    caption: "Pain is temporary. This playlist isn't.",
    scene: "pulse",
    colors: ["#c6ff3d", "#3f8f00", "#0a1203"],
    tracks: [
      { title: "Till I Collapse", artist: "Eminem" },
      { title: "SICKO MODE", artist: "Travis Scott" },
      { title: "HUMBLE.", artist: "Kendrick Lamar" },
      { title: "X Gon' Give It to Ya", artist: "DMX" },
      { title: "Believer", artist: "Imagine Dragons" },
      { title: "Nonstop", artist: "Drake" },
      { title: "FE!N", artist: "Travis Scott" },
      { title: "Remember the Name", artist: "Fort Minor" },
      { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis" },
      { title: "Eye of the Tiger", artist: "Survivor" },
    ],
  },
  {
    slug: "night-drive",
    seo: "Songs for empty roads and city lights at 2AM.",
    name: "Night Drive",
    emoji: "🚗",
    tagline: "Empty roads. City lights. Volume up.",
    description:
      "Synthwave, neon pop and slow-burning anthems for 2AM drives with the windows down and nowhere to be.",
    caption: "No destination. Just the road and this song.",
    scene: "road",
    colors: ["#2de2ff", "#7a2dff", "#05061a"],
    tracks: [
      { title: "Blinding Lights", artist: "The Weeknd" },
      { title: "Nightcall", artist: "Kavinsky" },
      { title: "Midnight City", artist: "M83" },
      { title: "505", artist: "Arctic Monkeys" },
      { title: "Nights", artist: "Frank Ocean" },
      { title: "The Less I Know the Better", artist: "Tame Impala" },
      { title: "Sweater Weather", artist: "The Neighbourhood" },
      { title: "A Real Hero", artist: "College & Electric Youth" },
      { title: "Instant Crush", artist: "Daft Punk" },
      { title: "goosebumps", artist: "Travis Scott" },
    ],
  },
  {
    slug: "sad-rainy",
    seo: "Soft, sad songs for grey days and rainy windows.",
    name: "Sad & Rainy",
    emoji: "🌧️",
    tagline: "Raindrops on the window. Thoughts on repeat.",
    description:
      "Soft guitars and aching voices for grey days, foggy windows and feelings you can't quite name.",
    caption: "The sky gets it today.",
    scene: "rain",
    colors: ["#7fa7d9", "#2e4a7a", "#070c16"],
    tracks: [
      { title: "No Surprises", artist: "Radiohead" },
      { title: "The Scientist", artist: "Coldplay" },
      { title: "Skinny Love", artist: "Bon Iver" },
      { title: "lovely", artist: "Billie Eilish & Khalid" },
      { title: "Motion Sickness", artist: "Phoebe Bridgers" },
      { title: "Good News", artist: "Mac Miller" },
      { title: "Video Games", artist: "Lana Del Rey" },
      { title: "Youth", artist: "Daughter" },
      { title: "People Help the People", artist: "Birdy" },
      { title: "Fade Into You", artist: "Mazzy Star" },
    ],
  },
  {
    slug: "sunset",
    seo: "Golden hour songs for warm skies and slow evenings.",
    name: "Sunset",
    emoji: "🌅",
    tagline: "Golden hour feels, all day long.",
    description:
      "Warm, nostalgic songs for golden skies, beach evenings and that perfect moment when the day melts away.",
    caption: "Stay in this light a little longer.",
    scene: "sun",
    colors: ["#ffb347", "#ff5e62", "#1c0b14"],
    tracks: [
      { title: "Sunflower", artist: "Post Malone & Swae Lee" },
      { title: "Sunset Lover", artist: "Petit Biscuit" },
      { title: "golden hour", artist: "JVKE" },
      { title: "Pink + White", artist: "Frank Ocean" },
      { title: "Electric Feel", artist: "MGMT" },
      { title: "Let It Happen", artist: "Tame Impala" },
      { title: "Riptide", artist: "Vance Joy" },
      { title: "Dreams", artist: "Fleetwood Mac" },
      { title: "Island in the Sun", artist: "Weezer" },
      { title: "Here Comes the Sun", artist: "The Beatles" },
    ],
  },
  {
    slug: "chill",
    seo: "Laid-back songs to slow down, study or do nothing.",
    name: "Chill",
    emoji: "😌",
    tagline: "Slow down. Breathe. Press play.",
    description:
      "Smooth grooves and easy vibes for lazy Sundays, study sessions and doing absolutely nothing — beautifully.",
    caption: "Nowhere to be. Nothing to prove.",
    scene: "wave",
    colors: ["#5eead4", "#0f766e", "#03110f"],
    tracks: [
      { title: "Redbone", artist: "Childish Gambino" },
      { title: "Japanese Denim", artist: "Daniel Caesar" },
      { title: "Location", artist: "Khalid" },
      { title: "Dang!", artist: "Mac Miller" },
      { title: "Come Through and Chill", artist: "Miguel" },
      { title: "Electric", artist: "Alina Baraz" },
      { title: "Cigarette Daydreams", artist: "Cage the Elephant" },
      { title: "Put Your Records On", artist: "Corinne Bailey Rae" },
      { title: "Sunday Best", artist: "Surfaces" },
      { title: "Coffee", artist: "beabadoobee" },
    ],
  },
  {
    slug: "motivation",
    seo: "Anthems to get up, lock in and chase it.",
    name: "Motivation",
    emoji: "🔥",
    tagline: "Main character energy, on demand.",
    description:
      "Anthems for chasing the dream, crushing the deadline and proving everyone wrong. Your comeback starts at track one.",
    caption: "They'll call it luck. You'll know it was this.",
    scene: "fire",
    colors: ["#ff7a18", "#d4145a", "#170606"],
    tracks: [
      { title: "Lose Yourself", artist: "Eminem" },
      { title: "Hall of Fame", artist: "The Script" },
      { title: "Unstoppable", artist: "Sia" },
      { title: "Alright", artist: "Kendrick Lamar" },
      { title: "Started From the Bottom", artist: "Drake" },
      { title: "Titanium", artist: "David Guetta" },
      { title: "Don't Stop Me Now", artist: "Queen" },
      { title: "The Nights", artist: "Avicii" },
      { title: "Thunder", artist: "Imagine Dragons" },
      { title: "Feeling Good", artist: "Nina Simone" },
    ],
  },
  {
    slug: "sleep",
    seo: "Calm music to quiet your mind and fall asleep.",
    name: "Sleep",
    emoji: "😴",
    tagline: "Let the music carry you under.",
    description:
      "Gentle piano, ambient textures and soft voices to quiet your mind and drift off. No drops, no surprises.",
    caption: "Close your eyes. We'll take it from here.",
    scene: "stars",
    colors: ["#a5b4fc", "#4338ca", "#05061a"],
    tracks: [
      { title: "Weightless", artist: "Marconi Union" },
      { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
      { title: "Clair de Lune", artist: "Claude Debussy" },
      { title: "Gymnopédie No. 1", artist: "Erik Satie" },
      { title: "Holocene", artist: "Bon Iver" },
      { title: "Saturn", artist: "Sleeping At Last" },
      { title: "Ocean Eyes", artist: "Billie Eilish" },
      { title: "Bloom", artist: "The Paper Kites" },
      { title: "Avril 14th", artist: "Aphex Twin" },
      { title: "Re: Stacks", artist: "Bon Iver" },
    ],
  },
];

export function getMood(slug: string): Mood | undefined {
  return moods.find((m) => m.slug === slug);
}

export const site = {
  name: "LyricMood",
  url: "https://matheoguz.github.io/lyricmood",
  description: "Find the music that matches how you feel. Pick your mood, press play.",
  /**
   * 👉 YOUR TIKTOK HANDLE GOES HERE (without the @), e.g. tiktok: "lyricmood",
   * then run `npm run publish-site`. While it is the placeholder below,
   * the "FOLLOW ON TIKTOK" buttons stay hidden so visitors never hit a broken link.
   */
  tiktok: "REMPLACE_PAR_MON_PSEUDO",
};

const TIKTOK_PLACEHOLDER = "REMPLACE_PAR_MON_PSEUDO";

/** Public TikTok profile URL, or null while the handle has not been configured. */
export function tiktokUrl(): string | null {
  const handle = site.tiktok.trim().replace(/^@/, "");
  if (!handle || handle === TIKTOK_PLACEHOLDER) return null;
  return `https://www.tiktok.com/@${encodeURIComponent(handle)}`;
}
