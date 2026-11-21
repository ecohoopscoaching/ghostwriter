/**
 * Lyric generation provider abstraction.
 *
 * The app ships with `builtInProvider`, which runs 100% locally with no
 * API key or external account required.
 *
 * `buildLiveLlmPrompts` prepares the exact system + user prompt needed to wire
 * a live LLM provider (Anthropic, OpenAI, or Gemini) behind a server endpoint
 * once an API key is supplied. Per the stop rule, no credentials are invented.
 */
import {
  HIT_MAKING_CHECKLIST,
  HIT_SONG_RULE,
  LIQUID_LEGEND_RULE,
  RAP_QUALITY_CHECKLIST,
  RAP_RULEBOOK_PROMPT,
  RNB_REPLAY_CHECKLIST,
  RNB_RULEBOOK_PROMPT,
} from '@/data/craftLibrary';
import { SONGWRITING_FORMULA, TOPIC_BIBLE_RULE } from '@/data/topics';
import { LIMITS } from './limits';
import { generateAceOfflineSong, generateOfflineSong } from './offlineLyrics';
import type { Rng } from './rng';
import type { SoundSpec } from './types';

export interface RawLyricDraft {
  title: string;
  lyrics: string;
}

export interface LyricProvider {
  readonly name: string;
  generate(args: {
    topic: string;
    spec: SoundSpec;
    rng: Rng;
    feedback?: string;
  }): Promise<RawLyricDraft>;
}

/** Local deterministic studio songwriter (no API key required). */
export const builtInProvider: LyricProvider = {
  name: 'GhostWriter Studio Engine (Local)',
  async generate({ topic, spec, rng }) {
    if (spec.target === 'ace') {
      return generateAceOfflineSong(topic, spec, rng);
    }
    return generateOfflineSong(topic, spec, rng);
  },
};

/**
 * Prompt contract ready for a live LLM backend (Anthropic / OpenAI / Gemini).
 * Never includes real producer names or internal foundation lines.
 */
export function buildLiveLlmPrompts(topic: string, spec: SoundSpec, feedback?: string): {
  system: string;
  user: string;
} {
  const isAce = spec.target === 'ace';
  const modeRulebook = spec.isRap
    ? `${RAP_RULEBOOK_PROMPT}\n${spec.flowMode.promptRule}`
    : RNB_RULEBOOK_PROMPT;

  const formatBlock = isAce
    ? [
        'You are GhostWriter, a professional songwriter optimizing lyrics for ACE Music (v1 / v1.1 Preview, Custom mode).',
        'Write one complete original song with full lyrics.',
        `HARD LIMIT: Total lyrics MUST be under ${LIMITS.ACE_LYRICS_MAX_CHARS} characters (aim for ${LIMITS.ACE_LYRICS_TARGET_MIN}–${LIMITS.ACE_LYRICS_TARGET_MAX}), INCLUDING section labels, direction lines, spaces, and line breaks.`,
        'Format: start with "TITLE: <song title>" on line 1, then a blank line, then the song. Never number bars.',
        `Section tags MUST carry the vocal marker ": ${spec.gender}": [Intro: ${spec.gender}], [Verse 1: ${spec.gender}], [Pre-Chorus: ${spec.gender}], [Chorus: ${spec.gender}], [Verse 2: ${spec.gender}], [Pre-Chorus: ${spec.gender}], [Chorus: ${spec.gender}], [Bridge: ${spec.gender}], [Final Chorus: ${spec.gender}], [Outro: ${spec.gender}].`,
        'Write EVERY chorus out in full. Do NOT drop the Bridge and do NOT fold the Final Chorus into the Outro.',
        'House structure: cold open (voice starts at 0:00 or after a short instrumental under 20 seconds); Chorus carries the title as a QUESTION; Bridge changes the question; Final Chorus flips the question into a STATEMENT; Outro mirrors the Intro.',
        'Put production and vocal delivery directions as standalone bracketed lines [...] between lyric lines (or a short trailing [...] cue on a sung line).',
        'Parentheses (...) inside a sung line are ONLY backing vocal echoes or ad-libs (e.g. Am I man enough (man enough)). Never use parentheses for directions.',
        'Never include real artist/producer names, commentary, or a style prompt. Say "Black", never "African American".',
      ].join('\n')
    : [
        'You are GhostWriter, a professional songwriter.',
        'Write one complete original song with full lyrics.',
        `HARD LIMIT: Total lyrics MUST be under ${LIMITS.LYRICS_MAX_CHARS} characters (aim for ${LIMITS.LYRICS_TARGET_MIN}–${LIMITS.LYRICS_TARGET_MAX}), INCLUDING section labels, bracket directions, and line breaks.`,
        'Format: start with "TITLE: <song title>" on line 1, then a blank line, then the song. Never number bars.',
        'Use simple, direct section labels on their own lines: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] as fitting.',
        `Put short vocal delivery directions in square brackets inside sections (at most ${LIMITS.MAX_CUES_PER_SECTION} cues per section, ${LIMITS.MAX_WORDS_PER_CUE} words max per cue), e.g. [low, close] or [falsetto peak].`,
        'Never include a sound prompt, commentary, or real artist/producer names in the output. Say "Black", never "African American".',
      ].join('\n');

  const hitChecklistBlock = [
    'FINAL HIT-MAKING CHECKLIST (verify before returning):',
    ...HIT_MAKING_CHECKLIST.map((item) => `- ${item}`),
  ].join('\n');

  const modeAuditBlock = [
    spec.isRap ? 'RAP FINAL QUALITY AUDIT:' : 'R&B REPLAY VALUE AUDIT:',
    ...(spec.isRap ? RAP_QUALITY_CHECKLIST : RNB_REPLAY_CHECKLIST).map((item) => `- ${item}`),
  ].join('\n');

  const system = [
    formatBlock,
    '',
    HIT_SONG_RULE,
    LIQUID_LEGEND_RULE,
    'Separate Persona (how the artist thinks/writes), Flow (rhythm/cadence), Voice (timbre/delivery), and Topic (subject/scene).',
    '',
    modeRulebook,
    '',
    hitChecklistBlock,
    '',
    modeAuditBlock,
  ].join('\n');

  const perspectiveLine = spec.perspective
    ? `Perspective: ${spec.perspective.label} — ${spec.perspective.description}${spec.perspective.example ? ` (e.g. "${spec.perspective.example}")` : ''}`
    : 'Perspective: Choose the most emotionally gripping angle (consider the least obvious person in the room when fitting).';

  const storytellingLine = spec.storytellingStyles.length
    ? `Storytelling Style${spec.storytellingStyles.length > 1 ? 's (combine naturally)' : ''}: ${spec.storytellingStyles
        .map((s) => `${s.label} (${s.description})`)
        .join(' + ')}`
    : '';

  const techniquesLine = spec.techniques.length
    ? `Optional Advanced Craft Techniques to weave in naturally: ${spec.techniques
        .map((t) => `${t.label} (${t.description})`)
        .join('; ')}`
    : '';

  const resolvedTopic = topic.trim() || 'An original, emotionally specific scene fitting the mood and sound';

  const user = [
    `Topic: ${resolvedTopic}`,
    `Mode: ${spec.isRap ? `Rap (${spec.flowMode.label})` : 'R&B / Vocal (Melody, Vowels & Pocket)'}`,
    `Scene Rule: ${TOPIC_BIBLE_RULE} Formula: ${SONGWRITING_FORMULA}.`,
    perspectiveLine,
    storytellingLine,
    techniquesLine,
    `Producer Sound / Genre DNA: ${spec.persona.sound.dna}`,
    `Mood: ${spec.mood.label} (${spec.mood.lyricTone})`,
    `Tempo: ${spec.tempo.label} (${spec.bpm} BPM, ${spec.key})`,
    `Vocalist: ${spec.voice.name} — ${spec.voice.note}`,
    feedback ? `Fix these validation issues from the previous draft:\n${feedback}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}
