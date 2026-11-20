/**
 * Lyrics format: parse, validate, repair (normalize) and fit to the hard limit.
 *
 * House format:
 *   [Verse 1]            ← simple, direct label on its own line
 *   [low, close]         ← optional bracket cue line, a few short cues max
 *   lyric line
 *   lyric line
 *                        ← one blank line between sections
 *   [Chorus]
 *   …
 */
import { findBannedNames, stripBannedNames } from '@/data/bannedNames';
import type { VocalGender } from '@/data/voicePresets';
import {
  ACE_LABEL_LINE_RE,
  DISALLOWED_WORDING_RE,
  LABEL_LINE_RE,
  LIMITS,
  charCount,
} from './limits';
import type { ValidationIssue, ValidationResult } from './types';

export interface Section {
  label: string; // canonical, e.g. "[Verse 1]"
  lines: string[]; // cue lines and lyric lines, no blank lines
}

const CUE_LINE_RE = /^\[[^\]]*\]$/;
const INLINE_CUE_RE = /\[[^\]]*\]/g;
const SECTION_WORD_RE =
  /^(?:(?:final|last|double|repeat|big)\s+chorus|refrain|pre[\s-]?chorus|post[\s-]?chorus|verse|intro|chorus|hook|bridge|breakdown|interlude|outro)\b/i;

export const isCueLine = (line: string) => CUE_LINE_RE.test(line) && !LABEL_LINE_RE.test(line);
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

// ─────────────────────────────── Validation ───────────────────────────────

/** Validates lyrics against every hard rule. Pure, used live in the editor too. */
export function validateLyrics(text: string, max: number = LIMITS.LYRICS_MAX_CHARS): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);
  if (chars > max) issues.push({ code: 'TOO_LONG', message: `Lyrics are ${chars} characters; the limit is ${max}.` });
  if (!text.trim()) {
    issues.push({ code: 'EMPTY', message: 'Lyrics are empty.' });
    return { ok: false, chars, max, issues };
  }

  const lines = text.split('\n');
  let current: { label: string; cues: number; lyrics: number } | null = null;
  const sections: { label: string; cues: number; lyrics: number }[] = [];
  let textBeforeLabel = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (isLabelLine(line)) {
      current = { label: line, cues: 0, lyrics: 0 };
      sections.push(current);
      continue;
    }
    // Something that looks like a label but isn't simple and direct.
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
    current.lyrics += 1;
  }

  if (textBeforeLabel) issues.push({ code: 'TEXT_BEFORE_LABEL', message: 'Lyrics must start with a section label.' });
  if (sections.length === 0) issues.push({ code: 'NO_LABELS', message: 'No section labels found.' });

  for (const s of sections) {
    if (s.cues > LIMITS.MAX_CUES_PER_SECTION)
      issues.push({ code: 'TOO_MANY_CUES', message: `${s.label} has ${s.cues} cues; max ${LIMITS.MAX_CUES_PER_SECTION} per label.` });
    const kind = sectionKind(s.label);
    const instrumentalOk = ['Intro', 'Outro', 'Interlude', 'Breakdown'].includes(kind);
    if (s.lyrics === 0 && !(instrumentalOk && s.cues > 0))
      issues.push({ code: 'EMPTY_SECTION', message: `${s.label} has no lyrics.` });
  }
  if (sections.length && !sections.some((s) => ['Chorus', 'Hook'].includes(sectionKind(s.label))))
    issues.push({ code: 'MISSING_CHORUS', message: 'The song needs a [Chorus] or [Hook].' });
  if (sections.length && !sections.some((s) => sectionKind(s.label) === 'Verse'))
    issues.push({ code: 'MISSING_VERSE', message: 'The song needs at least one [Verse].' });

  return { ok: issues.length === 0, chars, max, issues };
}

// ─────────────────────────────── Repair ───────────────────────────────

/** Turns "Verse 1: soft, intimate" / "**CHORUS**" / "[Final Chorus]" into a canonical label + optional cue. */
function canonicalLabel(inner: string): { label: string; rest: string } | null {
  const s = inner.trim();
  const m = s.match(SECTION_WORD_RE);
  if (!m) return null;
  const word = m[0].toLowerCase().replace(/\s+/g, ' ');
  let after = s.slice(m[0].length);
  let label: string;
  if (/chorus$/.test(word) && !/^pre|^post/.test(word)) label = 'Chorus';
  else if (word === 'refrain') label = 'Chorus';
  else if (/^pre/.test(word)) label = 'Pre-Chorus';
  else if (/^post/.test(word)) label = 'Post-Chorus';
  else if (word === 'verse') {
    const num = after.match(/^\s*(\d+)/);
    label = 'Verse';
    if (num) after = after.slice(num[0].length);
  } else label = word.charAt(0).toUpperCase() + word.slice(1);
  // Drop repeat markers like "x2" or "(2)" and any leading separators.
  const rest = after
    .replace(/^\s*\d+\b/, '')
    .replace(/\b[x×]\s?\d+\b/gi, '')
    .replace(/^[\s:\-–—,(]+|[\s)]+$/g, '')
    .trim();
  return { label, rest };
}

/** Trims cues so each is ≤ MAX_WORDS and the section has ≤ MAX_CUES total. */
function enforceCueBudget(lines: string[]): string[] {
  let budget: number = LIMITS.MAX_CUES_PER_SECTION;
  const out: string[] = [];
  const clip = (c: string) => c.split(/\s+/).slice(0, LIMITS.MAX_WORDS_PER_CUE).join(' ').toLowerCase();
  for (const line of lines) {
    if (isCueLine(line)) {
      const cues = splitCues(line.slice(1, -1)).map(clip).slice(0, Math.max(budget, 0));
      budget -= cues.length;
      if (cues.length) out.push(`[${cues.join(', ')}]`);
      continue;
    }
    const fixed = line
      .replace(INLINE_CUE_RE, (m) => {
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

/** Parses loosely formatted lyrics into canonical sections. */
export function toSections(text: string): Section[] {
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
    // Bare lines only count as labels if they are just the label (+ colon/cues).
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

  if (pre.length) sections.unshift({ label: pre.length <= 2 ? '[Intro]' : '[Verse]', lines: pre });

  // Renumber verses sequentially; enforce cue budget; drop empty sections.
  let verse = 0;
  return sections
    .map((s) => {
      const kind = sectionKind(s.label);
      const label = kind === 'Verse' ? `[Verse ${++verse}]` : `[${kind}]`;
      return { label, lines: enforceCueBudget(s.lines) };
    })
    .filter((s) => s.lines.length > 0);
}

/**
 * Hard enforcement: shrinks a song until it fits `max`, trimming the least
 * important material first. Always returns ≤ max characters.
 */
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

  // 1. Extras first, then intro/outro.
  dropKinds(['Interlude', 'Breakdown', 'Post-Chorus']);
  dropKinds(['Intro']);
  dropKinds(['Outro']);
  // 2. Shorten verses, pre-choruses and bridges (keep ≥ 4, then ≥ 2 lines).
  trimLongest((s) => !isHook(s), 4);
  trimLongest((s) => !isHook(s), 2);
  // 3. Shorten choruses (keep ≥ 2 lines).
  trimLongest(isHook, 2);
  // 4. Drop later sections, keeping the first verse and first chorus.
  const firstVerse = sections.find((s) => sectionKind(s.label) === 'Verse');
  const firstHook = sections.find(isHook);
  for (let i = sections.length - 1; i >= 0 && !fits(); i--) {
    if (sections[i] !== firstVerse && sections[i] !== firstHook) sections.splice(i, 1);
  }
  // 5. Last resort: drop lines from the end.
  while (!fits()) {
    const last = sections[sections.length - 1];
    if (!last) break;
    last.lines.pop();
    if (last.lines.length === 0) sections.pop();
  }
  sections = sections.filter((s) => s.lines.length > 0);
  return sections;
}

/** Normalize + fit. The returned text always satisfies the length limit. */
export function repairLyrics(text: string, max: number = LIMITS.LYRICS_MAX_CHARS): string {
  return serialize(fitSections(toSections(text), max));
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

// ──────────────────────────── ACE Music Format ────────────────────────────

const ACE_SECTION_WORD_RE =
  /^(final\s+chorus|pre[\s-]?chorus|post[\s-]?chorus|verse(?:\s*\d+)?|intro|chorus|bridge|outro)\b/i;

/** Validates lyrics in ACE Music native format against every hard rule. */
export function validateAceLyrics(
  text: string,
  expectedGender?: VocalGender,
  max: number = LIMITS.ACE_LYRICS_MAX_CHARS,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

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
  const sections: { name: string; gender: VocalGender; lyrics: number; directions: number }[] = [];
  let current: { name: string; gender: VocalGender; lyrics: number; directions: number } | null = null;
  let textBeforeLabel = false;
  let hasParenDirection = false;
  let wrongGender = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const aceMatch = line.match(ACE_LABEL_LINE_RE);
    if (aceMatch) {
      const name = aceMatch[1];
      const gender = aceMatch[2] as VocalGender;
      if (expectedGender && gender !== expectedGender) wrongGender = true;
      current = { name, gender, lyrics: 0, directions: 0 };
      sections.push(current);
      continue;
    }

    // Check for bare section tag missing vocal marker (e.g. "[Verse 1]")
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
      current.directions += 1;
      continue;
    }

    // Standalone parenthetical direction line (disallowed: parens are only backing echoes inside sung lines)
    if (/^\([^)]+\)$/.test(line) && /\b(guitar|drum|drums|bass|beat|vocal|synth|piano|fade|drop|swell|build|soft|loud|whisper|belt|falsetto|intro|outro)\b/i.test(line)) {
      hasParenDirection = true;
    }

    current.lyrics += 1;
  }

  if (textBeforeLabel) {
    issues.push({ code: 'TEXT_BEFORE_LABEL', message: 'Lyrics must start with an ACE section tag like [Intro: male].' });
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

  const names = sections.map((s) => s.name);
  const has = (n: string) => names.includes(n);
  const chorusCount = names.filter((n) => n === 'Chorus').length;

  if (!has('Intro')) issues.push({ code: 'MISSING_INTRO', message: 'ACE song must include [Intro].' });
  if (!has('Verse 1')) issues.push({ code: 'MISSING_VERSE_1', message: 'ACE song must include [Verse 1].' });
  if (!has('Pre-Chorus')) issues.push({ code: 'MISSING_PRE_CHORUS', message: 'ACE song must include [Pre-Chorus].' });
  if (chorusCount < 2) issues.push({ code: 'MISSING_CHORUS', message: 'Write every [Chorus] out in full (at least two plus Final Chorus).' });
  if (!has('Verse 2')) issues.push({ code: 'MISSING_VERSE_2', message: 'ACE song must include [Verse 2].' });
  if (!has('Bridge')) issues.push({ code: 'MISSING_BRIDGE', message: 'Do not drop the [Bridge].' });
  if (!has('Final Chorus')) issues.push({ code: 'MISSING_FINAL_CHORUS', message: 'Include a full [Final Chorus] separate from [Outro].' });
  if (!has('Outro')) issues.push({ code: 'MISSING_OUTRO', message: 'ACE song must include [Outro].' });

  for (const s of sections) {
    if (s.lyrics === 0 && s.directions === 0) {
      issues.push({ code: 'EMPTY_SECTION', message: `[${s.name}: ${s.gender}] has no content.` });
    }
  }

  return { ok: issues.length === 0, chars, max, issues };
}

/** Normalizes and hard-fits ACE lyrics to <= max chars while preserving Bridge and Final Chorus. */
export function repairAceLyrics(
  text: string,
  gender: VocalGender,
  max: number = LIMITS.ACE_LYRICS_MAX_CHARS,
): string {
  const sanitized = stripBannedNames(text)
    .replace(/\bAfrican[\s-]American\b/gi, 'Black')
    .replace(/\r\n?/g, '\n')
    .replace(/^```[a-z]*$/gim, '')
    .trim();

  const sections: Section[] = [];
  let current: Section | null = null;
  let verseNum = 0;

  for (const raw of sanitized.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const bracketInner = /^\[([^\]]+)\]$/.exec(line)?.[1];
    if (bracketInner) {
      const strippedGender = bracketInner.replace(/:\s*(male|female)\s*$/i, '').trim();
      const secMatch = strippedGender.match(ACE_SECTION_WORD_RE);
      if (secMatch && strippedGender.length <= 24) {
        const key = secMatch[1].toLowerCase().replace(/\s+/g, ' ');
        let canon = 'Verse';
        if (key === 'final chorus') canon = 'Final Chorus';
        else if (key.startsWith('pre')) canon = 'Pre-Chorus';
        else if (key.startsWith('post')) canon = 'Post-Chorus';
        else if (key.startsWith('verse')) canon = `Verse ${++verseNum}`;
        else canon = key.charAt(0).toUpperCase() + key.slice(1);
        current = { label: `[${canon}: ${gender}]`, lines: [] };
        sections.push(current);
        continue;
      }
    }

    if (!current) {
      current = { label: `[Intro: ${gender}]`, lines: [] };
      sections.push(current);
    }
    current.lines.push(line);
  }

  const render = () => sections.map((s) => [s.label, ...s.lines].join('\n')).join('\n');

  // Hard cap: if ever over 5,000 chars, trim longest Verse lines first, never dropping Bridge or Final Chorus.
  while (charCount(render()) > max) {
    const verses = sections.filter((s) => s.label.startsWith('[Verse') && s.lines.length > 4);
    const pool = verses.length
      ? verses
      : sections.filter((s) => s.lines.length > 3);
    if (!pool.length) break;
    const longest = pool.reduce((a, b) => (b.lines.length > a.lines.length ? b : a));
    // Remove the last non-direction line
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
