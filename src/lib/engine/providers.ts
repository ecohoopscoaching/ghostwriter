/**
 * Lyric generation provider abstraction & live LLM prompt compiler.
 *
 * Enforces:
 *   - Strict Artist / Producer independence (vocal style owned solely by Artist)
 *   - Global Cold-Open Rule (immediate Verse 1 preferred; optional 1-2 bar
 *     [Instrumental Intro] ONLY for Full Song with zero vocals; forbidden for A Cappella)
 *   - Zero vocal intro ad-libs, hums, spoken words, or title chants
 *   - Natural use of the topic/title (never mechanically stuffed into unrelated lines)
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
    if (spec.mode === 'instrumental' || spec.mode === 'none') {
      return { title: '', lyrics: '' };
    }
    if (spec.target === 'ace') {
      return generateAceOfflineSong(topic, spec, rng);
    }
    return generateOfflineSong(topic, spec, rng);
  },
};

/**
 * Prompt contract ready for a live LLM backend (Gemini / Anthropic / OpenAI).
 * Never includes real producer names or internal foundation lines.
 */
export function buildLiveLlmPrompts(topic: string, spec: SoundSpec, feedback?: string): {
  system: string;
  user: string;
} {
  const isAce = spec.target === 'ace';
  const isAcappella = spec.mode === 'acappella';
  const gender = spec.gender ?? 'male';

  const modeRulebook = spec.isRap
    ? `${RAP_RULEBOOK_PROMPT}\n${spec.flowMode.promptRule}`
    : RNB_RULEBOOK_PROMPT;

  const coldOpenBlock = [
    'GLOBAL COLD-OPEN RULE (STRICT — ZERO EXCEPTIONS):',
    isAcappella
      ? `- This is an A CAPPELLA song. Begin IMMEDIATELY with ${isAce ? `[Verse 1: ${gender}]` : '[Verse 1]'}. NO [Instrumental Intro] and NO instrument/drum/beat/band directions anywhere in the lyrics.`
      : `- Preferred opening: begin IMMEDIATELY with ${isAce ? `[Verse 1: ${gender}]` : '[Verse 1]'} so the very first audible vocal is the opening lyric of Verse 1.`,
    ...(isAcappella
      ? []
      : [
          '- Only optional alternative (do NOT use automatically on every song): a brief [Instrumental Intro] with one short purely instrumental cue (1–2 bars, under 10 seconds, zero vocals) immediately followed by Verse 1.',
        ]),
    '- STRICTLY FORBIDDEN before Verse 1: NEVER write [Intro: male], [Intro: female], or [Intro] with words. ZERO spoken words, narration, "Yeah", "uh", "listen", humming ("mmm", "ooh", "aah"), vocal warm-ups, shouted tags, or title chants before Verse 1.',
    '- TITLE RULE: Let the topic and title inspire the story naturally. NEVER force or mechanically repeat the title into unrelated lines.',
  ].join('\n');

  const consistencyBlock = [
    'ARTIST & PRODUCER INDEPENDENCE:',
    spec.isRap
      ? '- The selected Artist is a RAPPER. Keep delivery strictly rap/cadence-driven even if the Producer beat is R&B or soulful; do NOT insert sung falsetto or melisma cues.'
      : '- The selected Artist is a SINGER. Keep vocal delivery strictly sung/melodic even if the Producer beat is hip-hop or trap; do NOT insert rap delivery cues.',
    '- Keep bracketed directions concise and aligned with the Artist voice. Do NOT repeat long production descriptions in every section.',
  ].join('\n');

  const formatBlock = isAce
    ? [
        'You are GhostWriter, a professional songwriter optimizing lyrics for ACE Music v1 (Custom mode).',
        'Write one complete original vocal song with full lyrics.',
        `HARD LIMIT: Total lyrics MUST be under ${LIMITS.ACE_LYRICS_MAX_CHARS} characters (aim for ${LIMITS.ACE_LYRICS_TARGET_MIN}–${LIMITS.ACE_LYRICS_TARGET_MAX}), INCLUDING section labels, direction lines, spaces, and line breaks.`,
        'Format: start with "TITLE: <song title>" on line 1, then a blank line, then the song. Never number bars.',
        `Section tags MUST carry the vocal marker ": ${gender}": [Verse 1: ${gender}], [Pre-Chorus: ${gender}], [Chorus: ${gender}], [Verse 2: ${gender}], [Pre-Chorus: ${gender}], [Chorus: ${gender}], [Bridge: ${gender}], [Final Chorus: ${gender}], [Outro: ${gender}].`,
        'Write EVERY chorus out in full. Do NOT drop the Bridge and do NOT fold the Final Chorus into the Outro.',
        'Put concise vocal/arrangement delivery directions as standalone bracketed lines [...] where helpful.',
        'Parentheses (...) inside a sung line are ONLY backing vocal echoes or ad-libs. Never use parentheses for directions.',
        'Never include real artist/producer names, commentary, or a style prompt. Say "Black", never "African American".',
      ].join('\n')
    : [
        'You are GhostWriter, a professional songwriter.',
        'Write one complete original song with full lyrics.',
        `HARD LIMIT: Total lyrics MUST be under ${LIMITS.LYRICS_MAX_CHARS} characters (aim for ${LIMITS.LYRICS_TARGET_MIN}–${LIMITS.LYRICS_TARGET_MAX}), INCLUDING section labels, bracket directions, and line breaks.`,
        'Format: start with "TITLE: <song title>" on line 1, then a blank line, then the song. Never number bars.',
        'Use simple, direct section labels on their own lines: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] as fitting.',
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
    coldOpenBlock,
    '',
    consistencyBlock,
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

  const resolvedTopic = topic.trim() || 'An original, emotionally specific scene fitting the mood and vocal character';

  const productionLine = spec.persona
    ? `Producer Instrumental DNA (beat only — do NOT override Artist vocal style): ${spec.persona.sound.dna}`
    : 'Creation Mode: Pure A Cappella (unaccompanied voice only — ZERO instruments, ZERO beat).';

  const tempoLine =
    spec.bpm && spec.key
      ? `Tempo & Key: ${spec.tempo.label} (${spec.bpm} BPM, ${spec.key})`
      : spec.bpm
        ? `Tempo: ${spec.tempo.label} (${spec.bpm} BPM pacing)`
        : '';

  const vocalLine = spec.voice
    ? `Artist Vocal Identity: ${spec.voice.name} — ${spec.voice.note}`
    : '';

  const user = [
    `Topic: ${resolvedTopic}`,
    `Creation Mode: ${isAcappella ? 'A Cappella (Artist only)' : 'Full Song (Artist + Producer)'}`,
    `Vocal Lane: ${spec.isRap ? `Rap (${spec.flowMode.label})` : 'R&B / Sung Vocal (Melody, Vowels & Pocket)'}`,
    `Scene Rule: ${TOPIC_BIBLE_RULE} Formula: ${SONGWRITING_FORMULA}.`,
    perspectiveLine,
    storytellingLine,
    techniquesLine,
    productionLine,
    `Mood: ${spec.mood.label} (${spec.mood.lyricTone})`,
    tempoLine,
    vocalLine,
    feedback ? `Fix these validation issues from the previous draft:\n${feedback}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}
