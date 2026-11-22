/**
 * Main song + STYLE / Sound Prompt orchestrator.
 *
 * Enforces strict Artist & Producer independence across all four creation modes:
 *   - 'full'         (Artist + Producer) — Full Song: Production + Vocals + Vocal Lyrics
 *   - 'instrumental' (Producer only)     — Instrumental: Production-only STYLE, zero vocal lyrics
 *   - 'acappella'    (Artist only)       — A Cappella: Vocals-only STYLE, unaccompanied cold-open lyrics
 *   - 'none'         (Neither selected)  — No Selection: empty STYLE & LYRICS (never invents defaults)
 */
import {
  getFlowMode,
  resolvePerspective,
  resolveStorytellingStyles,
  resolveTechniques,
} from '@/data/craftLibrary';
import { getMood } from '@/data/moods';
import { findPersona, type ProducerPersona } from '@/data/producerPersonas';
import { resolveTempo } from '@/data/tempos';
import { findVoice } from '@/data/voicePresets';
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
import {
  resolveCreationMode,
  type GenerationResult,
  type Selection,
  type SoundSpec,
} from './types';

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
  const persona = findPersona(selection.personaId);
  const voice = findVoice(selection.voiceId);
  const mode = resolveCreationMode(persona?.id, voice?.id);

  let bpm: number | undefined;
  let switchBpm: number | undefined;
  let key: string | undefined;

  if (persona) {
    const [minBpm, maxBpm] = tempo.bpm ?? inferPersonaBpm(persona);
    const rawBpm =
      minBpm === maxBpm ? minBpm : rng.int(minBpm, maxBpm) + (tempo.bpm ? 0 : mood.bpmShift);
    bpm = Math.max(minBpm, Math.min(maxBpm, rawBpm));

    switchBpm = persona.sound.switchBpm
      ? rng.int(persona.sound.switchBpm[0], persona.sound.switchBpm[1])
      : undefined;

    const keyMode =
      persona.sound.mode ??
      (mood.mode === 'either' ? (rng.chance(0.55) ? 'minor' : 'major') : mood.mode);
    key = keyMode === 'minor' ? rng.pick(MINOR_KEYS) : rng.pick(MAJOR_KEYS);
  } else if (mode === 'acappella' && tempo.bpm) {
    // Only apply BPM in A Cappella if the user explicitly selected a non-Auto tempo.
    const [minBpm, maxBpm] = tempo.bpm;
    bpm = minBpm === maxBpm ? minBpm : rng.int(minBpm, maxBpm);
  }

  // Strictly Artist-owned vocal performance identity. Producer NEVER overrides Artist.
  const isRap = voice?.category === 'rap';

  // Flow / Mozart non-Soul Glider opener applies only when a non-REELZ Producer is active.
  const isSoulGliderTrack = persona?.id === 'p36';
  const includeOpener = target === 'flow' && Boolean(persona) && !isSoulGliderTrack;

  const perspective = resolvePerspective(selection.perspectiveId);
  const storytellingStyles = resolveStorytellingStyles(selection.storytellingIds);
  const techniques = resolveTechniques(selection.techniqueIds);
  const flowMode = getFlowMode(selection.flowModeId);

  return {
    mode,
    target,
    mood,
    tempo,
    persona,
    voice,
    gender: voice?.gender,
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

  // Mode D: Neither selected — do not invent defaults or generate output.
  if (spec.mode === 'none') {
    const emptyLyricsVal =
      spec.target === 'ace'
        ? validateAceLyrics('', undefined, targetCfg.lyricsMax, 'none')
        : validateLyrics('', targetCfg.lyricsMax, 'none');
    const emptySoundVal =
      spec.target === 'ace'
        ? validateAceStyle('', targetCfg.styleMax, 'none')
        : validateSoundPrompt('', targetCfg.styleMax, 'none');

    return {
      title: '',
      lyrics: '',
      soundPrompt: '',
      spec,
      report: {
        mode: 'none',
        target: spec.target,
        engine: 'No Selection',
        seed,
        modelAttempts: 0,
        lyricsRepaired: false,
        soundTrimmed: [],
        lyrics: emptyLyricsVal,
        sound: emptySoundVal,
      },
    };
  }

  // 1. STYLE (ACE) or Sound Prompt (Flow / Mozart) — strictly <= 1,000 chars & zero banned names.
  const { prompt: soundPrompt, trimmed: soundTrimmed } =
    spec.target === 'ace'
      ? buildAceStyle(spec, targetCfg.styleMax)
      : buildSoundPrompt(spec, targetCfg.styleMax);

  const soundValidation =
    spec.target === 'ace'
      ? validateAceStyle(soundPrompt, targetCfg.styleMax, spec.mode)
      : validateSoundPrompt(soundPrompt, targetCfg.styleMax, spec.mode);

  // Mode B: Producer only (Instrumental) — zero vocal lyrics generated.
  if (spec.mode === 'instrumental') {
    const emptyLyricsVal =
      spec.target === 'ace'
        ? validateAceLyrics('', undefined, targetCfg.lyricsMax, 'instrumental')
        : validateLyrics('', targetCfg.lyricsMax, 'instrumental');

    return {
      title: '',
      lyrics: '',
      soundPrompt,
      spec,
      report: {
        mode: 'instrumental',
        target: spec.target,
        engine: 'Instrumental Style Engine',
        seed,
        modelAttempts: 0,
        lyricsRepaired: false,
        soundTrimmed,
        lyrics: emptyLyricsVal,
        sound: soundValidation,
      },
    };
  }

  // 2. Vocal modes ('full' or 'acappella'): Lyrics with Cold-Open validation & retry/repair loop.
  const gender = spec.gender ?? 'male';

  const validateFn = (txt: string) =>
    spec.target === 'ace'
      ? validateAceLyrics(txt, gender, targetCfg.lyricsMax, spec.mode)
      : validateLyrics(txt, targetCfg.lyricsMax, spec.mode);

  const repairFn = (txt: string) =>
    spec.target === 'ace'
      ? repairAceLyrics(txt, gender, targetCfg.lyricsMax, spec.mode)
      : repairLyrics(txt, targetCfg.lyricsMax, spec.mode);

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
      mode: spec.mode,
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
