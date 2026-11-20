/**
 * Moods. `descriptors` feed the sound prompt; `mode` and `bpmShift` steer the
 * key and tempo; `palette` picks the offline draft writer's word bank.
 */
export type Palette = 'ache' | 'fire' | 'glow' | 'shadow';

export interface Mood {
  id: string;
  label: string;
  descriptors: string[];
  mode: 'minor' | 'major' | 'either';
  bpmShift: number;
  lyricTone: string;
  palette: Palette;
}

export const DEFAULT_MOOD_ID = 'heartbroken';

export const MOODS: Mood[] = [
  { id: 'heartbroken', label: 'Heartbroken', descriptors: ['aching', 'bittersweet', 'late-night'], mode: 'minor', bpmShift: -4, lyricTone: 'raw, wounded, honest, specific details of loss', palette: 'ache' },
  { id: 'romantic', label: 'Romantic', descriptors: ['tender', 'warm', 'devoted'], mode: 'major', bpmShift: -2, lyricTone: 'tender devotion, sensual but tasteful, grown', palette: 'glow' },
  { id: 'triumphant', label: 'Triumphant', descriptors: ['victorious', 'soaring', 'proud'], mode: 'major', bpmShift: 4, lyricTone: 'earned victory, gratitude, swagger with heart', palette: 'fire' },
  { id: 'defiant', label: 'Defiant', descriptors: ['defiant', 'gritty', 'unbowed'], mode: 'minor', bpmShift: 3, lyricTone: 'standing tall, refusing to break, edge and pride', palette: 'fire' },
  { id: 'nostalgic', label: 'Nostalgic', descriptors: ['nostalgic', 'warm', 'wistful'], mode: 'either', bpmShift: -2, lyricTone: 'memories, old places, the way it used to be', palette: 'ache' },
  { id: 'hopeful', label: 'Hopeful', descriptors: ['hopeful', 'uplifting', 'bright'], mode: 'major', bpmShift: 2, lyricTone: 'light after the storm, faith in tomorrow', palette: 'glow' },
  { id: 'dark', label: 'Dark', descriptors: ['dark', 'brooding', 'tense'], mode: 'minor', bpmShift: 0, lyricTone: 'shadows, temptation, danger, cold resolve', palette: 'shadow' },
  { id: 'euphoric', label: 'Euphoric', descriptors: ['euphoric', 'celebratory', 'electric'], mode: 'major', bpmShift: 5, lyricTone: 'joy, release, the night of your life', palette: 'glow' },
  { id: 'reflective', label: 'Reflective', descriptors: ['reflective', 'introspective', 'calm'], mode: 'either', bpmShift: -3, lyricTone: 'looking inward, lessons learned, quiet truth', palette: 'ache' },
  { id: 'sensual', label: 'Sensual', descriptors: ['sensual', 'slow-burning', 'intimate'], mode: 'either', bpmShift: -3, lyricTone: 'slow, close, suggestive, never crude', palette: 'glow' },
];

export function getMood(id: string): Mood {
  const m = MOODS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown mood: ${id}`);
  return m;
}
