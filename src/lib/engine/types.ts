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

/** What the user picked on the screen. */
export interface Selection {
  topic: string;
  moodId: string;
  /** Tempo preset ID (e.g. 'auto', 'slow-jam') or 'custom:<bpm>'. */
  tempoId: string;
  personaId: string;
  voiceId: string;
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
  target: OutputTarget;
  mood: Mood;
  tempo: TempoPreset;
  persona: ProducerPersona;
  voice: VoicePreset;
  gender: VocalGender;
  /** True when either the vocalist is a rap profile or the producer is rap-driven. */
  isRap: boolean;
  bpm: number;
  switchBpm?: number;
  key: string;
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
