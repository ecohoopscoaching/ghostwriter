/**
 * Lyrics format: parse, validate, repair (normalize) and fit to hard platform limits.
 *
 * Enforces the Global Cold-Open Rule across all vocal modes:
 *   - Option A (Preferred, and mandatory for A Cappella): Immediate [Verse 1: male|female]
 *     (or [Verse 1] in Flow / Mozart) — first audible vocal is the opening lyric of Verse 1.
 *   - Option B (Optional for Full Song only): Brief [Instrumental Intro] (1-2 bars, <10s,
 *     bracketed instrumental direction only, ZERO vocal words/ad-libs/hums) followed
 *     immediately by [Verse 1: male|female].
 *
 * Strictly forbidden before Verse 1:
 *   - [Intro: male] / [Intro: female] vocal intro sections
 *   - Spoken words, ad-libs ("yeah", "uh", "listen"), humming ("mmm", "ooh", "aah"),
 *     title chants, producer tags, whispered phrases, or any vocal sound before Verse 1.
 */
import { findBannedNames, stripBannedNames } from '@/data/bannedNames';
import type { VocalGender } from '@/data/voicePresets';
import {
  ACE_INSTRUMENTAL_INTRO_RE,
  ACE_LABEL_LINE_RE,
  DISALLOWED_WORDING_RE,
  LABEL_LINE_RE,
  LIMITS,
  charCount,
} from './limits';
import type { CreationMode, ValidationIssue, ValidationResult } from './types';

export interface Section {
  label: string;
  lines: string[];
}

const CUE_LINE_RE = /^\[[^\]]*\]$/;
const INLINE_CUE_RE = /\[[^\]]*\]/g;
const SECTION_WORD_RE =
  /^(?:instrumental\s+intro|(?:final|last|double|repeat|big)\s+chorus|refrain|pre[\s-]?chorus|post[\s-]?chorus|verse|intro|chorus|hook|bridge|breakdown|interlude|outro)\b/i;

/** Matches pure filler ad-libs / warm-up vocalizations forbidden as opening vocal lines. */
const FORBIDDEN_OPENING_FILLER_RE =
  /^(?:yeah|yea|yo|uh|uh-huh|listen|hey|ayy+|mmm+|hmm+|ooh+|oh+|aah+|ah+|whoa+|la+)(?:[\s,!.…-]+(?:yeah|yea|yo|uh|listen|hey|ayy+|mmm+|hmm+|ooh+|oh+|aah+|ah+))*[\s,!.…-]*$/i;

/** Instrumental cues that should never appear in A Cappella mode lyrics. */
const INSTRUMENTAL_CUE_WORD_RE =
  /\b(drums?|808s?|snare|hi-?hats?|kick|piano|rhodes|guitar|bass|synth|pads?|strings?|brass|horns?|organ|full band|beat switch|beat drops?|instrumental|percussion)\b/i;

export const isCueLine = (line: string) =>
  CUE_LINE_RE.test(line) && !LABEL_LINE_RE.test(line) && !ACE_INSTRUMENTAL_INTRO_RE.test(line);
export const isLabelLine = (line: string) => LABEL_LINE_RE.test(line);

function lyricLineCount(s: Section) {
  return s.lines.filter((l) => !isCueLine(l)).length;
}

function sectionKind(label: string): string {
  return label.replace(/^\[|\]$/g, '').replace(/ \d$/, '');
}

export function serialize(sections: Section[]): string {
  return sections.map((s) => [s.label, ...s.lines].join('\n')).join('\n\n');
}

function splitCues(inner: string): string[] {
  return inner
    .split(/[,;/|]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function countWords(s: string) {
  return s.split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────── Flow / Mozart Validation ───────────────────────────

/** Validates Flow / Mozart lyrics against hard rules + Cold-Open Rule. */
export function validateLyrics(
  text: string,
  max: number = LIMITS.LYRICS_MAX_CHARS,
  mode: CreationMode = 'full',
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (mode === 'none') {
    if (chars > max) issues.push({ code: 'TOO_LONG', message: `Lyrics are ${chars} characters; the limit is ${max}.` });
    return { ok: issues.length === 0, chars, max, issues };
  }

  if (mode === 'instrumental') {
    if (text.trim()) {
      issues.push({
        code: 'VOCALS_IN_INSTRUMENTAL',
        message: 'Instrumental mode should not contain vocal lyrics.',
      });
    }
    return { ok: issues.length === 0, chars, max, issues };
  }

  if (chars > max) issues.push({ code: 'TOO_LONG', message: `Lyrics are ${chars} characters; the limit is ${max}.` });
  if (!text.trim()) {
    issues.push({ code: 'EMPTY', message: 'Lyrics are empty.' });
    return { ok: false, chars, max, issues };
  }

  const lines = text.split('\n');
  let current: { label: string; cues: number; lyrics: number; firstLyric?: string } | null = null;
  const sections: { label: string; cues: number; lyrics: number; firstLyric?: string }[] = [];
  let textBeforeLabel = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (isLabelLine(line)) {
      current = { label: line, cues: 0, lyrics: 0 };
      sections.push(current);
      continue;
    }
    const inner = line.replace(/^[[*#\s]+|[\]*:\s]+$/g, '');
    const looksLikeLabel =
      SECTION_WORD_RE.test(inner) &&
      (CUE_LINE_RE.test(line) || /^[*#]*\s*[A-Za-z-]+(?:\s\d)?\s*[*]*:?$/.test(line) || /:\s*$/.test(line));
    if (looksLikeLabel) {
      issues.push({ code: 'BAD_LABEL', message: `Label "${line}" is not a simple label like [Verse 1] or [Chorus].` });
      continue;
    }
    if (!current) {
      textBeforeLabel = true;
      continue;
    }
    if (isCueLine(line)) {
      const cues = splitCues(line.slice(1, -1));
      if (cues.length === 0) issues.push({ code: 'EMPTY_CUE', message: `Empty bracket in ${current.label}.` });
      for (const c of cues) {
        if (countWords(c) > LIMITS.MAX_WORDS_PER_CUE)
          issues.push({ code: 'LONG_CUE', message: `Cue "[${c}]" in ${current.label} is longer than ${LIMITS.MAX_WORDS_PER_CUE} words.` });
      }
      if (mode === 'acappella' && INSTRUMENTAL_CUE_WORD_RE.test(line)) {
        issues.push({
          code: 'INSTRUMENTAL_CUE_IN_ACAPPELLA',
          message: `A cappella lyrics cannot include instrumental cue "${line}".`,
        });
      }
      current.cues += cues.length;
      continue;
    }
    for (const m of line.matchAll(INLINE_CUE_RE)) {
      const cues = splitCues(m[0].slice(1, -1));
      for (const c of cues) {
        if (countWords(c) > LIMITS.MAX_WORDS_PER_CUE)
          issues.push({ code: 'LONG_CUE', message: `Cue "[${c}]" in ${current.label} is longer than ${LIMITS.MAX_WORDS_PER_CUE} words.` });
      }
      current.cues += cues.length;
    }
    if (!current.firstLyric) current.firstLyric = line;
    current.lyrics += 1;
  }

  if (textBeforeLabel) issues.push({ code: 'TEXT_BEFORE_LABEL', message: 'Lyrics must start with a section label.' });
  if (sections.length === 0) issues.push({ code: 'NO_LABELS', message: 'No section labels found.' });

  // Global Cold-Open Rule
  const first = sections[0];
  if (first) {
    const firstKind = sectionKind(first.label);
    if (firstKind === 'Intro') {
      if (first.lyrics > 0) {
        issues.push({
          code: 'FORBIDDEN_VOCAL_INTRO',
          message: 'Cold-open violation: vocal [Intro] lines are forbidden. Start directly at [Verse 1].',
        });
      } else if (mode === 'acappella') {
        issues.push({
          code: 'INSTRUMENTAL_IN_ACAPPELLA',
          message: 'A cappella songs must begin immediately with [Verse 1] (no intro).',
        });
      }
    } else if (firstKind === 'Instrumental Intro') {
      if (mode === 'acappella') {
        issues.push({
          code: 'INSTRUMENTAL_IN_ACAPPELLA',
          message: 'A cappella songs cannot have an [Instrumental Intro]. Start immediately with [Verse 1].',
        });
      }
      if (first.lyrics > 0) {
        issues.push({
          code: 'VOCALS_IN_INSTRUMENTAL_INTRO',
          message: '[Instrumental Intro] must contain zero vocal words, ad-libs, or hums.',
        });
      }
    } else if (firstKind !== 'Verse') {
      issues.push({
        code: 'MUST_START_WITH_VERSE_1',
        message: 'Vocal songs must begin directly with [Verse 1] (or an optional [Instrumental Intro] for Full Song).',
      });
    }
  }

  const verse1 = sections.find((s) => s.label === '[Verse 1]');
  if (verse1?.firstLyric && FORBIDDEN_OPENING_FILLER_RE.test(verse1.firstLyric)) {
    issues.push({
      code: 'FORBIDDEN_OPENING_ADLIB',
      message: `Cold-open violation: "${verse1.firstLyric}" is a forbidden opening ad-lib or warm-up.`,
    });
  }

  for (const s of sections) {
    if (s.cues > LIMITS.MAX_CUES_PER_SECTION)
      issues.push({ code: 'TOO_MANY_CUES', message: `${s.label} has ${s.cues} cues; max ${LIMITS.MAX_CUES_PER_SECTION} per label.` });
    const kind = sectionKind(s.label);
    const instrumentalOk = ['Instrumental Intro', 'Intro', 'Outro', 'Interlude', 'Breakdown'].includes(kind);
    if (s.lyrics === 0 && !(instrumentalOk && s.cues > 0))
      issues.push({ code: 'EMPTY_SECTION', message: `${s.label} has no lyrics.` });
  }
  if (sections.length && !sections.some((s) => ['Chorus', 'Hook'].includes(sectionKind(s.label))))
    issues.push({ code: 'MISSING_CHORUS', message: 'The song needs a [Chorus] or [Hook].' });
  if (sections.length && !sections.some((s) => sectionKind(s.label) === 'Verse'))
    issues.push({ code: 'MISSING_VERSE', message: 'The song needs at least one [Verse].' });

  return { ok: issues.length === 0, chars, max, issues };
}

// ─────────────────────────── Flow / Mozart Repair ───────────────────────────

function canonicalLabel(inner: string): { label: string; rest: string } | null {
  const s = inner.trim();
  const m = s.match(SECTION_WORD_RE);
  if (!m) return null;
  const word = m[0].toLowerCase().replace(/\s+/g, ' ');
  let after = s.slice(m[0].length);
  let label: string;
  if (word === 'instrumental intro') label = 'Instrumental Intro';
  else if (/chorus$/.test(word) && !/^pre|^post/.test(word)) label = 'Chorus';
  else if (word === 'refrain') label = 'Chorus';
  else if (/^pre/.test(word)) label = 'Pre-Chorus';
  else if (/^post/.test(word)) label = 'Post-Chorus';
  else if (word === 'verse') {
    const num = after.match(/^\s*(\d+)/);
    label = 'Verse';
    if (num) after = after.slice(num[0].length);
  } else label = word.charAt(0).toUpperCase() + word.slice(1);
  const rest = after
    .replace(/^\s*\d+\b/, '')
    .replace(/\b[x×]\s?\d+\b/gi, '')
    .replace(/^[\s:\-–—,(]+|[\s)]+$/g, '')
    .trim();
  return { label, rest };
}

function enforceCueBudget(lines: string[], mode: CreationMode = 'full'): string[] {
  let budget: number = LIMITS.MAX_CUES_PER_SECTION;
  const out: string[] = [];
  const clip = (c: string) => c.split(/\s+/).slice(0, LIMITS.MAX_WORDS_PER_CUE).join(' ').toLowerCase();
  for (const line of lines) {
    if (isCueLine(line)) {
      if (mode === 'acappella' && INSTRUMENTAL_CUE_WORD_RE.test(line)) continue;
      const cues = splitCues(line.slice(1, -1)).map(clip).slice(0, Math.max(budget, 0));
      budget -= cues.length;
      if (cues.length) out.push(`[${cues.join(', ')}]`);
      continue;
    }
    const fixed = line
      .replace(INLINE_CUE_RE, (m) => {
        if (mode === 'acappella' && INSTRUMENTAL_CUE_WORD_RE.test(m)) return '';
        const cues = splitCues(m.slice(1, -1)).map(clip).slice(0, Math.max(budget, 0));
        budget -= cues.length;
        return cues.length ? `[${cues.join(', ')}]` : '';
      })
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (fixed) out.push(fixed);
  }
  return out;
}

/** Parses loosely formatted lyrics into canonical sections while enforcing Cold-Open. */
export function toSections(text: string, mode: CreationMode = 'full'): Section[] {
  const cleaned = text
    .replace(/\r\n?/g, '\n')
    .replace(/^```[a-z]*$/gim, '')
    .replace(/\*\*|__/g, '')
    .replace(/^#+\s*/gm, '');

  const sections: Section[] = [];
  let current: Section | null = null;
  const pre: string[] = [];

  for (const raw of cleaned.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    let inner: string | null = null;
    if (/^\[[^\]]+\]$/.test(line)) inner = line.slice(1, -1);
    else if (/^\([^)]+\)$/.test(line) && SECTION_WORD_RE.test(line.slice(1))) inner = line.slice(1, -1);
    else if (/^[A-Za-z-]+(?:\s+[A-Za-z-]+)?(?:\s*\d+)?\s*:/.test(line) || /^[A-Za-z-]+(?:\s+[A-Za-z-]+)?(?:\s*\d+)?$/.test(line))
      inner = line;

    const canon = inner !== null ? canonicalLabel(inner) : null;
    const isBare = inner === line;
    if (canon && (!isBare || /:/.test(line) || canon.rest === '')) {
      current = { label: `[${canon.label}]`, lines: [] };
      sections.push(current);
      if (canon.rest && /[a-z]/i.test(canon.rest)) current.lines.push(`[${canon.rest}]`);
      continue;
    }
    if (current) current.lines.push(line);
    else pre.push(line);
  }

  // Leading lines without a label start Verse 1 directly (never a vocal Intro)
  if (pre.length) {
    const filteredPre = pre.filter((l) => !FORBIDDEN_OPENING_FILLER_RE.test(l));
    if (filteredPre.length) sections.unshift({ label: '[Verse]', lines: filteredPre });
  }

  let verse = 0;
  const normalized: Section[] = [];
  for (const s of sections) {
    const kind = sectionKind(s.label);
    // Drop any vocal [Intro] completely
    if (kind === 'Intro') continue;
    // Handle [Instrumental Intro]
    if (kind === 'Instrumental Intro') {
      if (mode === 'acappella') continue;
      const cueLinesOnly = s.lines.filter((l) => /^\[[^\]]+\]$/.test(l));
      if (cueLinesOnly.length > 0 && normalized.length === 0) {
        normalized.push({ label: '[Instrumental Intro]', lines: enforceCueBudget(cueLinesOnly, mode) });
      }
      continue;
    }
    const label = kind === 'Verse' ? `[Verse ${++verse}]` : `[${kind}]`;
    let lines = enforceCueBudget(s.lines, mode);
    // Strip pure ad-lib/hum filler lines at the very start of Verse 1
    if (label === '[Verse 1]') {
      while (lines.length > 0 && !isCueLine(lines[0]) && FORBIDDEN_OPENING_FILLER_RE.test(lines[0])) {
        lines = lines.slice(1);
      }
    }
    if (lines.length > 0) normalized.push({ label, lines });
  }

  return normalized;
}

export function fitSections(input: Section[], max: number = LIMITS.LYRICS_MAX_CHARS): Section[] {
  let sections = input.map((s) => ({ ...s, lines: [...s.lines] }));
  const fits = () => charCount(serialize(sections)) <= max;
  if (fits()) return sections;

  const dropKinds = (kinds: string[]) => {
    for (let i = sections.length - 1; i >= 0 && !fits(); i--) {
      if (kinds.includes(sectionKind(sections[i].label))) sections.splice(i, 1);
    }
  };
  const trimLongest = (eligible: (s: Section) => boolean, minLyrics: number) => {
    while (!fits()) {
      const candidates = sections.filter((s) => eligible(s) && lyricLineCount(s) > minLyrics);
      if (!candidates.length) return;
      const target = candidates.reduce((a, b) => (lyricLineCount(b) > lyricLineCount(a) ? b : a));
      for (let i = target.lines.length - 1; i >= 0; i--) {
        if (!isCueLine(target.lines[i])) {
          target.lines.splice(i, 1);
          break;
        }
      }
    }
  };
  const isHook = (s: Section) => ['Chorus', 'Hook'].includes(sectionKind(s.label));

  dropKinds(['Interlude', 'Breakdown', 'Post-Chorus']);
  dropKinds(['Instrumental Intro', 'Intro']);
  dropKinds(['Outro']);
  trimLongest((s) => !isHook(s), 4);
  trimLongest((s) => !isHook(s), 2);
  trimLongest(isHook, 2);

  const firstVerse = sections.find((s) => sectionKind(s.label) === 'Verse');
  const firstHook = sections.find(isHook);
  for (let i = sections.length - 1; i >= 0 && !fits(); i--) {
    if (sections[i] !== firstVerse && sections[i] !== firstHook) sections.splice(i, 1);
  }
  while (!fits()) {
    const last = sections[sections.length - 1];
    if (!last) break;
    last.lines.pop();
    if (last.lines.length === 0) sections.pop();
  }
  sections = sections.filter((s) => s.lines.length > 0);
  return sections;
}

export function repairLyrics(
  text: string,
  max: number = LIMITS.LYRICS_MAX_CHARS,
  mode: CreationMode = 'full',
): string {
  if (mode === 'instrumental' || mode === 'none') return '';
  return serialize(fitSections(toSections(text, mode), max));
}

/** Pulls "TITLE: …" off the top of model output and drops anything after the lyrics. */
export function parseModelOutput(raw: string): { title: string; lyrics: string } {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  const body: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    const m = t.match(/^\**\s*title\s*\**\s*:\s*(.+)$/i);
    if (m && !title && body.every((b) => !b.trim())) {
      title = m[1].replace(/^["“]|["”]$/g, '').replace(/\*+/g, '').trim();
      continue;
    }
    if (/^\**\s*(sound prompt|style prompt|production notes?|notes?)\s*\**\s*:/i.test(t)) break;
    body.push(line);
  }
  return { title, lyrics: body.join('\n').trim() };
}

// ──────────────────────────── ACE Music v1 Format ────────────────────────────

const ACE_SECTION_WORD_RE =
  /^(instrumental\s+intro|final\s+chorus|pre[\s-]?chorus|post[\s-]?chorus|verse(?:\s*\d+)?|intro|chorus|bridge|outro)\b/i;

const FORBIDDEN_ACE_VOCAL_INTRO_RE = /^\[Intro(?::\s*(?:male|female))?\]$/i;

/**
 * Validates lyrics in ACE Music v1 native format against every hard rule,
 * including the Global Cold-Open Rule and mode consistency.
 */
export function validateAceLyrics(
  text: string,
  expectedGender?: VocalGender,
  max: number = LIMITS.ACE_LYRICS_MAX_CHARS,
  mode: CreationMode = 'full',
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (mode === 'none') {
    if (chars > max) {
      issues.push({ code: 'TOO_LONG', message: `Lyrics are ${chars} characters; the ACE limit is ${max}.` });
    }
    return { ok: issues.length === 0, chars, max, issues };
  }

  if (mode === 'instrumental') {
    if (text.trim()) {
      issues.push({
        code: 'VOCALS_IN_INSTRUMENTAL',
        message: 'Instrumental mode must not contain vocal lyrics.',
      });
    }
    return { ok: issues.length === 0, chars, max, issues };
  }

  if (chars > max) {
    issues.push({
      code: 'TOO_LONG',
      message: `Lyrics are ${chars} characters; the ACE limit is ${max}.`,
    });
  }
  if (!text.trim()) {
    issues.push({ code: 'EMPTY', message: 'Lyrics are empty.' });
    return { ok: false, chars, max, issues };
  }

  const banned = findBannedNames(text);
  if (banned.length > 0) {
    issues.push({
      code: 'BANNED_NAME',
      message: `Contains real producer or artist name(s): ${banned.join(', ')}.`,
    });
  }
  if (DISALLOWED_WORDING_RE.test(text)) {
    issues.push({
      code: 'DISALLOWED_WORDING',
      message: 'Use "Black", never "African American".',
    });
  }

  const lines = text.split('\n');
  const sections: {
    name: string;
    gender?: VocalGender;
    lyrics: number;
    directions: number;
    firstLyric?: string;
  }[] = [];
  let current: {
    name: string;
    gender?: VocalGender;
    lyrics: number;
    directions: number;
    firstLyric?: string;
  } | null = null;
  let textBeforeLabel = false;
  let hasParenDirection = false;
  let wrongGender = false;
  let hasForbiddenVocalIntro = false;
  let hasInstrumentalCueInAcappella = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Optional purely instrumental intro tag (Full Song only)
    if (ACE_INSTRUMENTAL_INTRO_RE.test(line)) {
      current = { name: 'Instrumental Intro', lyrics: 0, directions: 0 };
      sections.push(current);
      continue;
    }

    // Forbidden vocal [Intro: male] / [Intro: female] / [Intro]
    if (FORBIDDEN_ACE_VOCAL_INTRO_RE.test(line)) {
      hasForbiddenVocalIntro = true;
      current = { name: 'Intro', lyrics: 0, directions: 0 };
      sections.push(current);
      continue;
    }

    const aceMatch = line.match(ACE_LABEL_LINE_RE);
    if (aceMatch) {
      const name = aceMatch[1];
      const gender = aceMatch[2] as VocalGender;
      if (expectedGender && gender !== expectedGender) wrongGender = true;
      current = { name, gender, lyrics: 0, directions: 0 };
      sections.push(current);
      continue;
    }

    // Bare section tag missing vocal marker (e.g. "[Verse 1]")
    if (LABEL_LINE_RE.test(line)) {
      issues.push({
        code: 'MISSING_VOCAL_MARKER',
        message: `Section tag "${line}" must include the vocal marker, e.g. ${line.slice(0, -1)}: ${expectedGender ?? 'male'}].`,
      });
      continue;
    }

    if (!current) {
      textBeforeLabel = true;
      continue;
    }

    // Standalone bracketed direction line
    if (/^\[[^\]]+\]$/.test(line)) {
      if (mode === 'acappella' && INSTRUMENTAL_CUE_WORD_RE.test(line)) {
        hasInstrumentalCueInAcappella = true;
      }
      current.directions += 1;
      continue;
    }

    // Standalone parenthetical direction line
    if (
      /^\([^)]+\)$/.test(line) &&
      /\b(guitar|drum|drums|bass|beat|vocal|synth|piano|fade|drop|swell|build|soft|loud|whisper|belt|falsetto|intro|outro)\b/i.test(
        line,
      )
    ) {
      hasParenDirection = true;
    }

    if (!current.firstLyric) current.firstLyric = line;
    current.lyrics += 1;
  }

  if (textBeforeLabel) {
    issues.push({
      code: 'TEXT_BEFORE_LABEL',
      message: `Lyrics must begin with [Verse 1: ${expectedGender ?? 'male'}] (or [Instrumental Intro] for Full Song).`,
    });
  }
  if (hasForbiddenVocalIntro) {
    issues.push({
      code: 'FORBIDDEN_VOCAL_INTRO',
      message: 'Cold-open violation: [Intro: male/female] vocal intros are forbidden. Start directly at [Verse 1] or use a brief [Instrumental Intro] with no vocals.',
    });
  }
  if (wrongGender && expectedGender) {
    issues.push({
      code: 'WRONG_VOCAL_MARKER',
      message: `All section tags must match the selected voice gender (": ${expectedGender}").`,
    });
  }
  if (hasParenDirection) {
    issues.push({
      code: 'PAREN_DIRECTION',
      message: 'Use square brackets [...] for production/delivery directions; parentheses (...) are only for backing echoes.',
    });
  }
  if (hasInstrumentalCueInAcappella) {
    issues.push({
      code: 'INSTRUMENTAL_CUE_IN_ACAPPELLA',
      message: 'A cappella lyrics must not contain instrument or beat directions.',
    });
  }

  // Enforce Global Cold-Open opening structure
  const first = sections[0];
  if (first) {
    if (first.name === 'Instrumental Intro') {
      if (mode === 'acappella') {
        issues.push({
          code: 'INSTRUMENTAL_IN_ACAPPELLA',
          message: 'A cappella songs cannot have an [Instrumental Intro]. Begin immediately with [Verse 1].',
        });
      }
      if (first.lyrics > 0) {
        issues.push({
          code: 'VOCALS_IN_INSTRUMENTAL_INTRO',
          message: '[Instrumental Intro] must have zero vocal words, ad-libs, or hums before Verse 1.',
        });
      }
      if (sections[1] && sections[1].name !== 'Verse 1') {
        issues.push({
          code: 'MUST_START_WITH_VERSE_1',
          message: '[Instrumental Intro] must be followed immediately by [Verse 1].',
        });
      }
    } else if (first.name !== 'Verse 1' && first.name !== 'Intro') {
      issues.push({
        code: 'MUST_START_WITH_VERSE_1',
        message: 'Vocal songs must cold-open directly with [Verse 1] (or [Instrumental Intro] then [Verse 1]).',
      });
    }
  }

  const verse1 = sections.find((s) => s.name === 'Verse 1');
  if (verse1?.firstLyric && FORBIDDEN_OPENING_FILLER_RE.test(verse1.firstLyric)) {
    issues.push({
      code: 'FORBIDDEN_OPENING_ADLIB',
      message: `Cold-open violation: "${verse1.firstLyric}" is a forbidden opening ad-lib, hum, or warm-up.`,
    });
  }

  const names = sections.map((s) => s.name);
  const has = (n: string) => names.includes(n);
  const chorusCount = names.filter((n) => n === 'Chorus').length;

  if (!has('Verse 1')) issues.push({ code: 'MISSING_VERSE_1', message: 'ACE song must include [Verse 1].' });
  if (!has('Pre-Chorus')) issues.push({ code: 'MISSING_PRE_CHORUS', message: 'ACE song must include [Pre-Chorus].' });
  if (chorusCount < 2) issues.push({ code: 'MISSING_CHORUS', message: 'Write every [Chorus] out in full (at least two plus Final Chorus).' });
  if (!has('Verse 2')) issues.push({ code: 'MISSING_VERSE_2', message: 'ACE song must include [Verse 2].' });
  if (!has('Bridge')) issues.push({ code: 'MISSING_BRIDGE', message: 'Do not drop the [Bridge].' });
  if (!has('Final Chorus')) issues.push({ code: 'MISSING_FINAL_CHORUS', message: 'Include a full [Final Chorus] separate from [Outro].' });
  if (!has('Outro')) issues.push({ code: 'MISSING_OUTRO', message: 'ACE song must include [Outro].' });

  for (const s of sections) {
    if (s.lyrics === 0 && s.directions === 0) {
      issues.push({
        code: 'EMPTY_SECTION',
        message: `${s.gender ? `[${s.name}: ${s.gender}]` : `[${s.name}]`} has no content.`,
      });
    }
  }

  return { ok: issues.length === 0, chars, max, issues };
}

/**
 * Normalizes and hard-fits ACE lyrics to <= max chars while strictly enforcing
 * the Global Cold-Open Rule (strips any forbidden vocal intro or opening ad-libs)
 * and preserving Bridge and Final Chorus.
 */
export function repairAceLyrics(
  text: string,
  gender: VocalGender,
  max: number = LIMITS.ACE_LYRICS_MAX_CHARS,
  mode: CreationMode = 'full',
): string {
  if (mode === 'instrumental' || mode === 'none') return '';

  const sanitized = stripBannedNames(text)
    .replace(/\bAfrican[\s-]American\b/gi, 'Black')
    .replace(/\r\n?/g, '\n')
    .replace(/^```[a-z]*$/gim, '')
    .trim();

  const rawSections: Section[] = [];
  let current: Section | null = null;
  let verseNum = 0;

  for (const raw of sanitized.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const bracketInner = /^\[([^\]]+)\]$/.exec(line)?.[1];
    if (bracketInner) {
      const strippedGender = bracketInner.replace(/:\s*(male|female)\s*$/i, '').trim();
      const secMatch = strippedGender.match(ACE_SECTION_WORD_RE);
      if (secMatch && strippedGender.length <= 28) {
        const key = secMatch[1].toLowerCase().replace(/\s+/g, ' ');
        if (key === 'instrumental intro') {
          current = { label: '[Instrumental Intro]', lines: [] };
          rawSections.push(current);
          continue;
        }
        if (key === 'intro') {
          // Mark as forbidden vocal intro so it gets stripped below
          current = { label: '__DROP_INTRO__', lines: [] };
          rawSections.push(current);
          continue;
        }
        let canon = 'Verse';
        if (key === 'final chorus') canon = 'Final Chorus';
        else if (key.startsWith('pre')) canon = 'Pre-Chorus';
        else if (key.startsWith('post')) canon = 'Post-Chorus';
        else if (key.startsWith('verse')) canon = `Verse ${++verseNum}`;
        else canon = key.charAt(0).toUpperCase() + key.slice(1);
        current = { label: `[${canon}: ${gender}]`, lines: [] };
        rawSections.push(current);
        continue;
      }
    }

    if (!current) {
      current = { label: `[Verse ${++verseNum}: ${gender}]`, lines: [] };
      rawSections.push(current);
    }
    current.lines.push(line);
  }

  const sections: Section[] = [];
  for (const s of rawSections) {
    if (s.label === '__DROP_INTRO__') continue;

    if (s.label === '[Instrumental Intro]') {
      if (mode === 'acappella') continue;
      // Keep ONLY purely instrumental bracket directions, drop any vocal lines
      const dirsOnly = s.lines.filter((l) => /^\[[^\]]+\]$/.test(l));
      if (dirsOnly.length > 0 && sections.length === 0) {
        sections.push({ label: '[Instrumental Intro]', lines: dirsOnly.slice(0, 1) });
      }
      continue;
    }

    let lines = s.lines.filter((l) => {
      if (mode === 'acappella' && /^\[[^\]]+\]$/.test(l) && INSTRUMENTAL_CUE_WORD_RE.test(l)) {
        return false;
      }
      return true;
    });

    // Strip any forbidden opening filler ad-libs/hums at the start of Verse 1
    if (s.label.startsWith('[Verse 1:')) {
      const cleanedVerse1: string[] = [];
      let seenRealLyric = false;
      for (const l of lines) {
        if (!seenRealLyric && !/^\[[^\]]+\]$/.test(l) && FORBIDDEN_OPENING_FILLER_RE.test(l)) {
          continue;
        }
        if (!/^\[[^\]]+\]$/.test(l)) seenRealLyric = true;
        cleanedVerse1.push(l);
      }
      lines = cleanedVerse1;
    }

    if (lines.length > 0) sections.push({ label: s.label, lines });
  }

  const render = () => sections.map((s) => [s.label, ...s.lines].join('\n')).join('\n');

  while (charCount(render()) > max) {
    const verses = sections.filter((s) => s.label.startsWith('[Verse') && s.lines.length > 4);
    const pool = verses.length ? verses : sections.filter((s) => s.lines.length > 3);
    if (!pool.length) break;
    const longest = pool.reduce((a, b) => (b.lines.length > a.lines.length ? b : a));
    let removed = false;
    for (let i = longest.lines.length - 1; i >= 0; i--) {
      if (!/^\[[^\]]+\]$/.test(longest.lines[i])) {
        longest.lines.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (!removed) longest.lines.pop();
  }

  return render();
}
