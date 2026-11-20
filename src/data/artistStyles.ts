/**
 * Artist style / persona library — descriptive writing personas, never real
 * artists. The artist style shapes how the LYRICS are written only. It is
 * never pasted into the sound prompt, so a custom style the user types
 * (even one naming a real artist) can't leak into Flow or Mozart.
 *
 * Soul Glider is the owner's house artist. Choosing it removes the
 * "IGNORE the Soul Glider Custom Instructions…" opener from the sound prompt
 * (per voice-presets.md that opener is for non-Soul Glider use only).
 */
export interface ArtistStyle {
  id: string;
  name: string;
  brief: string;
  isSoulGlider?: boolean;
}

export const DEFAULT_ARTIST_ID = 'confessor';

export const ARTIST_STYLES: ArtistStyle[] = [
  { id: 'confessor', name: 'The Confessor', brief: 'First person, raw and vulnerable. Specific small details, plain words, nothing hidden.' },
  { id: 'street-poet', name: 'The Street Poet', brief: 'Dense internal rhyme, vivid street imagery, punchlines, sharp cadence.' },
  { id: 'romantic', name: 'The Romantic', brief: 'Tender and devoted, grown-and-sexy slow-jam imagery, never crude.' },
  { id: 'preachers-kid', name: "The Preacher's Kid", brief: 'Church roots: testimony, redemption, call-and-response, Sunday imagery.' },
  { id: 'storyteller', name: 'The Storyteller', brief: 'A narrative arc with characters and scenes, and a turn in the bridge.' },
  { id: 'showstopper', name: 'The Showstopper', brief: 'Big bold claims, anthemic chant-along hooks, larger than life.' },
  { id: 'night-rider', name: 'The Night Rider', brief: 'Cool and cinematic, late-night drives, understated menace.' },
  { id: 'old-soul', name: 'The Old Soul', brief: 'Classic phrasing, timeless images, warm hard-won wisdom.' },
  { id: 'dreamer', name: 'The Dreamer', brief: 'Hopeful and poetic, metaphors of light, sky and open roads.' },
  { id: 'soul-glider', name: 'Soul Glider', brief: 'House artist. Emotional but masculine R&B, melodic but never soft, built for high tenor and falsetto.', isSoulGlider: true },
];

export const CUSTOM_ARTIST_PREFIX = 'custom:';

export function resolveArtist(id: string): ArtistStyle {
  if (id.startsWith(CUSTOM_ARTIST_PREFIX)) {
    const text = id.slice(CUSTOM_ARTIST_PREFIX.length).trim();
    return { id, name: text || 'Custom', brief: text || 'Custom style' };
  }
  const a = ARTIST_STYLES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown artist style: ${id}`);
  return a;
}
