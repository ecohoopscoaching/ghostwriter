/**
 * Tempo presets for the Tempo dropdown.
 * Supports named tempo feels or a custom exact BPM ("custom:84").
 */
export interface TempoPreset {
  id: string;
  label: string;
  note: string;
  /** Undefined for "auto" (defers to the producer persona / genre tempo range). */
  bpm?: [number, number];
}

export const DEFAULT_TEMPO_ID = 'auto';
export const CUSTOM_TEMPO_PREFIX = 'custom:';

export const TEMPOS: TempoPreset[] = [
  { id: 'auto', label: 'Auto (Match Producer)', note: 'Uses the natural tempo of your selected producer' },
  { id: 'ballad', label: 'Ballad / Slow', note: '60–75 BPM · unhurried, intimate', bpm: [60, 75] },
  { id: 'slow-jam', label: 'Slow Jam / Laid-Back', note: '76–88 BPM · deep pocket, late-night', bpm: [76, 88] },
  { id: 'mid-tempo', label: 'Mid-Tempo Groove', note: '89–105 BPM · head-nod bounce', bpm: [89, 105] },
  { id: 'driving', label: 'Driving / Bounce', note: '106–122 BPM · forward movement', bpm: [106, 122] },
  { id: 'uptempo', label: 'Up-Tempo / Club', note: '123–140 BPM · energetic, dancefloor or halftime', bpm: [123, 140] },
  { id: 'fast', label: 'Fast / Double-Time', note: '141–175 BPM · urgent, rapid or salsa pace', bpm: [141, 175] },
];

export function resolveTempo(id: string): TempoPreset {
  if (id.startsWith(CUSTOM_TEMPO_PREFIX)) {
    const raw = id.slice(CUSTOM_TEMPO_PREFIX.length).trim();
    const n = Number.parseInt(raw.replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(n) && n >= 40 && n <= 220) {
      return { id, label: `${n} BPM`, note: 'Custom exact tempo', bpm: [n, n] };
    }
    return TEMPOS[0];
  }
  const found = TEMPOS.find((t) => t.id === id);
  return found ?? TEMPOS[0];
}
