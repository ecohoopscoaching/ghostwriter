import type {
  AdvancedTechnique,
  RapFlowMode,
  SongPerspective,
  StorytellingStyle,
} from '@/data/craftLibrary';
import type { Mood } from '@/data/moods';
import type { ProducerPersona } from '@/data/producerPersonas';
import type { TempoPreset } from '@/data/tempos';
import type { VocalGender, VoicePreset } from '@/data/voicePresets';
import type { OutputTarget } from './limits';

/** Four creation modes based on independent Artist and Producer selections. */
export type CreationMode = 'full' | 'instrumental' | 'acappella' | 'none';

export const CREATION_MODE_LABELS: Record<CreationMode, string> = {
  full: 'Full Song',
  instrumental: 'Instrumental',
  acappella: 'A Cappella',
  none: 'No Selection',
};

export function resolveCreationMode(
  personaId?: string | null,
  voiceId?: string | null,
): CreationMode {
  const hasProducer = Boolean(personaId && personaId.trim());
  const hasArtist = Boolean(voiceId && voiceId.trim());
  if (hasProducer && hasArtist) return 'full';
  if (hasProducer) return 'instrumental';
  if (hasArtist) return 'acappella';
  return 'none';
}

/** What the user picked on the screen. */
export interface Selection {
  topic: string;
  moodId: string;
  /** Tempo preset ID (e.g. 'auto', 'slow-jam') or 'custom:<bpm>'. */
  tempoId: string;
  /** Independently optional Producer ID (empty string = no Producer selected). */
  personaId?: string;
  /** Independently optional Artist vocal ID (empty string = no Artist selected). */
  voiceId?: string;
  /** Output target: 'ace' (default) or 'flow'. */
  target?: OutputTarget;
  /** Optional Songwriting Perspective ID (from 39 perspectives) or 'auto'. */
  perspectiveId?: string;
  /** Optional Storytelling Style IDs (up to 3 from 80 storytelling styles). */
  storytellingIds?: string[];
  /** Optional Advanced Songwriting Technique IDs (up to 3 from 30 techniques). */
  techniqueIds?: string[];
  /** Optional Rap Flow Mode ID (Rhythm Weaver / Chopper / Torrent / etc.). */
  flowModeId?: string;
}

/** The musical plan shared by the lyrics and the style/sound prompt. */
export interface SoundSpec {
  mode: CreationMode;
  target: OutputTarget;
  mood: Mood;
  tempo: TempoPreset;
  /** Present in 'full' and 'instrumental' modes only. */
  persona?: ProducerPersona;
  /** Present in 'full' and 'acappella' modes only. */
  voice?: VoicePreset;
  /** Present in 'full' and 'acappella' modes only. */
  gender?: VocalGender;
  /** Determined strictly by the selected Artist (voice.category === 'rap'). Never overridden by Producer. */
  isRap: boolean;
  /** Present when Producer is selected or user explicitly chose a non-Auto tempo. */
  bpm?: number;
  switchBpm?: number;
  /** Present when Producer is selected. */
  key?: string;
  includeOpener: boolean;
  perspective?: SongPerspective;
  storytellingStyles: StorytellingStyle[];
  techniques: AdvancedTechnique[];
  flowMode: RapFlowMode;
}

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  chars: number;
  max: number;
  issues: ValidationIssue[];
}

export interface GenerationReport {
  mode: CreationMode;
  target: OutputTarget;
  engine: string;
  seed: number;
  modelAttempts: number;
  /** True when deterministic repair had to change the model's lyrics. */
  lyricsRepaired: boolean;
  /** Phrases the style/sound prompt budget fitter dropped to stay under 1,000. */
  soundTrimmed: string[];
  lyrics: ValidationResult;
  sound: ValidationResult;
}

export interface GenerationResult {
  title: string;
  lyrics: string;
  /** Style prompt (ACE) or Sound prompt (Flow / Mozart). */
  soundPrompt: string;
  spec: SoundSpec;
  report: GenerationReport;
}
