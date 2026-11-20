/**
 * Main song + style/sound prompt orchestrator.
 *
 * The selected Producer Persona defines the genre and sonic architecture;
 * Mood and Tempo steer emotional feel, key mode, and BPM.
 *
 * Default target: ACE Music (v1 / v1.1 Preview, Custom mode)
 *   - Lyrics cap: 5,000 chars (native section tags with vocal marker, standalone
 *     direction lines, echoes in parentheses, full 10-section structure)
 *   - Style cap: 1,000 chars (one flowing prose paragraph ending verbatim with
 *     the natural human vocal guardrail)
 *
 * Secondary target: Flow Music / Mozart AI
 *   - Lyrics cap: 3,000 chars
 *   - Sound prompt cap: 1,000 chars
 */
import {
  getFlowMode,
  resolvePerspective,
  resolveStorytellingStyles,
  resolveTechniques,
} from '@/data/craftLibrary';
import { getMood } from '@/data/moods';
import { getPersona, type ProducerPersona } from '@/data/producerPersonas';
import { resolveTempo } from '@/data/tempos';
import { getVoice } from '@/data/voicePresets';
import { DEFAULT_TARGET, LIMITS, TARGETS } from './limits';
import {
  parseModelOutput,
  repairAceLyrics,
  repairLyrics,
  validateAceLyrics,
  validateLyrics,
} from './lyrics';
import { builtInProvider, type LyricProvider } from './providers';
import { createRng, newSeed } from './rng';
import {
  buildAceStyle,
  buildSoundPrompt,
  validateAceStyle,
  validateSoundPrompt,
} from './soundPrompt';
import type { GenerationResult, Selection, SoundSpec } from './types';

const MINOR_KEYS = [
  'C minor', 'C# minor', 'D minor', 'Eb minor', 'E minor', 'F minor',
  'F# minor', 'G minor', 'Ab minor', 'A minor', 'Bb minor', 'B minor',
] as const;

const MAJOR_KEYS = [
  'C major', 'Db major', 'D major', 'Eb major', 'E major', 'F major',
  'Gb major', 'G major', 'Ab major', 'A major', 'Bb major', 'B major',
] as const;

/** Infers a natural BPM range straight from the producer persona's own genre DNA. */
function inferPersonaBpm(persona: ProducerPersona): [number, number] {
  if (persona.sound.bpm) return persona.sound.bpm;
  const dna = persona.sound.dna.toLowerCase();
  if (/\bsalsa\b|\btimba\b/.test(dna)) return [168, 192];
  if (/\btrap\b/.test(dna) && !/\bblues\b/.test(dna)) return [130, 146];
  if (/\bhouse\b|\bdance\b/.test(dna)) return [116, 126];
  if (/\bmarching-band\b|\banimated-musical\b/.test(dna)) return [96, 120];
  if (/\bclub bounce\b/.test(dna)) return [94, 106];
  if (/\bboom-bap\b|\bfunk\b|\bwest coast\b|\bhip-hop\b|\brap\b/.test(dna)) return [84, 98];
  if (/\bblues\b|\bsparse\b|\bstripped-down\b|\blate-night\b|\bslow\b/.test(dna)) return [66, 84];
  return [74, 94];
}

export function buildSoundSpec(selection: Selection, seed: number): SoundSpec {
  const rng = createRng(seed);
  const target = selection.target ?? DEFAULT_TARGET;
  const mood = getMood(selection.moodId);
  const tempo = resolveTempo(selection.tempoId);
  const persona = getPersona(selection.personaId);
  const voice = getVoice(selection.voiceId);

  const [minBpm, maxBpm] = tempo.bpm ?? inferPersonaBpm(persona);
  const rawBpm =
    minBpm === maxBpm ? minBpm : rng.int(minBpm, maxBpm) + (tempo.bpm ? 0 : mood.bpmShift);
  const bpm = Math.max(minBpm, Math.min(maxBpm, rawBpm));

  const switchBpm = persona.sound.switchBpm
    ? rng.int(persona.sound.switchBpm[0], persona.sound.switchBpm[1])
    : undefined;

  const mode =
    persona.sound.mode ??
    (mood.mode === 'either' ? (rng.chance(0.55) ? 'minor' : 'major') : mood.mode);

  const key = mode === 'minor' ? rng.pick(MINOR_KEYS) : rng.pick(MAJOR_KEYS);

  const isRap =
    voice.category === 'rap' ||
    (/\b(rap|boom-bap|trap)\b/i.test(persona.sound.dna) && !/\br&b\b/i.test(persona.sound.dna));

  // Per voice-presets.md: non-Soul Glider opener applies on Flow / Mozart target only.
  const isSoulGliderTrack = persona.id === 'p36';
  const includeOpener = target === 'flow' && !isSoulGliderTrack;

  const perspective = resolvePerspective(selection.perspectiveId);
  const storytellingStyles = resolveStorytellingStyles(selection.storytellingIds);
  const techniques = resolveTechniques(selection.techniqueIds);
  const flowMode = getFlowMode(selection.flowModeId);

  return {
    target,
    mood,
    tempo,
    persona,
    voice,
    gender: voice.gender,
    isRap,
    bpm,
    switchBpm,
    key,
    includeOpener,
    perspective,
    storytellingStyles,
    techniques,
    flowMode,
  };
}

export interface GenerateOptions {
  seed?: number;
  provider?: LyricProvider;
}

export async function generateSong(
  selection: Selection,
  options: GenerateOptions = {},
): Promise<GenerationResult> {
  const seed = options.seed ?? newSeed();
  const provider = options.provider ?? builtInProvider;
  const spec = buildSoundSpec(selection, seed);
  const targetCfg = TARGETS[spec.target];

  // 1. Style (ACE) or Sound Prompt (Flow / Mozart) — guaranteed ≤ 1,000 chars & zero banned names.
  const { prompt: soundPrompt, trimmed: soundTrimmed } =
    spec.target === 'ace'
      ? buildAceStyle(spec, targetCfg.styleMax)
      : buildSoundPrompt(spec, targetCfg.styleMax);

  const soundValidation =
    spec.target === 'ace'
      ? validateAceStyle(soundPrompt, targetCfg.styleMax)
      : validateSoundPrompt(soundPrompt, targetCfg.styleMax);

  // 2. Lyrics with validation & retry/repair loop.
  const validateFn = (txt: string) =>
    spec.target === 'ace'
      ? validateAceLyrics(txt, spec.gender, targetCfg.lyricsMax)
      : validateLyrics(txt, targetCfg.lyricsMax);

  const repairFn = (txt: string) =>
    spec.target === 'ace'
      ? repairAceLyrics(txt, spec.gender, targetCfg.lyricsMax)
      : repairLyrics(txt, targetCfg.lyricsMax);

  let title = '';
  let lyrics = '';
  let lyricsValidation = validateFn('');
  let attempts = 0;
  let repaired = false;
  let feedback: string | undefined;

  for (let i = 0; i < LIMITS.MAX_MODEL_ATTEMPTS; i++) {
    attempts = i + 1;
    const rng = createRng((seed + i * 7919) >>> 0);
    const draft = await provider.generate({
      topic: selection.topic,
      spec,
      rng,
      feedback,
    });
    const parsed = parseModelOutput(draft.lyrics);
    title = draft.title || parsed.title || 'Untitled';
    lyrics = parsed.lyrics || draft.lyrics;

    lyricsValidation = validateFn(lyrics);
    if (lyricsValidation.ok) break;

    feedback = lyricsValidation.issues.map((iss) => `- ${iss.message}`).join('\n');
    if (provider === builtInProvider) break;
  }

  if (!lyricsValidation.ok) {
    lyrics = repairFn(lyrics);
    repaired = true;
    lyricsValidation = validateFn(lyrics);
  }

  return {
    title,
    lyrics,
    soundPrompt,
    spec,
    report: {
      target: spec.target,
      engine: provider.name,
      seed,
      modelAttempts: attempts,
      lyricsRepaired: repaired,
      soundTrimmed,
      lyrics: lyricsValidation,
      sound: soundValidation,
    },
  };
}
