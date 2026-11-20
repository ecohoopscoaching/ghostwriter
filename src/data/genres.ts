/**
 * Genres — users can select up to 2 genres to blend.
 * Uses specific Hip-Hop subgenres. Includes Bolero, Jazz, and Disney Soundtrack
 * (Rock and Country removed).
 */
export type GenreCategory = 'rnb-soul' | 'hiphop' | 'latin-jazz-dance' | 'pop-cinematic';

export interface Genre {
  id: string;
  label: string;
  promptLabel: string;
  category: GenreCategory;
  bpm: [number, number];
  drums: string[];
  bass: string[];
  instruments: string[];
  lyricStyle: string;
  rap: boolean;
}

export const GENRE_GROUPS: { id: GenreCategory; label: string }[] = [
  { id: 'rnb-soul', label: 'R&B & Soul' },
  { id: 'hiphop', label: 'Hip-Hop Subgenres' },
  { id: 'latin-jazz-dance', label: 'Latin, Jazz & Dance' },
  { id: 'pop-cinematic', label: 'Pop & Cinematic' },
];

export const DEFAULT_GENRE_IDS = ['rnb'] as const;
export const MAX_GENRES = 2;

export const GENRES: Genre[] = [
  // ── R&B & Soul ──
  {
    id: 'rnb',
    label: 'R&B',
    promptLabel: 'Contemporary R&B',
    category: 'rnb-soul',
    bpm: [68, 96],
    drums: ['crisp modern drums in a laid-back pocket'],
    bass: ['warm sub bass'],
    instruments: ['Rhodes', 'lush pads'],
    lyricStyle: 'melodic sung lines, intimate and conversational',
    rap: false,
  },
  {
    id: 'neosoul',
    label: 'Neo-Soul',
    promptLabel: 'Neo-soul',
    category: 'rnb-soul',
    bpm: [72, 94],
    drums: ['loose swung drums'],
    bass: ['round live bass'],
    instruments: ['Rhodes', 'jazzy chords', 'warm guitar'],
    lyricStyle: 'poetic and conversational with rich imagery',
    rap: false,
  },
  {
    id: 'soul',
    label: 'Classic Soul',
    promptLabel: 'Classic soul',
    category: 'rnb-soul',
    bpm: [70, 104],
    drums: ['live drums with a strong backbeat'],
    bass: ['warm electric bass'],
    instruments: ['organ', 'horns', 'piano'],
    lyricStyle: 'classic phrasing, direct emotion, call-and-response',
    rap: false,
  },
  {
    id: 'gospel',
    label: 'Gospel',
    promptLabel: 'Contemporary gospel',
    category: 'rnb-soul',
    bpm: [70, 120],
    drums: ['live drums', 'handclaps'],
    bass: ['gospel bass runs'],
    instruments: ['Hammond organ', 'piano', 'choir'],
    lyricStyle: 'testimony and praise, call-and-response with a choir',
    rap: false,
  },
  {
    id: 'blues',
    label: 'Blues',
    promptLabel: 'Soul blues',
    category: 'rnb-soul',
    bpm: [60, 96],
    drums: ['shuffle drums'],
    bass: ['walking bass'],
    instruments: ['electric blues guitar', 'piano'],
    lyricStyle: 'plainspoken lines, repetition with a twist, earthy images',
    rap: false,
  },

  // ── Hip-Hop Subgenres ──
  {
    id: 'boombap',
    label: 'Boom-Bap',
    promptLabel: 'East Coast boom-bap hip-hop',
    category: 'hiphop',
    bpm: [86, 96],
    drums: ['dusty swung kick and cracking snare'],
    bass: ['thick sampled bass'],
    instruments: ['chopped soul sample', 'vinyl texture'],
    lyricStyle: 'dense rap verses, multisyllabic rhyme, chanted hook',
    rap: true,
  },
  {
    id: 'gfunk',
    label: 'West Coast G-Funk',
    promptLabel: 'West Coast G-Funk hip-hop',
    category: 'hiphop',
    bpm: [88, 102],
    drums: ['laid-back swinging West Coast drums'],
    bass: ['elastic synth and electric funk bass'],
    instruments: ['high whining synth lead', 'warm Rhodes', 'talkbox accents'],
    lyricStyle: 'smooth behind-the-beat storytelling with West Coast bounce',
    rap: true,
  },
  {
    id: 'trap',
    label: 'Modern Trap',
    promptLabel: 'Modern trap hip-hop',
    category: 'hiphop',
    bpm: [132, 150],
    drums: ['rolling triplet hi-hats', 'hard snares', 'halftime bounce'],
    bass: ['heavy sliding 808s'],
    instruments: ['dark minor bells', 'ominous synth pads'],
    lyricStyle: 'rhythmic punchy lines, hard cadence, repeated hook',
    rap: true,
  },
  {
    id: 'melodic-trap',
    label: 'Melodic Trap',
    promptLabel: 'Melodic trap',
    category: 'hiphop',
    bpm: [124, 144],
    drums: ['crisp hats', 'bouncy trap percussion'],
    bass: ['fluid melodic 808s'],
    instruments: ['emotional piano', 'airy keys', 'warm guitar'],
    lyricStyle: 'emotional melodic rap verses with a soaring hook',
    rap: true,
  },
  {
    id: 'jazz-rap',
    label: 'Conscious / Jazz Rap',
    promptLabel: 'Conscious jazz rap',
    category: 'hiphop',
    bpm: [82, 96],
    drums: ['dusty swung live drums with light rimshots'],
    bass: ['warm upright jazz bass'],
    instruments: ['Rhodes chords', 'muted horn loops', 'vinyl crackle'],
    lyricStyle: 'reflective storytelling, intricate internal rhyme, thoughtful hook',
    rap: true,
  },
  {
    id: 'soul-sample-hiphop',
    label: 'Soul-Sample Hip-Hop',
    promptLabel: 'Soul-sample hip-hop',
    category: 'hiphop',
    bpm: [80, 94],
    drums: ['punchy classic drums with warm swing'],
    bass: ['warm rolling bass guitar'],
    instruments: ['pitched-up vintage soul vocal chops', 'swelling strings', 'piano'],
    lyricStyle: 'confessional storytelling over triumphant soulful hooks',
    rap: true,
  },
  {
    id: 'southern-bounce',
    label: 'Southern Bounce',
    promptLabel: 'Southern hip-hop bounce',
    category: 'hiphop',
    bpm: [74, 92],
    drums: ['heavy Southern kicks', 'snappy claps', 'syncopated hats'],
    bass: ['deep booming 808s'],
    instruments: ['brass stabs', 'soulful keys', 'organ chords'],
    lyricStyle: 'confident Southern cadence, call-and-response hooks',
    rap: true,
  },
  {
    id: 'drill',
    label: 'Dark Melodic Drill',
    promptLabel: 'Dark melodic drill',
    category: 'hiphop',
    bpm: [138, 146],
    drums: ['syncopated sliding hi-hats', 'off-beat drill snare'],
    bass: ['gliding distorted 808s'],
    instruments: ['haunting minor piano loop', 'dark vocal chop'],
    lyricStyle: 'urgent, clipped rhythmic bars with cold tension',
    rap: true,
  },
  {
    id: 'lofi-hiphop',
    label: 'Lo-Fi Hip-Hop',
    promptLabel: 'Lo-fi hip-hop',
    category: 'hiphop',
    bpm: [72, 86],
    drums: ['dusty unquantized drums', 'soft snare'],
    bass: ['warm muffled sub bass'],
    instruments: ['tape-warm Rhodes', 'soft jazz guitar', 'vinyl crackle'],
    lyricStyle: 'intimate late-night reflections, conversational cadence',
    rap: true,
  },

  // ── Latin, Jazz & Dance ──
  {
    id: 'bolero',
    label: 'Bolero',
    promptLabel: 'Classic romantic Bolero',
    category: 'latin-jazz-dance',
    bpm: [70, 92],
    drums: ['gentle bongos', 'soft maracas', 'warm claves'],
    bass: ['warm upright acoustic bass'],
    instruments: ['nylon-string acoustic guitar', 'requinto melodies', 'lush warm strings'],
    lyricStyle: 'deeply romantic, poetic, timeless longing and devotion',
    rap: false,
  },
  {
    id: 'jazz',
    label: 'Jazz',
    promptLabel: 'Modern acoustic jazz',
    category: 'latin-jazz-dance',
    bpm: [72, 132],
    drums: ['brushed snare and swung ride cymbal'],
    bass: ['walking upright bass'],
    instruments: ['grand piano with rich seventh chords', 'muted trumpet', 'warm tenor saxophone'],
    lyricStyle: 'smoky, conversational phrasing with sophisticated imagery',
    rap: false,
  },
  {
    id: 'salsa',
    label: 'Salsa',
    promptLabel: 'Classic salsa',
    category: 'latin-jazz-dance',
    bpm: [168, 196],
    drums: ['congas, bongos and timbales'],
    bass: ['tumbao bass'],
    instruments: ['piano montunos', 'punchy brass section'],
    lyricStyle: 'pregón verses and a coro call-and-response hook',
    rap: false,
  },
  {
    id: 'house',
    label: 'Soulful House',
    promptLabel: 'Soulful house',
    category: 'latin-jazz-dance',
    bpm: [118, 126],
    drums: ['four-on-the-floor kick', 'open hats', 'swung percussion'],
    bass: ['rolling bassline'],
    instruments: ['warm Rhodes stabs', 'lush chords'],
    lyricStyle: 'short repeatable lines, uplifting chant-like hook',
    rap: false,
  },
  {
    id: 'afrobeats',
    label: 'Afrobeats',
    promptLabel: 'Afrobeats',
    category: 'latin-jazz-dance',
    bpm: [98, 112],
    drums: ['syncopated Afro percussion', 'log drums'],
    bass: ['bouncy sub bass'],
    instruments: ['highlife guitar', 'warm synths'],
    lyricStyle: 'rhythmic, playful, repeated hook phrases',
    rap: false,
  },

  // ── Pop & Cinematic ──
  {
    id: 'pop',
    label: 'Pop',
    promptLabel: 'Modern pop',
    category: 'pop-cinematic',
    bpm: [96, 124],
    drums: ['punchy modern drums'],
    bass: ['tight synth bass'],
    instruments: ['bright synths', 'piano'],
    lyricStyle: 'simple, vivid, hook-first with a big singable chorus',
    rap: false,
  },
  {
    id: 'disney-soundtrack',
    label: 'Disney Soundtrack',
    promptLabel: 'Animated-film cinematic orchestral soundtrack',
    category: 'pop-cinematic',
    bpm: [74, 126],
    drums: ['sweeping orchestral percussion', 'timpani swells'],
    bass: ['warm orchestral low strings and contrabass'],
    instruments: ['soaring string section', 'expressive grand piano', 'flutes, French horns and harp'],
    lyricStyle: 'heartfelt character-driven storytelling building to a soaring, magical finale',
    rap: false,
  },
  {
    id: 'musical',
    label: 'Musical Theater',
    promptLabel: 'Musical theater',
    category: 'pop-cinematic',
    bpm: [72, 130],
    drums: ['theatrical live kit and orchestral percussion'],
    bass: ['orchestral low strings'],
    instruments: ['grand piano', 'ensemble strings and brass'],
    lyricStyle: 'character-driven storytelling with a dramatic arc',
    rap: false,
  },
];

export function getGenre(id: string): Genre {
  const g = GENRES.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown genre: ${id}`);
  return g;
}

export function resolveGenres(ids: readonly string[]): Genre[] {
  const unique = [...new Set(ids)].slice(0, MAX_GENRES);
  if (unique.length === 0) return [getGenre(DEFAULT_GENRE_IDS[0])];
  return unique.map(getGenre);
}
