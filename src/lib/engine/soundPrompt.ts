/**
 * STYLE & Sound Prompt builders and validators for ACE Music v1 (primary)
 * and Flow Music / Mozart AI (secondary).
 *
 * Enforces strict Artist & Producer independence across all four creation modes:
 *   - 'full'         (Artist + Producer) — Full Song: Production + Vocals + optional Blend
 *   - 'instrumental' (Producer only)     — Instrumental: Production only, explicitly no vocals
 *   - 'acappella'    (Artist only)       — A Cappella: Vocals only, explicitly no instruments
 *   - 'none'         (Neither selected)  — No Selection: empty prompt
 *
 * Hard enforcement:
 *   - Output is ALWAYS <= 1,000 characters (exact UTF-16 length matching UI counter).
 *   - Output NEVER contains any banned real producer or artist name.
 *   - Never truncates mid-sentence.
 */
import { findBannedNames, stripBannedNames } from '@/data/bannedNames';
import type { ProducerPersona } from '@/data/producerPersonas';
import { ACE_VOCAL_GUARDRAIL, NON_SOUL_GLIDER_OPENER, type VoicePreset } from '@/data/voicePresets';
import { DISALLOWED_WORDING_RE, LIMITS, charCount } from './limits';
import type { CreationMode, SoundSpec, ValidationIssue, ValidationResult } from './types';

export const INSTRUMENTAL_ONLY_DIRECTIVE =
  'Strictly instrumental-only track with no singing, no rapping, no spoken words, and no lead or background vocals.';

export const ACAPPELLA_ONLY_DIRECTIVE =
  'Pure unaccompanied a cappella vocal performance with zero instruments, no beat, no drums, no bass, and no backing track.';

interface Clause {
  key: string;
  label?: string;
  items: string[];
  priority: number;
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
    .replace(/\.{2,}/g, '.')
    .trim();
  if (!cleaned) return '';
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.endsWith('.') ? capped : `${capped}.`;
}

/**
 * Strips any embedded Production/instrumentation phrases from an Artist profile
 * so the Artist NEVER overwrites the Producer's beat or introduces instruments
 * in A Cappella mode.
 */
const EMBEDDED_INSTRUMENT_TAG_RE =
  /\b(fingerpicked acoustic guitar|acoustic guitar|warm bassline|subtle piano textures|light brushed percussion|minimal arrangement|slow tempo|spacious mix|soft room reverb|clean mix|high fidelity|polished but natural|warm organic r&b|neo-soul|acoustic soul)\b/i;

const GUARDRAIL_DUPLICATE_RE =
  /\b(real breaths|small imperfections|autotune|robotic pitch|never thin|never squeaky|generic voice|human imperfections)\b/i;

export function extractArtistVocalSentences(voice: VoicePreset): string[] {
  const raw = stripBannedNames(voice.description)
    .replace(ACE_VOCAL_GUARDRAIL, '')
    .replace(/\bProduction:\s*[^]*$/i, '')
    .replace(/\bAfrican[\s-]American\b/gi, 'Black')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Comma-tag style profiles (e.g. voc-fem-6) — filter out embedded production/instrument tags.
  if (!raw.includes('.') && raw.split(',').length >= 5) {
    const vocalTags = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !EMBEDDED_INSTRUMENT_TAG_RE.test(t) && !GUARDRAIL_DUPLICATE_RE.test(t));
    if (vocalTags.length === 0) {
      return [cleanSentence(voice.note)];
    }
    const core = cleanSentence(vocalTags.slice(0, 6).join(', '));
    const detail = vocalTags.length > 6 ? cleanSentence(vocalTags.slice(6, 12).join(', ')) : '';
    return [core, detail].filter(Boolean);
  }

  // Sentence-based Studio Vault & structured profiles
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s && !/^Production:/i.test(s))
    .map((s) => {
      // Remove trailing duplicated guardrail snippets inside a sentence
      return cleanSentence(
        s
          .replace(/,?\s*real breaths,?\s*no autotune sheen\.?$/i, '')
          .replace(/,?\s*no autotune sheen\.?$/i, ''),
      );
    })
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [cleanSentence(voice.vocal.type)];
}

/**
 * Strips lead-vocal references from a Producer's mix/arrangement notes when
 * building an Instrumental-only track so no vocal expectation leaks in.
 */
function sanitizeForInstrumental(phrase: string): string {
  return phrase
    .replace(/\bwith room for a lead (?:vocal|rapper|singer)\b/gi, 'with wide instrumental clarity')
    .replace(/\bleaving (?:a )?(?:clean )?vocal pocket\b/gi, 'with balanced stereo clarity')
    .replace(/\broom for a lead (?:vocal|rapper|singer)\b/gi, 'wide instrumental balance')
    .replace(/\bclean vocal pocket\b/gi, 'balanced stereo separation')
    .replace(/\b(?:pitched-up )?soul vocal or brass chops\b/gi, 'pitched-up soul brass and horn chops')
    .replace(/\bemotional vocal fragments\b/gi, 'warm chopped soul instrumental fragments')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Produces a concise compatibility blend instruction ONLY when Artist and Producer
 * come from contrasting lanes (e.g. Hip-hop Producer + R&B singer, or R&B Producer + Rapper).
 */
function buildCompatibilityBlend(persona: ProducerPersona, voice: VoicePreset): string {
  const dna = persona.sound.dna.toLowerCase();
  const producerIsHipHop = /\b(hip-hop|rap|boom-bap|trap|west coast)\b/.test(dna) && !/\br&b\b/.test(dna);
  const producerIsRnbSoul = /\b(r&b|soul|ballad|gospel|quiet storm|neo-soul)\b/.test(dna) && !/\b(hip-hop|trap|boom-bap)\b/.test(dna);
  const producerIsSpecialty = /\b(salsa|timba|house|dance|country|blues|marching-band|animated-musical)\b/.test(dna);
  const artistIsRap = voice.category === 'rap';

  if (producerIsHipHop && !artistIsRap) {
    return 'Keep the authentic hip-hop production intact while the soulful sung vocal rides cleanly inside the drum pocket.';
  }
  if (producerIsRnbSoul && artistIsRap) {
    return 'Keep the soulful instrumental untouched while the rap cadence locks sharply into the groove.';
  }
  if (producerIsSpecialty) {
    return artistIsRap
      ? 'Preserve the authentic instrumental groove while locking the rap vocal cleanly on top.'
      : 'Preserve the authentic instrumental groove while giving the lead vocal clear center presence.';
  }
  return '';
}

function buildProductionTiers(
  spec: SoundSpec,
  options: { instrumentalOnly: boolean },
): string[] {
  const persona = spec.persona;
  if (!persona) return [];
  const ps = persona.sound;
  const bpm = spec.bpm ?? 86;
  const key = spec.key ?? 'C minor';
  const mood = spec.mood;

  const cleanProd = (items: string[]) =>
    dedupe(
      items
        .map((x) => (options.instrumentalOnly ? sanitizeForInstrumental(x) : x))
        .map((x) => stripBannedNames(x).trim())
        .filter(Boolean),
    );

  const tempoClause = spec.switchBpm
    ? `${bpm} BPM shifting at ${ps.switchAt ?? '1:00'} to ${spec.switchBpm} BPM`
    : `${bpm} BPM`;

  const instruments = cleanProd(ps.instruments?.length ? ps.instruments : ['warm keys', 'layered textures']);
  const drums = cleanProd(ps.drums?.length ? ps.drums : ['crisp pocket drums']);
  const bass = cleanProd(ps.bass?.length ? ps.bass : ['deep controlled bass']);
  const mix = cleanProd([...(ps.arrangement ?? []), ...(ps.mix ?? [])]);
  const avoid = cleanProd(ps.avoid ?? []);

  const moodWords = dedupe([mood.label.toLowerCase(), ...mood.descriptors.slice(0, 2)]);
  const dnaFull = options.instrumentalOnly ? sanitizeForInstrumental(ps.dna) : ps.dna;
  const dnaHead = dnaFull.split(',')[0]?.trim() || dnaFull;

  const openFull = cleanSentence(
    `${dnaFull}, ${tempoClause}, ${key} — ${pacePhrase(bpm)}, ${joinNatural(moodWords)} feel`,
  );
  const openMid = cleanSentence(
    `${dnaHead}, ${tempoClause}, ${key}, ${pacePhrase(bpm)}, ${mood.label.toLowerCase()} feel`,
  );
  const openMin = cleanSentence(`${dnaHead}, ${tempoClause}, ${key}, ${mood.label.toLowerCase()}`);

  const instrFull = cleanSentence(
    `${joinNatural(instruments.slice(0, 4))} over ${joinNatural(bass.slice(0, 2))} and ${joinNatural(drums.slice(0, 3))}`,
  );
  const instrMid = cleanSentence(
    `${joinNatural(instruments.slice(0, 3))} over ${bass[0] ?? 'deep bass'} and ${drums[0] ?? 'punchy drums'}`,
  );
  const instrCompact = cleanSentence(
    `${joinNatural(instruments.slice(0, 2))}, ${bass[0] ?? 'deep bass'}, and ${drums[0] ?? 'pocket drums'}`,
  );

  const mixFull = mix.length
    ? cleanSentence(
        `${joinNatural(mix.slice(0, 2))}${avoid.length ? `, keeping out ${joinNatural(avoid.slice(0, 2))}` : ''}`,
      )
    : avoid.length
      ? cleanSentence(`Keeping out ${joinNatural(avoid.slice(0, 2))}`)
      : '';

  const mixShort = mix.length ? cleanSentence(mix[0]) : '';

  return dedupe([
    [openFull, instrFull, mixFull].filter(Boolean).join(' '),
    [openFull, instrFull, mixShort].filter(Boolean).join(' '),
    [openFull, instrMid, mixShort].filter(Boolean).join(' '),
    [openMid, instrMid].filter(Boolean).join(' '),
    [openMid, instrCompact].filter(Boolean).join(' '),
    [openMin, instrCompact].filter(Boolean).join(' '),
    openMin,
  ]);
}

function buildVocalTiers(voice: VoicePreset): string[] {
  const sentences = extractArtistVocalSentences(voice);
  const tiers: string[] = [];

  // Full -> progressively drop trailing secondary sentences while keeping complete sentences
  for (let count = sentences.length; count >= 1; count--) {
    tiers.push(sentences.slice(0, count).join(' '));
  }

  // Also add structured compact fallback if sentence 1 itself is very long
  const notInGuardrail = (s: string) => !GUARDRAIL_DUPLICATE_RE.test(s);
  const vReg = voice.vocal.register.filter(notInGuardrail);
  const vTone = voice.vocal.tone.filter(notInGuardrail);
  const vDel = voice.vocal.delivery.filter(notInGuardrail);

  const compactStructured = cleanSentence(
    `${voice.vocal.type}${vReg[0] ? ` with ${vReg[0]}` : ''}${vTone[0] ? `, ${vTone[0]}` : ''}${vDel[0] ? `, ${vDel[0]}` : ''}`,
  );
  const minimalStructured = cleanSentence(`${voice.vocal.type} — ${voice.note}`);

  tiers.push(compactStructured, minimalStructured);
  return dedupe(tiers);
}

// ────────────────────────── Flow / Mozart Sound Prompt ──────────────────────────

/**
 * Builds the Flow / Mozart sound prompt across all 4 creation modes,
 * strictly fitted within `max` characters (default 1,000).
 */
export function buildSoundPrompt(
  spec: SoundSpec,
  max: number = LIMITS.SOUND_MAX_CHARS,
): { prompt: string; trimmed: string[] } {
  if (spec.mode === 'none') {
    return { prompt: '', trimmed: [] };
  }

  const opener = spec.includeOpener ? NON_SOUL_GLIDER_OPENER : null;
  const clauses: Clause[] = [];

  if (spec.persona) {
    const ps = spec.persona.sound;
    const isInstOnly = spec.mode === 'instrumental';
    const clean = (arr: string[]) =>
      dedupe(arr.map((x) => (isInstOnly ? sanitizeForInstrumental(x) : x)));

    const bpm = spec.bpm ?? 86;
    const key = spec.key ?? 'C minor';
    const tempoText = spec.switchBpm
      ? `${bpm} BPM, switching at ${ps.switchAt ?? '1:00'} to ${spec.switchBpm} BPM`
      : `${bpm} BPM`;

    const instruments = clean(ps.instruments?.length ? ps.instruments : ['warm keys', 'layered textures']);
    const drums = clean(ps.drums?.length ? ps.drums : ['crisp pocket drums']);
    const bass = clean(ps.bass?.length ? ps.bass : ['deep controlled bass']);
    const moodList = dedupe([spec.mood.label.toLowerCase(), ...spec.mood.descriptors]);
    const arrangement = clean([...(ps.arrangement ?? []), ...(ps.mix ?? [])]);
    const avoid = clean(ps.avoid ?? []);

    clauses.push(
      { key: 'style', items: [isInstOnly ? sanitizeForInstrumental(ps.dna) : ps.dna], priority: 10, minItems: 1 },
      { key: 'tempo-key', items: [tempoText, key], priority: 10, minItems: 2 },
      { key: 'mood', label: 'Mood', items: moodList, priority: 7, minItems: 1 },
      { key: 'instruments', label: 'Instruments', items: instruments, priority: 8, minItems: 1 },
      { key: 'drums', label: 'Drums', items: drums, priority: 8, minItems: 1 },
      { key: 'bass', label: 'Bass', items: bass, priority: 8, minItems: 1 },
      { key: 'arrangement', label: 'Mix', items: arrangement, priority: 3, minItems: 0 },
      { key: 'avoid', prefix: 'Avoid: ', items: avoid, priority: 2, minItems: 0 },
    );

    if (isInstOnly) {
      clauses.push({
        key: 'instrumental-only',
        items: [INSTRUMENTAL_ONLY_DIRECTIVE],
        priority: 11,
        minItems: 1,
      });
    }
  }

  if (spec.voice) {
    const vocalSentences = extractArtistVocalSentences(spec.voice);
    if (spec.mode === 'acappella') {
      clauses.push({
        key: 'acappella-only',
        items: [ACAPPELLA_ONLY_DIRECTIVE],
        priority: 11,
        minItems: 1,
      });
      if (spec.bpm) {
        clauses.push({ key: 'tempo', items: [`${spec.bpm} BPM`], priority: 9, minItems: 1 });
      }
      clauses.push({
        key: 'mood',
        label: 'Mood',
        items: [spec.mood.label.toLowerCase(), ...spec.mood.descriptors.slice(0, 2)],
        priority: 7,
        minItems: 1,
      });
    }
    clauses.push({
      key: 'vocals',
      label: 'Vocals',
      items: [vocalSentences[0] ?? spec.voice.vocal.type],
      priority: 10,
      minItems: 1,
    });
    if (vocalSentences.length > 1) {
      clauses.push({
        key: 'vocal-detail',
        items: vocalSentences.slice(1),
        priority: 8,
        minItems: 0,
      });
    }
  }

  if (spec.persona && spec.voice) {
    const blend = buildCompatibilityBlend(spec.persona, spec.voice);
    if (blend) {
      clauses.push({ key: 'blend', items: [blend], priority: 9, minItems: 0 });
    }
  }

  for (const c of clauses) {
    c.items = c.items.map((x) => stripBannedNames(x).trim()).filter(Boolean);
  }

  const trimmed: string[] = [];
  const currentText = () => assemble(opener, clauses);

  while (charCount(currentText()) > max) {
    const trimmable = clauses
      .filter((c) => c.items.length > c.minItems)
      .sort((a, b) => a.priority - b.priority || b.items.length - a.items.length);

    if (trimmable.length > 0) {
      const target = trimmable[0];
      const removed = target.items.pop();
      if (removed) trimmed.push(`${target.key}: ${removed}`);
      continue;
    }

    const droppable = clauses
      .filter((c) => c.items.length > 0 && c.priority < 11)
      .sort((a, b) => a.priority - b.priority || renderClause(b).length - renderClause(a).length)[0];
    if (!droppable) break;
    const removed = droppable.items.pop();
    if (removed) trimmed.push(`${droppable.key}: ${removed}`);
  }

  const prompt = stripBannedNames(currentText());
  return { prompt, trimmed };
}

/** Validates a Flow / Mozart sound prompt against mode-specific rules. */
export function validateSoundPrompt(
  text: string,
  max: number = LIMITS.SOUND_MAX_CHARS,
  mode: CreationMode = 'full',
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (mode === 'none') {
    if (chars > max) {
      issues.push({ code: 'TOO_LONG', message: `Sound prompt is ${chars} characters; the limit is ${max}.` });
    }
    return { ok: issues.length === 0, chars, max, issues };
  }

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

  if (mode === 'full' || mode === 'instrumental') {
    if (!/\b\d{2,3}\s*BPM\b/i.test(text)) {
      issues.push({ code: 'MISSING_BPM', message: 'Sound prompt should specify BPM.' });
    }
    if (!/\b[A-G][#b]?\s*(major|minor)\b/i.test(text)) {
      issues.push({ code: 'MISSING_KEY', message: 'Sound prompt should specify a musical key.' });
    }
  }

  if (mode === 'full' || mode === 'acappella') {
    if (!/\bvocals?:/i.test(text)) {
      issues.push({ code: 'MISSING_VOCALS', message: 'Sound prompt should include a vocal description.' });
    }
  }

  if (mode === 'instrumental' && !/\binstrumental[-\s]?only\b|\bno (?:singing|vocals)\b/i.test(text)) {
    issues.push({
      code: 'MISSING_INSTRUMENTAL_DIRECTIVE',
      message: 'Instrumental prompt must explicitly specify instrumental-only / no vocals.',
    });
  }

  if (mode === 'acappella' && !/\ba\s*cappella\b/i.test(text)) {
    issues.push({
      code: 'MISSING_ACAPPELLA_DIRECTIVE',
      message: 'A cappella prompt must explicitly specify unaccompanied a cappella.',
    });
  }

  return { ok: issues.length === 0, chars, max, issues };
}

// ────────────────────────── ACE Music v1 STYLE Prompt ──────────────────────────

/**
 * Builds an ACE Music v1 STYLE prompt (strictly <= 1,000 chars, single prose
 * paragraph, complete sentences only) tailored to the active CreationMode:
 *   - 'full':         Dynamic allocation between Producer & Artist (+ short Blend when needed) + vocal guardrail
 *   - 'instrumental': Producer musical identity only + explicit instrumental-only directive (no vocal guardrail)
 *   - 'acappella':    Artist vocal identity only + explicit a cappella directive + vocal guardrail
 *   - 'none':         Empty string
 */
export function buildAceStyle(
  spec: SoundSpec,
  max: number = LIMITS.ACE_STYLE_MAX_CHARS,
): { prompt: string; trimmed: string[] } {
  const trimmed: string[] = [];

  // Mode D: Neither selected
  if (spec.mode === 'none') {
    return { prompt: '', trimmed };
  }

  // Mode B: Producer only (Instrumental)
  if (spec.mode === 'instrumental' && spec.persona) {
    const directive = INSTRUMENTAL_ONLY_DIRECTIVE;
    const maxBody = max - directive.length - 1;
    const prodTiers = buildProductionTiers(spec, { instrumentalOnly: true });

    let chosenBody = '';
    for (let i = 0; i < prodTiers.length; i++) {
      if (charCount(prodTiers[i]) <= maxBody) {
        chosenBody = prodTiers[i];
        if (i > 0) trimmed.push(`compacted-prod:tier-${i}`);
        break;
      }
    }
    if (!chosenBody) {
      chosenBody = prodTiers[prodTiers.length - 1] ?? '';
      trimmed.push('minimal-prod');
    }

    const prompt = `${chosenBody} ${directive}`.replace(/\s{2,}/g, ' ').trim();
    return { prompt, trimmed };
  }

  // Mode C: Artist only (A Cappella)
  if (spec.mode === 'acappella' && spec.voice) {
    const guardrail = ACE_VOCAL_GUARDRAIL;
    const moodSentence = cleanSentence(
      `${spec.mood.label} mood (${spec.mood.descriptors.slice(0, 2).join(', ')})${spec.bpm ? `, ${spec.bpm} BPM pacing` : ''}`,
    );
    const vocalTiers = buildVocalTiers(spec.voice);
    const fixedSuffix = `${ACAPPELLA_ONLY_DIRECTIVE} ${guardrail}`;
    const maxBody = max - fixedSuffix.length - 1;

    // Try with mood + vocal tiers, then vocal tiers alone
    const candidates: Array<{ label: string; text: string }> = [
      ...vocalTiers.map((v, i) => ({ label: `mood+vocal-${i}`, text: `${v} ${moodSentence}`.trim() })),
      ...vocalTiers.map((v, i) => ({ label: `vocal-${i}`, text: v })),
    ];

    let chosenBody = '';
    for (const c of candidates) {
      if (charCount(c.text) <= maxBody) {
        chosenBody = c.text;
        if (c.label !== 'mood+vocal-0') trimmed.push(`compacted:${c.label}`);
        break;
      }
    }
    if (!chosenBody) {
      chosenBody = vocalTiers[vocalTiers.length - 1] ?? cleanSentence(spec.voice.vocal.type);
      trimmed.push('minimal-vocal');
    }

    const prompt = `${chosenBody} ${fixedSuffix}`.replace(/\s{2,}/g, ' ').trim();
    return { prompt, trimmed };
  }

  // Mode A: Artist + Producer (Full Song)
  if (spec.persona && spec.voice) {
    const guardrail = ACE_VOCAL_GUARDRAIL;
    const blend = buildCompatibilityBlend(spec.persona, spec.voice);
    const prodTiers = buildProductionTiers(spec, { instrumentalOnly: false });
    const vocalTiers = buildVocalTiers(spec.voice);
    const maxBody = max - guardrail.length - 1;

    // Dynamic balanced search: evaluate (prodTier, vocalTier, includeBlend) combinations
    // ranked to preserve defining characteristics of BOTH Producer and Artist before
    // dropping details. More complex profiles automatically keep deeper tiers when the
    // paired profile is compact.
    interface Candidate {
      prodIdx: number;
      vocalIdx: number;
      hasBlend: boolean;
      text: string;
      score: number;
    }

    const validCandidates: Candidate[] = [];
    for (let pi = 0; pi < prodTiers.length; pi++) {
      for (let vi = 0; vi < vocalTiers.length; vi++) {
        for (const includeBlend of blend ? [true, false] : [false]) {
          const parts = [prodTiers[pi], vocalTiers[vi], includeBlend ? blend : ''].filter(Boolean);
          const text = parts.join(' ').replace(/\s{2,}/g, ' ').trim();
          const len = charCount(text);
          if (len <= maxBody) {
            // Balance penalty strongly discourages starving either Producer or Artist.
            const prodRatio = pi / Math.max(1, prodTiers.length - 1);
            const vocalRatio = vi / Math.max(1, vocalTiers.length - 1);
            const imbalance = Math.abs(prodRatio - vocalRatio);
            const score =
              (1 - prodRatio) * 50 +
              (1 - vocalRatio) * 50 -
              imbalance * 20 +
              (includeBlend ? 12 : 0) +
              (len / maxBody) * 5;
            validCandidates.push({ prodIdx: pi, vocalIdx: vi, hasBlend: includeBlend, text, score });
          }
        }
      }
    }

    validCandidates.sort((a, b) => b.score - a.score);
    const best = validCandidates[0];

    let chosenBody = '';
    if (best) {
      chosenBody = best.text;
      if (best.prodIdx > 0 || best.vocalIdx > 0) {
        trimmed.push(`balanced:p${best.prodIdx}-v${best.vocalIdx}`);
      }
    } else {
      // Absolute minimal complete-sentence fallback (never cuts mid-sentence)
      const minProd = prodTiers[prodTiers.length - 1] ?? '';
      const minVocal = vocalTiers[vocalTiers.length - 1] ?? '';
      chosenBody = `${minProd} ${minVocal}`.trim();
      trimmed.push('minimal-complete-sentences');
    }

    const prompt = `${chosenBody} ${guardrail}`.replace(/\s{2,}/g, ' ').trim();
    return { prompt, trimmed };
  }

  return { prompt: '', trimmed };
}

/**
 * Validates an ACE Music v1 STYLE prompt against length (<= 1,000),
 * single-paragraph format, mode-specific requirements, and naming rules.
 */
export function validateAceStyle(
  text: string,
  max: number = LIMITS.ACE_STYLE_MAX_CHARS,
  mode: CreationMode = 'full',
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const chars = charCount(text);

  if (mode === 'none') {
    if (chars > max) {
      issues.push({
        code: 'TOO_LONG',
        message: `Style is ${chars} characters; the ACE limit is ${max}.`,
      });
    }
    return { ok: issues.length === 0, chars, max, issues };
  }

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

  if (mode === 'full' || mode === 'acappella') {
    if (!text.trim().endsWith(ACE_VOCAL_GUARDRAIL)) {
      issues.push({
        code: 'MISSING_GUARDRAIL',
        message: 'ACE Style must end verbatim with the natural human vocal guardrail.',
      });
    }
  }

  if (mode === 'instrumental') {
    if (text.includes(ACE_VOCAL_GUARDRAIL)) {
      issues.push({
        code: 'VOCAL_IN_INSTRUMENTAL',
        message: 'Instrumental-only Style must not include vocal instructions or the vocal guardrail.',
      });
    }
    if (!/\binstrumental[-\s]?only\b|\bno (?:singing|vocals)\b/i.test(text)) {
      issues.push({
        code: 'MISSING_INSTRUMENTAL_DIRECTIVE',
        message: 'Instrumental Style must explicitly specify instrumental-only / no vocals.',
      });
    }
  }

  if (mode === 'acappella') {
    if (!/\ba\s*cappella\b/i.test(text)) {
      issues.push({
        code: 'MISSING_ACAPPELLA_DIRECTIVE',
        message: 'A Cappella Style must explicitly specify unaccompanied a cappella.',
      });
    }
  }

  if (mode === 'full' || mode === 'instrumental') {
    if (!/\b\d{2,3}\s*BPM\b/i.test(text)) {
      issues.push({ code: 'MISSING_BPM', message: 'Style should include BPM.' });
    }
    if (!/\b[A-G][#b]?\s*(major|minor)\b/i.test(text)) {
      issues.push({ code: 'MISSING_KEY', message: 'Style should include a musical key.' });
    }
  }

  return { ok: issues.length === 0, chars, max, issues };
}
