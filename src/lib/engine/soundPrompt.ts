/**
 * Sound Prompt builder & validator (Flow Music / Mozart AI style).
 *
 * Covers every required element:
 *   - Optional non-Soul Glider opener (from voice-presets.md)
 *   - Genre + producer sonic DNA (plain words only, NEVER real producer/artist names)
 *   - BPM (including beat-switch tempo when SOULSWITCH is selected)
 *   - Key & mode
 *   - Mood
 *   - Instruments
 *   - Drums (pattern & pocket)
 *   - Bass
 *   - Mix / arrangement & hard nos
 *   - Vocals: voice type, register, tone, delivery (from the chosen Artist voice preset)
 *
 * Hard enforcement:
 *   - Output is ALWAYS ≤ 1,000 characters (LIMITS.SOUND_MAX_CHARS).
 *   - Output NEVER contains any banned real producer or artist name.
 */
import { findBannedNames, stripBannedNames } from '@/data/bannedNames';
import { ACE_VOCAL_GUARDRAIL, NON_SOUL_GLIDER_OPENER } from '@/data/voicePresets';
import { DISALLOWED_WORDING_RE, LIMITS, charCount } from './limits';
import type { SoundSpec, ValidationIssue, ValidationResult } from './types';

interface Clause {
  key: string;
  label?: string;
  /** Ordered most-important first; budget fitter drops from the end. */
  items: string[];
  /** Higher priority stays longer when trimming to 1,000 chars. */
  priority: number;
  /** Minimum items to keep before dropping the clause (0 = optional clause). */
  minItems: number;
  prefix?: string;
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of arr) {
    const s = raw.trim();
    if (!s) continue;
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

function renderClause(c: Clause): string {
  if (!c.items.length) return '';
  const body = c.items.join(', ');
  if (c.prefix) return `${c.prefix}${body}`;
  return c.label ? `${c.label}: ${body}` : body;
}

function assemble(opener: string | null, clauses: Clause[]): string {
  const parts: string[] = [];
  if (opener) parts.push(opener);
  for (const c of clauses) {
    const rendered = renderClause(c);
    if (rendered) parts.push(rendered.endsWith('.') ? rendered : `${rendered}.`);
  }
  return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Builds the sound prompt from a resolved SoundSpec and fits it strictly
 * within `max` characters (default 1,000).
 */
export function buildSoundPrompt(
  spec: SoundSpec,
  max: number = LIMITS.SOUND_MAX_CHARS,
): { prompt: string; trimmed: string[] } {
  const { mood, persona, voice, bpm, switchBpm, key, includeOpener } = spec;
  const ps = persona.sound;

  const opener = includeOpener ? NON_SOUL_GLIDER_OPENER : null;

  const tempoText = switchBpm
    ? `${bpm} BPM, switching at ${ps.switchAt ?? '1:00'} to ${switchBpm} BPM`
    : `${bpm} BPM`;

  const instruments = dedupe(ps.instruments?.length ? ps.instruments : ['warm keys', 'layered textures']);
  const drums = dedupe(ps.drums?.length ? ps.drums : ['crisp pocket drums']);
  const bass = dedupe(ps.bass?.length ? ps.bass : ['deep controlled bass']);
  const moodList = dedupe([mood.label.toLowerCase(), ...mood.descriptors]);
  const arrangement = dedupe([...(ps.arrangement ?? []), ...(ps.mix ?? [])]);
  const avoid = dedupe(ps.avoid ?? []);

  // Clauses ordered for natural reading in Flow Music / Mozart AI.
  const clauses: Clause[] = [
    {
      key: 'style',
      items: [ps.dna],
      priority: 10,
      minItems: 1,
    },
    {
      key: 'tempo-key',
      items: [tempoText, key],
      priority: 10,
      minItems: 2,
    },
    {
      key: 'mood',
      label: 'Mood',
      items: moodList,
      priority: 7,
      minItems: 1,
    },
    {
      key: 'instruments',
      label: 'Instruments',
      items: instruments,
      priority: 8,
      minItems: 1,
    },
    {
      key: 'drums',
      label: 'Drums',
      items: drums,
      priority: 8,
      minItems: 1,
    },
    {
      key: 'bass',
      label: 'Bass',
      items: bass,
      priority: 8,
      minItems: 1,
    },
    {
      key: 'arrangement',
      label: 'Mix',
      items: arrangement,
      priority: 3,
      minItems: 0,
    },
    {
      key: 'avoid',
      prefix: 'Avoid: ',
      items: avoid,
      priority: 2,
      minItems: 0,
    },
    {
      key: 'vocal-type',
      label: 'Vocals',
      items: [voice.vocal.type],
      priority: 10,
      minItems: 1,
    },
    {
      key: 'vocal-register',
      label: 'Register',
      items: [...voice.vocal.register],
      priority: 9,
      minItems: voice.vocal.register.length > 0 ? 1 : 0,
    },
    {
      key: 'vocal-tone',
      label: 'Tone',
      items: [...voice.vocal.tone],
      priority: 9,
      minItems: voice.vocal.tone.length > 0 ? 1 : 0,
    },
    {
      key: 'vocal-delivery',
      label: 'Delivery',
      items: [...voice.vocal.delivery],
      priority: 9,
      minItems: voice.vocal.delivery.length > 0 ? 1 : 0,
    },
  ];

  // Sanitize every item upfront so no real producer/artist name can ever enter.
  for (const c of clauses) {
    c.items = c.items.map((x) => stripBannedNames(x).trim()).filter(Boolean);
  }

  const trimmed: string[] = [];

  // Progressively trim lowest-priority trailing items until ≤ max chars.
  const currentText = () => assemble(opener, clauses);

  while (charCount(currentText()) > max) {
    // Pick the lowest-priority clause that still has more than minItems.
    const trimmable = clauses
      .filter((c) => c.items.length > c.minItems)
      .sort((a, b) => a.priority - b.priority || b.items.length - a.items.length);

    if (trimmable.length > 0) {
      const target = trimmable[0];
      const removed = target.items.pop();
      if (removed) trimmed.push(`${target.key}: ${removed}`);
      continue;
    }

    // Fallback: if even minItems exceed max (very long phrases), shorten the longest clause item cleanly.
    const longest = [...clauses]
      .filter((c) => c.items.length > 0)
      .sort((a, b) => a.priority - b.priority || renderClause(b).length - renderClause(a).length)[0];
    if (!longest) break;

    const item = longest.items[longest.items.length - 1];
    const words = item.split(/\s+/);
    if (words.length > 3) {
      const shortened = words.slice(0, Math.max(3, Math.floor(words.length * 0.75))).join(' ').replace(/[,;:\-]+$/, '');
      trimmed.push(`${longest.key}: shortened`);
      longest.items[longest.items.length - 1] = shortened;
    } else if (longest.items.length > 0) {
      const removed = longest.items.pop();
      if (removed) trimmed.push(`${longest.key}: ${removed}`);
    } else {
      break;
    }
  }

  // Final safety pass: strip banned names & hard-cap if ever needed.
  let prompt = stripBannedNames(currentText());
  if (charCount(prompt) > max) {
    prompt = prompt.slice(0, max - 1).replace(/\s+\S*$/, '').trim();
    if (!prompt.endsWith('.')) prompt += '.';
  }

  return { prompt, trimmed };
}

/** Validates a sound prompt against length, banned names, and required elements. */
export function validateSoundPrompt(
  text: string,
  max: number = LIMITS.SOUND_MAX_CHARS,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (chars > max) {
    issues.push({ code: 'TOO_LONG', message: `Sound prompt is ${chars} characters; the limit is ${max}.` });
  }
  if (!text.trim()) {
    issues.push({ code: 'EMPTY', message: 'Sound prompt is empty.' });
    return { ok: false, chars, max, issues };
  }

  const banned = findBannedNames(text);
  if (banned.length > 0) {
    issues.push({
      code: 'BANNED_NAME',
      message: `Contains internal/real producer or artist name(s): ${banned.join(', ')}. Describe the sound in plain words instead.`,
    });
  }

  if (!/\b\d{2,3}\s*BPM\b/i.test(text)) {
    issues.push({ code: 'MISSING_BPM', message: 'Sound prompt should specify BPM.' });
  }
  if (!/\b[A-G][#b]?\s*(major|minor)\b/i.test(text)) {
    issues.push({ code: 'MISSING_KEY', message: 'Sound prompt should specify a musical key.' });
  }
  if (!/\bvocals?:/i.test(text)) {
    issues.push({ code: 'MISSING_VOCALS', message: 'Sound prompt should include a vocal description.' });
  }

  return { ok: issues.length === 0, chars, max, issues };
}

// ────────────────────────── ACE Music Style Prompt ──────────────────────────

function pacePhrase(bpm: number): string {
  if (bpm < 78) return 'slow, unhurried';
  if (bpm < 96) return 'mid-tempo, laid-back';
  if (bpm < 118) return 'steady, driving mid-tempo';
  return 'up-tempo, energetic';
}

function joinNatural(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function cleanSentence(s: string): string {
  const cleaned = stripBannedNames(s)
    .replace(/\bAfrican[\s-]American\b/gi, 'Black')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
  if (!cleaned) return '';
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.endsWith('.') ? capped : `${capped}.`;
}

/**
 * Builds an ACE Music Style prompt: ONE flowing prose paragraph (≤ 1,000 chars)
 * covering genre, mood, pace (BPM/key), instruments, production, and vocal
 * character, always ending verbatim with ACE_VOCAL_GUARDRAIL.
 */
export function buildAceStyle(
  spec: SoundSpec,
  max: number = LIMITS.ACE_STYLE_MAX_CHARS,
): { prompt: string; trimmed: string[] } {
  const { mood, persona, voice, bpm, switchBpm, key } = spec;
  const ps = persona.sound;

  const tempoClause = switchBpm
    ? `${bpm} BPM shifting at ${ps.switchAt ?? '1:00'} to ${switchBpm} BPM`
    : `${bpm} BPM`;

  const instruments = dedupe(ps.instruments?.length ? ps.instruments : ['warm keys', 'layered textures']).slice(0, 4);
  const drums = dedupe(ps.drums?.length ? ps.drums : ['crisp pocket drums']).slice(0, 3);
  const bass = dedupe(ps.bass?.length ? ps.bass : ['deep controlled bass']).slice(0, 2);
  const mix = dedupe([...(ps.arrangement ?? []), ...(ps.mix ?? [])]).slice(0, 2);
  const avoid = dedupe(ps.avoid ?? []).slice(0, 2);

  // Six-part flowing prose recipe driven directly by the Producer's genre DNA
  const moodWords = dedupe([mood.label.toLowerCase(), ...mood.descriptors.slice(0, 2)]);
  const dnaHead = ps.dna.split(',')[0]?.trim() || ps.dna;
  const openingFull = cleanSentence(
    `${ps.dna}, ${tempoClause}, ${key} — a ${pacePhrase(bpm)}, ${joinNatural(moodWords)} track`,
  );
  const openingCompact = cleanSentence(
    `${dnaHead}, ${tempoClause}, ${key} — a ${pacePhrase(bpm)}, ${mood.label.toLowerCase()} track`,
  );
  const openingMinimal = cleanSentence(
    `${dnaHead}, ${tempoClause}, ${key}, ${mood.label.toLowerCase()} feel`,
  );

  const instrFull = cleanSentence(
    `${joinNatural(instruments)} pair with ${joinNatural(bass)} and ${joinNatural(drums)}`,
  );
  const instrCompact = cleanSentence(
    `${joinNatural(instruments.slice(0, 2))} over ${bass[0] ?? 'deep bass'} and ${drums[0] ?? 'punchy drums'}`,
  );

  const prodFull =
    mix.length > 0
      ? cleanSentence(
          `Polished, spacious production with ${joinNatural(mix)}${avoid.length ? `, keeping out ${joinNatural(avoid)}` : ''}`,
        )
      : cleanSentence(
          `Polished, wide stereo production leaving a clean vocal pocket${avoid.length ? `, keeping out ${joinNatural(avoid)}` : ''}`,
        );
  const prodCompact = cleanSentence('Polished, wide stereo mix with a clean vocal pocket');

  // Filter out phrases already repeated verbatim in the guardrail
  const notInGuardrail = (s: string) =>
    !/real breaths|autotune|robotic pitch|never thin|never squeaky/i.test(s);

  const vReg = voice.vocal.register.filter(notInGuardrail);
  const vTone = voice.vocal.tone.filter(notInGuardrail);
  const vDel = voice.vocal.delivery.filter(notInGuardrail);

  const guardrail = ACE_VOCAL_GUARDRAIL;
  const maxBody = max - guardrail.length - 1;
  const trimmed: string[] = [];

  let variants: { label: string; body: string[] }[];

  if (voice.useExactPrompt) {
    // Use the Studio Vault profile's exact prompt text verbatim (moving the
    // guardrail to the exact end so it is never duplicated or buried).
    const exactFull = cleanSentence(
      voice.description.replace(guardrail, '').replace(/\s{2,}/g, ' ').trim(),
    );
    // Secondary fallback only if exactFull + minimal production exceeds 1,000 chars:
    // keep the entire vocal description verbatim and drop only an appended "Production: ..." tail
    // (since the selected Producer persona already drives production).
    const exactVocalOnly = cleanSentence(
      voice.description
        .replace(guardrail, '')
        .replace(/\bProduction:\s*[^]*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim(),
    );

    variants = [
      { label: 'full', body: [openingFull, instrFull, prodCompact, exactFull] },
      { label: 'compact-prod', body: [openingFull, instrCompact, exactFull] },
      { label: 'compact-open', body: [openingCompact, instrCompact, exactFull] },
      { label: 'minimal-open', body: [openingMinimal, instrCompact, exactFull] },
      { label: 'minimal-exact', body: [openingMinimal, exactFull] },
      { label: 'vocal-only-full', body: [openingCompact, instrCompact, exactVocalOnly] },
      { label: 'vocal-only-min', body: [openingMinimal, instrCompact, exactVocalOnly] },
      { label: 'vocal-only-bare', body: [openingMinimal, exactVocalOnly] },
    ];
  } else {
    const vocalFull = cleanSentence(
      `${voice.vocal.type} with ${joinNatural(vReg.slice(0, 2))}, ${joinNatural(vTone.slice(0, 2))}, delivered ${joinNatural(vDel.slice(0, 2))}`,
    );
    const vocalCompact = cleanSentence(
      `${voice.vocal.type} with ${vReg[0] ?? 'connected register'}, ${vTone[0] ?? 'warm clear tone'}, and ${vDel[0] ?? 'controlled expressive delivery'}`,
    );
    const vocalMinimal = cleanSentence(
      `${voice.vocal.type} with ${vReg[0] ?? 'connected registers'} and ${vDel[0] ?? 'expressive delivery'}`,
    );

    variants = [
      { label: 'full', body: [openingFull, instrFull, prodFull, vocalFull] },
      { label: 'compact-prod', body: [openingFull, instrFull, prodCompact, vocalFull] },
      { label: 'compact-vocal', body: [openingFull, instrFull, prodCompact, vocalCompact] },
      { label: 'compact-instr', body: [openingFull, instrCompact, prodCompact, vocalCompact] },
      { label: 'compact-open', body: [openingCompact, instrCompact, prodCompact, vocalCompact] },
      { label: 'drop-prod', body: [openingCompact, instrCompact, vocalCompact] },
      { label: 'minimal', body: [openingMinimal, instrCompact, vocalMinimal] },
    ];
  }

  let chosenBody = '';
  for (const v of variants) {
    const candidate = v.body.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
    if (charCount(candidate) <= maxBody) {
      chosenBody = candidate;
      if (v.label !== 'full') trimmed.push(`compacted:${v.label}`);
      break;
    }
  }

  // Last-resort safety trim on body only — guardrail is NEVER truncated.
  if (!chosenBody) {
    const fallback = variants[variants.length - 1].body.filter(Boolean).join(' ');
    chosenBody = fallback.slice(0, maxBody - 1).replace(/\s+\S*$/, '').replace(/[,;:\-]+$/, '').trim();
    if (chosenBody && !chosenBody.endsWith('.')) chosenBody += '.';
    trimmed.push('hard-trimmed-body');
  }

  const prompt = `${chosenBody} ${guardrail}`.replace(/\s{2,}/g, ' ').trim();
  return { prompt, trimmed };
}

/** Validates an ACE Music Style prompt against length, prose format, guardrail, and naming rules. */
export function validateAceStyle(
  text: string,
  max: number = LIMITS.ACE_STYLE_MAX_CHARS,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (chars > max) {
    issues.push({
      code: 'TOO_LONG',
      message: `Style is ${chars} characters; the ACE limit is ${max}.`,
    });
  }
  if (!text.trim()) {
    issues.push({ code: 'EMPTY', message: 'Style is empty.' });
    return { ok: false, chars, max, issues };
  }

  const banned = findBannedNames(text);
  if (banned.length > 0) {
    issues.push({
      code: 'BANNED_NAME',
      message: `Contains real producer or artist name(s): ${banned.join(', ')}. Describe the sound in plain words instead.`,
    });
  }
  if (DISALLOWED_WORDING_RE.test(text)) {
    issues.push({
      code: 'DISALLOWED_WORDING',
      message: 'Use "Black", never "African American".',
    });
  }
  if (/\n/.test(text.trim())) {
    issues.push({
      code: 'NOT_SINGLE_PARAGRAPH',
      message: 'ACE Style must be one flowing prose paragraph.',
    });
  }
  if (!text.trim().endsWith(ACE_VOCAL_GUARDRAIL)) {
    issues.push({
      code: 'MISSING_GUARDRAIL',
      message: 'ACE Style must end verbatim with the natural human vocal guardrail.',
    });
  }
  if (!/\b\d{2,3}\s*BPM\b/i.test(text)) {
    issues.push({ code: 'MISSING_BPM', message: 'Style should include BPM.' });
  }
  if (!/\b[A-G][#b]?\s*(major|minor)\b/i.test(text)) {
    issues.push({ code: 'MISSING_KEY', message: 'Style should include a musical key.' });
  }

  return { ok: issues.length === 0, chars, max, issues };
}
