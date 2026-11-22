/** Output target: ACE Music (primary) or Flow Music / Mozart AI (secondary). */
export type OutputTarget = 'ace' | 'flow';

export const DEFAULT_TARGET: OutputTarget = 'ace';

export interface TargetConfig {
  id: OutputTarget;
  name: string;
  shortName: string;
  modelNote: string;
  lyricsMax: number;
  styleMax: number;
  styleHeading: string;
  styleCopyLabel: string;
}

export const TARGETS: Record<OutputTarget, TargetConfig> = {
  ace: {
    id: 'ace',
    name: 'ACE Music',
    shortName: 'ACE v1 / v1.1 Preview · Custom',
    modelNote: 'ACE v1 includes a Duration control; v1.1 Preview does not.',
    lyricsMax: 5000,
    styleMax: 1000,
    styleHeading: 'STYLE',
    styleCopyLabel: 'Copy Style',
  },
  flow: {
    id: 'flow',
    name: 'Flow / Mozart',
    shortName: 'Flow Music / Mozart AI',
    modelNote: 'Legacy 3,000-character lyrics cap with compact sound prompt.',
    lyricsMax: 3000,
    styleMax: 1000,
    styleHeading: 'SOUND PROMPT',
    styleCopyLabel: 'Copy Sound Prompt',
  },
};

/** Hard generator limits. Every output is validated against these. */
export const LIMITS = {
  /** ACE Music Custom mode lyrics cap (everything included). */
  ACE_LYRICS_MAX_CHARS: 5000,
  /** ACE Music Custom mode style cap. */
  ACE_STYLE_MAX_CHARS: 1000,
  /** Flow / Mozart lyrics cap (everything included). */
  LYRICS_MAX_CHARS: 3000,
  /** Flow / Mozart sound prompt cap. */
  SOUND_MAX_CHARS: 1000,
  /** Target window we ask a live model to aim for on Flow / Mozart. */
  LYRICS_TARGET_MIN: 1900,
  LYRICS_TARGET_MAX: 2700,
  /** Target window we ask a live model to aim for on ACE Music. */
  ACE_LYRICS_TARGET_MIN: 2800,
  ACE_LYRICS_TARGET_MAX: 4600,
  /** Flow / Mozart cue limits ("a few cues at most per label"). */
  MAX_CUES_PER_SECTION: 3,
  MAX_WORDS_PER_CUE: 4,
  /** Model rewrite attempts before deterministic repair takes over. */
  MAX_MODEL_ATTEMPTS: 3,
} as const;

/** Simple, direct section labels allowed on Flow / Mozart. */
export const SECTION_NAMES = [
  'Instrumental Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Post-Chorus',
  'Hook',
  'Bridge',
  'Breakdown',
  'Interlude',
  'Outro',
] as const;

export type SectionName = (typeof SECTION_NAMES)[number];

/** Matches a Flow / Mozart label line, e.g. "[Verse 2]" or "[Instrumental Intro]". */
export const LABEL_LINE_RE =
  /^\[(Instrumental Intro|Intro|Verse(?: [1-9])?|Pre-Chorus|Chorus|Post-Chorus|Hook|Bridge|Breakdown|Interlude|Outro)\]$/;

/** Matches an optional ACE instrumental-only intro tag (1-2 bars, no vocals). */
export const ACE_INSTRUMENTAL_INTRO_RE = /^\[Instrumental Intro\]$/;

/** Matches an ACE native vocal section tag with vocal marker, e.g. "[Verse 1: male]" or "[Final Chorus: female]". */
export const ACE_LABEL_LINE_RE =
  /^\[(Verse(?: [1-9])?|Pre-Chorus|Chorus|Final Chorus|Post-Chorus|Bridge|Outro):\s*(male|female)\]$/;

/** Required vocal sections in a complete ACE vocal song (cold open at Verse 1; optional Instrumental Intro only). */
export const ACE_REQUIRED_SEQUENCE = [
  'Verse 1',
  'Pre-Chorus',
  'Chorus',
  'Verse 2',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Final Chorus',
  'Outro',
] as const;

/** Disallowed wording per house rules (must say "Black", never "African American"). */
export const DISALLOWED_WORDING_RE = /\bAfrican[\s-]American\b/i;

/** Character count used everywhere (UTF-16 length, same as textarea maxLength). */
export function charCount(text: string): number {
  return text.length;
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}
