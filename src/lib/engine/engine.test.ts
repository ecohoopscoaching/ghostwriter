import { describe, expect, it } from 'vitest';
import { findBannedNames } from '@/data/bannedNames';
import {
  ADVANCED_TECHNIQUES,
  DEFAULT_PERSPECTIVE_ID,
  HIT_MAKING_CHECKLIST,
  HIT_SONG_QUESTIONS,
  PERSPECTIVES,
  RAP_FLOW_MODES,
  RAP_QUALITY_CHECKLIST,
  RNB_REPLAY_CHECKLIST,
  STORYTELLING_STYLES,
} from '@/data/craftLibrary';
import { DEFAULT_MOOD_ID, MOODS } from '@/data/moods';
import { DEFAULT_PERSONA_ID, PRODUCER_PERSONAS } from '@/data/producerPersonas';
import { CUSTOM_TEMPO_PREFIX, DEFAULT_TEMPO_ID, TEMPOS, resolveTempo } from '@/data/tempos';
import { TOPICS, TOPIC_CATEGORIES } from '@/data/topics';
import {
  ACE_VOCAL_GUARDRAIL,
  DEFAULT_VOICE_ID,
  NON_SOUL_GLIDER_OPENER,
  VOICE_PRESETS,
} from '@/data/voicePresets';
import { createGeminiProvider } from './geminiProvider';
import { buildSoundSpec, generateSong } from './generate';
import { buildLiveLlmPrompts } from './providers';
import { DEFAULT_TARGET, DISALLOWED_WORDING_RE, LIMITS, charCount } from './limits';
import {
  repairAceLyrics,
  repairLyrics,
  validateAceLyrics,
  validateLyrics,
} from './lyrics';
import {
  buildAceStyle,
  buildSoundPrompt,
  validateAceStyle,
  validateSoundPrompt,
} from './soundPrompt';

describe('Preset libraries & defaults', () => {
  it('defaults to ACE Music target with NO default Artist and NO default Producer', () => {
    expect(DEFAULT_TARGET).toBe('ace');
    expect(DEFAULT_PERSONA_ID).toBe('');
    expect(DEFAULT_VOICE_ID).toBe('');
    expect(DEFAULT_PERSONA_ID).not.toBe('p36');
  });

  it('contains all 68 producer personas organized as House (3), Owner (30), Internal (35)', () => {
    expect(PRODUCER_PERSONAS).toHaveLength(68);
    expect(PRODUCER_PERSONAS.filter((p) => p.group === 'house')).toHaveLength(3);
    expect(PRODUCER_PERSONAS.filter((p) => p.group === 'owner')).toHaveLength(30);
    expect(PRODUCER_PERSONAS.filter((p) => p.group === 'internal')).toHaveLength(35);
    expect(PRODUCER_PERSONAS.find((p) => p.id === 'p36')?.name).toBe('REELZ');
  });

  it('contains 32 deduplicated vocalists across 4 categories with zero duplicate prompts and accurate gender markers', () => {
    expect(DEFAULT_VOICE_ID).toBe('');
    expect(VOICE_PRESETS).toHaveLength(32);
    expect(VOICE_PRESETS.filter((v) => v.category === 'tenor')).toHaveLength(5);
    expect(VOICE_PRESETS.filter((v) => v.category === 'baritone')).toHaveLength(4);
    expect(VOICE_PRESETS.filter((v) => v.category === 'rap')).toHaveLength(17);
    expect(VOICE_PRESETS.filter((v) => v.category === 'female')).toHaveLength(6);

    const prompts = VOICE_PRESETS.map((v) => v.description.trim().toLowerCase());
    expect(new Set(prompts).size).toBe(32);

    const names = VOICE_PRESETS.map((v) => v.name.trim().toLowerCase());
    expect(new Set(names).size).toBe(32);

    for (const v of VOICE_PRESETS) {
      if (v.category === 'baritone' || v.category === 'tenor' || v.category === 'rap') {
        expect(v.gender, `${v.name} should be male`).toBe('male');
      }
      if (v.category === 'female') {
        expect(v.gender, `${v.name} should be female`).toBe('female');
      }
      expect(DISALLOWED_WORDING_RE.test(v.description)).toBe(false);
    }
  });

  it('contains the Complete Rap & R&B Topic Bible (10 categories, 92 unique topics, 4+ specific scenes each)', () => {
    expect(TOPIC_CATEGORIES).toHaveLength(10);
    expect(TOPICS).toHaveLength(92);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(92);
    for (const t of TOPICS) {
      expect(t.scenes.length, `${t.label} should have specific scenes`).toBeGreaterThanOrEqual(4);
      for (const s of t.scenes) {
        expect(s.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('supports Tempo dropdown presets, custom exact BPM values, and producer-inferred tempos', () => {
    expect(TEMPOS.length).toBeGreaterThanOrEqual(6);
    expect(resolveTempo(`${CUSTOM_TEMPO_PREFIX}84`).bpm).toEqual([84, 84]);

    const exactSpec = buildSoundSpec(
      {
        topic: 'Long-distance love',
        moodId: 'romantic',
        tempoId: `${CUSTOM_TEMPO_PREFIX}84`,
        personaId: 'p11',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      12,
    );
    expect(exactSpec.bpm).toBe(84);

    // Salsa producer automatically infers salsa BPM when Tempo is Auto
    const salsaSpec = buildSoundSpec(
      {
        topic: 'First attraction',
        moodId: 'euphoric',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p48',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      12,
    );
    expect(salsaSpec.bpm).toBeGreaterThanOrEqual(168);
  });
});

describe('ACE Music target (primary) — all 68 personas × 32 voices (2,176 combinations)', () => {
  it('every ACE Style is <= 1,000 chars, single prose paragraph, ends verbatim with guardrail, zero banned names', () => {
    for (const persona of PRODUCER_PERSONAS) {
      for (const voice of VOICE_PRESETS) {
        const spec = buildSoundSpec(
          {
            topic: 'Becoming a father',
            moodId: 'reflective',
            tempoId: DEFAULT_TEMPO_ID,
            personaId: persona.id,
            voiceId: voice.id,
            target: 'ace',
          },
          42,
        );
        const { prompt } = buildAceStyle(spec, LIMITS.ACE_STYLE_MAX_CHARS);
        expect(charCount(prompt), `${persona.name} + ${voice.name} exceeded 1000 chars`).toBeLessThanOrEqual(
          LIMITS.ACE_STYLE_MAX_CHARS,
        );
        expect(prompt.endsWith(ACE_VOCAL_GUARDRAIL), `${persona.name} + ${voice.name} missing verbatim guardrail`).toBe(
          true,
        );
        expect(prompt.includes('\n'), `${persona.name} + ${voice.name} should be one prose paragraph`).toBe(false);
        expect(findBannedNames(prompt), `${persona.name} leaked banned names`).toEqual([]);
        expect(DISALLOWED_WORDING_RE.test(prompt)).toBe(false);
        const v = validateAceStyle(prompt, LIMITS.ACE_STYLE_MAX_CHARS);
        expect(v.ok, `${persona.name} + ${voice.name} failed ACE style validation: ${JSON.stringify(v.issues)}`).toBe(
          true,
        );
      }
    }
  });

  it('generates full ACE native lyrics across all 32 voices with matching male/female tags, Bridge, Final Chorus, and echoes', async () => {
    for (const voice of VOICE_PRESETS) {
      const res = await generateSong(
        {
          topic: 'Detroit R&B singer talking to his younger self, the hard years were worth it',
          moodId: 'reflective',
          tempoId: 'slow-jam',
          personaId: 'p1',
          voiceId: voice.id,
          target: 'ace',
        },
        { seed: 2026 },
      );

      expect(res.report.target).toBe('ace');
      expect(res.report.lyrics.ok, JSON.stringify(res.report.lyrics.issues)).toBe(true);
      expect(res.report.sound.ok, JSON.stringify(res.report.sound.issues)).toBe(true);
      expect(charCount(res.lyrics)).toBeLessThanOrEqual(LIMITS.ACE_LYRICS_MAX_CHARS);
      expect(charCount(res.soundPrompt)).toBeLessThanOrEqual(LIMITS.ACE_STYLE_MAX_CHARS);

      const g = voice.gender;
      expect(res.lyrics.startsWith(`[Verse 1: ${g}]`), `${voice.name} must cold-open at Verse 1`).toBe(true);
      expect(res.lyrics).not.toContain(`[Intro: ${g}]`);
      expect(res.lyrics).toContain(`[Verse 1: ${g}]`);
      expect(res.lyrics).toContain(`[Pre-Chorus: ${g}]`);
      expect(res.lyrics).toContain(`[Chorus: ${g}]`);
      expect(res.lyrics).toContain(`[Verse 2: ${g}]`);
      expect(res.lyrics).toContain(`[Bridge: ${g}]`);
      expect(res.lyrics).toContain(`[Final Chorus: ${g}]`);
      expect(res.lyrics).toContain(`[Outro: ${g}]`);
      expect(res.lyrics).toMatch(/\([^)]+\)/);
      expect(findBannedNames(res.lyrics)).toEqual([]);
      expect(findBannedNames(res.soundPrompt)).toEqual([]);
      expect(DISALLOWED_WORDING_RE.test(res.lyrics)).toBe(false);
      expect(DISALLOWED_WORDING_RE.test(res.soundPrompt)).toBe(false);
    }
  });

  it('hard-trims oversized ACE lyrics (> 5,000 chars) while preserving Bridge and Final Chorus', () => {
    const line = 'Every late night in the basement taught me how to hold the note when the room went quiet';
    const oversized = [
      '[Intro: male]',
      '[Cold open: warm Rhodes]',
      'Worth every mile',
      '[Verse 1: male]',
      ...Array(35).fill(line),
      '[Pre-Chorus: male]',
      'Maybe the road was never meant to break me',
      '[Chorus: male]',
      'Was it worth every mile? (worth every mile)',
      '[Verse 2: male]',
      ...Array(35).fill(line),
      '[Pre-Chorus: male]',
      'Maybe the road was never meant to break me',
      '[Chorus: male]',
      'Was it worth every mile? (worth every mile)',
      '[Bridge: male]',
      'Who would I be if the road had been easy?',
      '[Final Chorus: male]',
      'It was worth every mile (worth every mile)',
      '[Outro: male]',
      'Worth every mile',
    ].join('\n');

    expect(charCount(oversized)).toBeGreaterThan(LIMITS.ACE_LYRICS_MAX_CHARS);
    const repaired = repairAceLyrics(oversized, 'male', LIMITS.ACE_LYRICS_MAX_CHARS);
    expect(charCount(repaired)).toBeLessThanOrEqual(LIMITS.ACE_LYRICS_MAX_CHARS);
    expect(repaired.startsWith('[Verse 1: male]')).toBe(true);
    expect(repaired).not.toContain('[Intro: male]');
    expect(repaired).toContain('[Bridge: male]');
    expect(repaired).toContain('[Final Chorus: male]');
    const check = validateAceLyrics(repaired, 'male', LIMITS.ACE_LYRICS_MAX_CHARS);
    expect(check.ok, JSON.stringify(check.issues)).toBe(true);
  });

  it('rejects "African American" wording in ACE style validator', () => {
    const badStyle = `Contemporary R&B, 84 BPM, D minor. African American male tenor. ${ACE_VOCAL_GUARDRAIL}`;
    const sv = validateAceStyle(badStyle);
    expect(sv.ok).toBe(false);
    expect(sv.issues.some((i) => i.code === 'DISALLOWED_WORDING')).toBe(true);
  });
});

describe('Flow / Mozart target (secondary) — all 68 personas × 32 voices (2,176 combinations)', () => {
  it('never exceeds 1,000 chars, never leaks real producer/artist names, and passes validation', () => {
    for (const persona of PRODUCER_PERSONAS) {
      for (const voice of VOICE_PRESETS) {
        const spec = buildSoundSpec(
          {
            topic: 'late night drive home',
            moodId: DEFAULT_MOOD_ID,
            tempoId: DEFAULT_TEMPO_ID,
            personaId: persona.id,
            voiceId: voice.id,
            target: 'flow',
          },
          42,
        );
        const { prompt } = buildSoundPrompt(spec, LIMITS.SOUND_MAX_CHARS);
        expect(charCount(prompt), `${persona.name} + ${voice.name} exceeded 1000 chars`).toBeLessThanOrEqual(
          LIMITS.SOUND_MAX_CHARS,
        );
        expect(findBannedNames(prompt), `${persona.name} leaked banned names`).toEqual([]);
        const v = validateSoundPrompt(prompt, LIMITS.SOUND_MAX_CHARS);
        expect(v.ok, `${persona.name} + ${voice.name} failed validation: ${JSON.stringify(v.issues)}`).toBe(true);
      }
    }
  });

  it('includes the non-Soul Glider opener for non-Soul Glider Flow tracks and omits it for REELZ', () => {
    const nonSgSpec = buildSoundSpec(
      {
        topic: 'city lights',
        moodId: 'dark',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p1',
        voiceId: 'voc-bar-4',
        target: 'flow',
      },
      7,
    );
    expect(buildSoundPrompt(nonSgSpec).prompt.startsWith(NON_SOUL_GLIDER_OPENER)).toBe(true);

    const reelzSpec = buildSoundSpec(
      {
        topic: 'city lights',
        moodId: 'heartbroken',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p36',
        voiceId: 'seasoned-tenor',
        target: 'flow',
      },
      7,
    );
    expect(buildSoundPrompt(reelzSpec).prompt.startsWith(NON_SOUL_GLIDER_OPENER)).toBe(false);
  });

  it('hard-trims oversized Flow lyrics to <= 3,000 chars while preserving valid structure', async () => {
    const longLine = 'Walking down the avenue with the silver skyline glowing in the rain tonight';
    const oversized = [
      '[Intro]',
      '[low, close]',
      longLine,
      '',
      '[Verse 1]',
      ...Array(24).fill(longLine),
      '',
      '[Chorus]',
      '[full voice]',
      ...Array(10).fill(longLine),
      '',
      '[Verse 2]',
      ...Array(24).fill(longLine),
      '',
      '[Bridge]',
      ...Array(10).fill(longLine),
      '',
      '[Outro]',
      ...Array(6).fill(longLine),
    ].join('\n');

    expect(charCount(oversized)).toBeGreaterThan(LIMITS.LYRICS_MAX_CHARS);
    const repaired = repairLyrics(oversized, LIMITS.LYRICS_MAX_CHARS);
    expect(charCount(repaired)).toBeLessThanOrEqual(LIMITS.LYRICS_MAX_CHARS);
    const check = validateLyrics(repaired, LIMITS.LYRICS_MAX_CHARS);
    expect(check.ok, JSON.stringify(check.issues)).toBe(true);

    const res = await generateSong(
      {
        topic: 'starting over in a new city',
        moodId: MOODS[0].id,
        tempoId: 'ballad',
        personaId: 'p5',
        voiceId: VOICE_PRESETS[0].id,
        target: 'flow',
      },
      { seed: 1000 },
    );
    expect(res.report.lyrics.ok).toBe(true);
    expect(charCount(res.lyrics)).toBeLessThanOrEqual(LIMITS.LYRICS_MAX_CHARS);
  });
});

describe('Songwriting Craft Library & Mode-Aware Rulebook Prompts', () => {
  it('contains all 39 perspectives, 80 storytelling styles, 30 advanced techniques (8 priority), 5 flow modes, and 10 hit-making checks', () => {
    expect(PERSPECTIVES).toHaveLength(39);
    expect(new Set(PERSPECTIVES.map((p) => p.id)).size).toBe(39);

    expect(STORYTELLING_STYLES).toHaveLength(80);
    expect(new Set(STORYTELLING_STYLES.map((s) => s.id)).size).toBe(80);
    expect(STORYTELLING_STYLES.map((s) => s.number)).toEqual(
      Array.from({ length: 80 }, (_, i) => i + 1),
    );

    expect(ADVANCED_TECHNIQUES).toHaveLength(30);
    expect(new Set(ADVANCED_TECHNIQUES.map((t) => t.id)).size).toBe(30);
    expect(ADVANCED_TECHNIQUES.filter((t) => t.priority)).toHaveLength(8);

    expect(RAP_FLOW_MODES).toHaveLength(5);
    expect(HIT_MAKING_CHECKLIST).toHaveLength(10);
    expect(HIT_SONG_QUESTIONS).toHaveLength(5);
    expect(RAP_QUALITY_CHECKLIST).toHaveLength(9);
    expect(RNB_REPLAY_CHECKLIST).toHaveLength(7);
  });

  it('injects Master Rap Rulebook + 16-bar arc + Hit Checklist for rap tracks and full 10-rule R&B Rulebook + Replay Audit for R&B tracks', () => {
    const rapVoice = VOICE_PRESETS.find((v) => v.category === 'rap')!;
    const rapSpec = buildSoundSpec(
      {
        topic: 'Too quiet — peace feels dangerous after chaos',
        moodId: 'dark',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p1',
        voiceId: rapVoice.id,
        target: 'ace',
        perspectiveId: 'observer-camera',
        storytellingIds: ['s07-journey-story', 's10-then-vs-now', 's33-full-circle'],
        techniqueIds: ['motif-mutation', 'callback-payoff'],
        flowModeId: 'chopper',
      },
      99,
    );
    const rapPrompts = buildLiveLlmPrompts('Too quiet', rapSpec);
    expect(rapPrompts.system).toContain('MASTER RAP WRITING RULEBOOK');
    expect(rapPrompts.system).toContain('Treat 16 Bars as the Core of the Craft');
    expect(rapPrompts.system).toContain('FLOW MODE — CHOPPER');
    expect(rapPrompts.system).toContain('THE HIT SONG RULE');
    expect(rapPrompts.system).toContain('THE LIQUID LEGEND RULE');
    expect(rapPrompts.system).toContain('FINAL HIT-MAKING CHECKLIST');
    expect(rapPrompts.system).toContain('RAP FINAL QUALITY AUDIT');
    expect(rapPrompts.system).not.toContain('R&B REPLAY VALUE AUDIT');
    expect(rapPrompts.user).toContain('Observer / camera perspective');
    expect(rapPrompts.user).toContain('Journey Story');
    expect(rapPrompts.user).toContain('Full-Circle Story');
    expect(rapPrompts.user).toContain('Motif mutation');

    const rnbSpec = buildSoundSpec(
      {
        topic: 'Forgiving someone you still cannot trust',
        moodId: 'heartbroken',
        tempoId: 'slow-jam',
        personaId: 'p36',
        voiceId: 'seasoned-tenor',
        target: 'ace',
        perspectiveId: 'second-person',
        storytellingIds: ['s20-confession'],
        techniqueIds: ['subtext-writing', 'refrain-evolution'],
      },
      99,
    );
    const rnbPrompts = buildLiveLlmPrompts('Forgiving someone', rnbSpec);
    expect(rnbPrompts.system).toContain('THE R&B SONGWRITING RULEBOOK');
    expect(rnbPrompts.system).toContain('Melody Leads, Lyrics Follow');
    expect(rnbPrompts.system).toContain('Prioritize Singable Phrasing Over Clever Writing');
    expect(rnbPrompts.system).toContain('Use Runs & Melisma With Intention');
    expect(rnbPrompts.system).toContain('FINAL HIT-MAKING CHECKLIST');
    expect(rnbPrompts.system).toContain('R&B REPLAY VALUE AUDIT');
    expect(rnbPrompts.system).not.toContain('MASTER RAP WRITING RULEBOOK');
    expect(rnbPrompts.system).toContain('THE HIT SONG RULE');
    expect(rnbPrompts.system).toContain('THE LIQUID LEGEND RULE');
    expect(rnbPrompts.user).toContain('Second person');
    expect(rnbPrompts.user).toContain('Subtext writing');
  });

  it('generates distinct Rap vs R&B ACE craft cues (no sung runs on pure rap; dynamic Chorus 1→2→Final release on R&B)', async () => {
    const rapVoice = VOICE_PRESETS.find((v) => v.category === 'rap')!;
    const rapRes = await generateSong(
      {
        topic: 'Too quiet — peace feels dangerous',
        moodId: 'dark',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p1',
        voiceId: rapVoice.id,
        target: 'ace',
        flowModeId: 'torrent',
      },
      { seed: 77 },
    );
    expect(rapRes.title).toBe('Too Quiet');
    expect(rapRes.report.lyrics.ok, JSON.stringify(rapRes.report.lyrics.issues)).toBe(true);
    expect(rapRes.lyrics).toContain('16–20 syllables per bar');
    expect(rapRes.lyrics).toContain('pray for peace');
    expect(rapRes.lyrics).not.toContain('gospel-inflected swell');
    expect(rapRes.lyrics).not.toContain('soft vocal runs');

    const rnbRes = await generateSong(
      {
        topic: 'Still making enough coffee for two',
        moodId: 'heartbroken',
        tempoId: 'slow-jam',
        personaId: 'p36',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      { seed: 77 },
    );
    expect(rnbRes.report.lyrics.ok, JSON.stringify(rnbRes.report.lyrics.issues)).toBe(true);
    expect(rnbRes.lyrics).toContain('Restrained emotional release');
    expect(rnbRes.lyrics).toContain('Fuller release');
    expect(rnbRes.lyrics).toContain('Peak emotional release');
  });

  it('defaults Perspective to second-person ("you") and keeps storytelling & techniques optional', () => {
    expect(DEFAULT_PERSPECTIVE_ID).toBe('second-person');
    const spec = buildSoundSpec(
      {
        topic: 'Late night call',
        moodId: DEFAULT_MOOD_ID,
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p36',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      7,
    );
    expect(spec.perspective?.id).toBe('second-person');
    expect(spec.storytellingStyles).toEqual([]);
    expect(spec.techniques).toEqual([]);

    const prompts = buildLiveLlmPrompts('Late night call', spec);
    expect(prompts.user).toContain('Second person');
    expect(prompts.user).not.toContain('Optional Advanced Craft Techniques');
    expect(prompts.user).not.toContain('Storytelling Style');
  });

  it('createGeminiProvider sends rulebook prompt via x-goog-api-key and parses lyrics cleanly', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = '';

    const mockFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
      capturedBody = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: 'STOP',
              content: {
                parts: [
                  {
                    text: '```\nTITLE: Porch Light\n\n[Verse 1: male]\nYou left the key inside the bowl\n\n[Chorus: male]\nDo you still feel it when the house goes cold?\n```',
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    const provider = createGeminiProvider({
      apiKey: 'AIzaTestSecretKey123',
      model: 'gemini-2.5-flash',
      fetchImpl: mockFetch,
    });

    const spec = buildSoundSpec(
      {
        topic: 'Porch light left on',
        moodId: DEFAULT_MOOD_ID,
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p36',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      5,
    );

    const draft = await provider.generate({
      topic: 'Porch light left on',
      spec,
      rng: { next: () => 0.5, int: (a) => a, pick: (arr) => arr[0], chance: () => false, shuffle: (a) => [...a] },
    });

    expect(capturedUrl).toContain('models/gemini-2.5-flash:generateContent');
    expect(capturedUrl).not.toContain('AIzaTestSecretKey123');
    expect(capturedHeaders['x-goog-api-key']).toBe('AIzaTestSecretKey123');
    expect(capturedBody).toContain('THE R&B SONGWRITING RULEBOOK');
    expect(capturedBody).toContain('GLOBAL COLD-OPEN RULE');
    expect(draft.title).toBe('Porch Light');
    expect(draft.lyrics).toContain('[Verse 1: male]');
    expect(draft.lyrics).not.toContain('```');

    const badProvider = createGeminiProvider({
      apiKey: 'AIzaBadKey',
      fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400 }),
    });
    await expect(
      badProvider.generate({
        topic: 'Test',
        spec,
        rng: { next: () => 0.5, int: (a) => a, pick: (arr) => arr[0], chance: () => false, shuffle: (a) => [...a] },
      }),
    ).rejects.toThrow(/Gemini rejected the API key/);
  });
});

describe('Four Creation Modes, Artist/Producer Independence & Global Cold-Open Rule', () => {
  it('Mode D (Neither selected): returns empty STYLE and empty LYRICS without inventing defaults', async () => {
    const res = await generateSong(
      {
        topic: 'Becoming a father',
        moodId: DEFAULT_MOOD_ID,
        tempoId: DEFAULT_TEMPO_ID,
        personaId: '',
        voiceId: '',
        target: 'ace',
      },
      { seed: 11 },
    );
    expect(res.spec.mode).toBe('none');
    expect(res.spec.persona).toBeUndefined();
    expect(res.spec.voice).toBeUndefined();
    expect(res.soundPrompt).toBe('');
    expect(res.lyrics).toBe('');
    expect(res.title).toBe('');
    expect(res.report.sound.ok).toBe(true);
    expect(res.report.lyrics.ok).toBe(true);
  });

  it('Mode B (Producer only — Instrumental): all 68 producers produce <= 1,000-char instrumental-only STYLE and ZERO vocal lyrics', async () => {
    for (const persona of PRODUCER_PERSONAS) {
      const res = await generateSong(
        {
          topic: 'Late night drive',
          moodId: 'reflective',
          tempoId: DEFAULT_TEMPO_ID,
          personaId: persona.id,
          voiceId: '',
          target: 'ace',
        },
        { seed: 33 },
      );
      expect(res.spec.mode).toBe('instrumental');
      expect(res.spec.voice).toBeUndefined();
      expect(res.lyrics, `${persona.name} instrumental must not generate vocal lyrics`).toBe('');
      expect(res.title).toBe('');
      expect(charCount(res.soundPrompt), `${persona.name} exceeded 1000 chars`).toBeLessThanOrEqual(
        LIMITS.ACE_STYLE_MAX_CHARS,
      );
      expect(res.soundPrompt).not.toContain(ACE_VOCAL_GUARDRAIL);
      expect(res.soundPrompt).toMatch(/instrumental-only/i);
      expect(res.soundPrompt).toMatch(/no singing/i);
      expect(findBannedNames(res.soundPrompt)).toEqual([]);
      expect(res.report.sound.ok, `${persona.name}: ${JSON.stringify(res.report.sound.issues)}`).toBe(true);
      expect(res.report.lyrics.ok, JSON.stringify(res.report.lyrics.issues)).toBe(true);
    }
  });

  it('Mode C (Artist only — A Cappella): all 32 artists produce <= 1,000-char unaccompanied STYLE and immediate Verse 1 lyrics with zero instruments', async () => {
    for (const voice of VOICE_PRESETS) {
      const res = await generateSong(
        {
          topic: 'Holding your newborn at 3 AM',
          moodId: 'reflective',
          tempoId: DEFAULT_TEMPO_ID,
          personaId: '',
          voiceId: voice.id,
          target: 'ace',
        },
        { seed: 44 },
      );
      expect(res.spec.mode).toBe('acappella');
      expect(res.spec.persona).toBeUndefined();
      expect(charCount(res.soundPrompt), `${voice.name} exceeded 1000 chars`).toBeLessThanOrEqual(
        LIMITS.ACE_STYLE_MAX_CHARS,
      );
      expect(res.soundPrompt).toMatch(/a cappella/i);
      expect(res.soundPrompt).not.toMatch(/\bProduction:/i);
      expect(res.soundPrompt).not.toMatch(/fingerpicked acoustic guitar|warm bassline|brushed percussion/i);
      expect(res.soundPrompt.endsWith(ACE_VOCAL_GUARDRAIL)).toBe(true);
      expect(findBannedNames(res.soundPrompt)).toEqual([]);
      expect(res.report.sound.ok, `${voice.name}: ${JSON.stringify(res.report.sound.issues)}`).toBe(true);

      // Immediate cold open at Verse 1, zero [Instrumental Intro], zero instrument cues
      expect(res.lyrics.startsWith(`[Verse 1: ${voice.gender}]`)).toBe(true);
      expect(res.lyrics).not.toContain('[Instrumental Intro]');
      expect(res.lyrics).not.toContain(`[Intro: ${voice.gender}]`);
      expect(res.report.lyrics.ok, `${voice.name}: ${JSON.stringify(res.report.lyrics.issues)}`).toBe(true);
    }
  });

  it('keeps Artist & Producer strictly independent across contrasting pairings (Hip-Hop Producer + R&B Singer, R&B Producer + Rapper, Salsa + Contralto)', async () => {
    // 1. Hip-Hop Producer (SOULSWITCH) + R&B Tenor Singer
    const hipHopPlusRnb = await generateSong(
      {
        topic: 'Forgiving someone you still cannot trust',
        moodId: 'heartbroken',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'soulswitch',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      { seed: 12 },
    );
    expect(hipHopPlusRnb.spec.mode).toBe('full');
    expect(hipHopPlusRnb.spec.isRap).toBe(false); // Singer stays a singer!
    expect(hipHopPlusRnb.soundPrompt).toMatch(/hip-hop|boom-bap|trap/i);
    expect(hipHopPlusRnb.soundPrompt).toMatch(/tenor|falsetto/i);
    expect(hipHopPlusRnb.lyrics).not.toMatch(/Lead rap delivery|Close-mic rap/i);
    expect(hipHopPlusRnb.lyrics).toMatch(/falsetto|chest voice/i);
    expect(hipHopPlusRnb.report.sound.ok).toBe(true);
    expect(hipHopPlusRnb.report.lyrics.ok).toBe(true);

    // 2. R&B Producer (REELZ p36) + Rapper
    const rapVoice = VOICE_PRESETS.find((v) => v.category === 'rap')!;
    const rnbPlusRap = await generateSong(
      {
        topic: 'Breaking family curses',
        moodId: 'reflective',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p36',
        voiceId: rapVoice.id,
        target: 'ace',
        flowModeId: 'rhythm-weaver',
      },
      { seed: 12 },
    );
    expect(rnbPlusRap.spec.mode).toBe('full');
    expect(rnbPlusRap.spec.isRap).toBe(true); // Rapper stays a rapper!
    expect(rnbPlusRap.soundPrompt).toMatch(/r&b|soul/i);
    expect(rnbPlusRap.soundPrompt).toMatch(/rap/i);
    expect(rnbPlusRap.lyrics).not.toMatch(/falsetto|gospel run|whistle/i);
    expect(rnbPlusRap.lyrics).toMatch(/rap/i);
    expect(rnbPlusRap.report.sound.ok).toBe(true);
    expect(rnbPlusRap.report.lyrics.ok).toBe(true);

    // 3. Cross-genre contrasting pair: Salsa Producer (p48) + Velvet-Gravel Contralto (voc-fem-3)
    const salsaPlusContralto = await generateSong(
      {
        topic: 'Midnight confession',
        moodId: 'romantic',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p48',
        voiceId: 'voc-fem-3',
        target: 'ace',
      },
      { seed: 12 },
    );
    expect(salsaPlusContralto.spec.isRap).toBe(false);
    expect(salsaPlusContralto.soundPrompt).toMatch(/salsa|timba/i);
    expect(salsaPlusContralto.soundPrompt).toMatch(/contralto/i);
    expect(salsaPlusContralto.soundPrompt).not.toMatch(/Slow 68 BPM smoky feel/i); // Artist never overwrites Salsa tempo/production!
    expect(salsaPlusContralto.spec.bpm).toBeGreaterThanOrEqual(168);
    expect(salsaPlusContralto.report.sound.ok).toBe(true);
    expect(salsaPlusContralto.report.lyrics.ok).toBe(true);
  });

  it('enforces the Global Cold-Open Rule: rejects forbidden [Intro: male] / ad-libs and strips them on repair, while allowing brief [Instrumental Intro] on Full Song only', () => {
    const forbiddenIntroDraft = [
      '[Intro: male]',
      '[Cold open: brief dark minor chords]',
      'Silencing the Voice Tonight',
      'Yeah, listen',
      'Silencing the Voice Tonight',
      '[Verse 1: male]',
      'Two in the morning and the hallway light is still on',
      'I still reach for my phone before I remember the silence',
      '[Pre-Chorus: male]',
      'Maybe the quiet was never a trap',
      '[Chorus: male]',
      'Do you still hear it when the house goes quiet?',
      '[Verse 2: male]',
      'Your jacket sits on the chair by the door',
      '[Pre-Chorus: male]',
      'Maybe the quiet was never a trap',
      '[Chorus: male]',
      'Do you still hear it when the house goes quiet?',
      '[Bridge: male]',
      'When did holding on cost more than letting go?',
      '[Final Chorus: male]',
      'I finally breathe when the house goes quiet',
      '[Outro: male]',
      'Leave the porch light burning low',
    ].join('\n');

    const badCheck = validateAceLyrics(forbiddenIntroDraft, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'full');
    expect(badCheck.ok).toBe(false);
    expect(badCheck.issues.some((i) => i.code === 'FORBIDDEN_VOCAL_INTRO')).toBe(true);

    const repaired = repairAceLyrics(forbiddenIntroDraft, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'full');
    expect(repaired.startsWith('[Verse 1: male]')).toBe(true);
    expect(repaired).not.toContain('Yeah, listen');
    expect(repaired).not.toContain('Silencing the Voice Tonight');
    expect(validateAceLyrics(repaired, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'full').ok).toBe(true);

    // Optional Option B: [Instrumental Intro] allowed for Full Song, forbidden for A Cappella
    const optionBDraft = [
      '[Instrumental Intro]',
      '[Dark piano chords, 2 bars, no vocals]',
      '[Verse 1: male]',
      'Two in the morning and the hallway light is still on',
      '[Pre-Chorus: male]',
      'Maybe the quiet was never a trap',
      '[Chorus: male]',
      'Do you still hear it when the house goes quiet?',
      '[Verse 2: male]',
      'Your jacket sits on the chair by the door',
      '[Pre-Chorus: male]',
      'Maybe the quiet was never a trap',
      '[Chorus: male]',
      'Do you still hear it when the house goes quiet?',
      '[Bridge: male]',
      'When did holding on cost more than letting go?',
      '[Final Chorus: male]',
      'I finally breathe when the house goes quiet',
      '[Outro: male]',
      'Leave the porch light burning low',
    ].join('\n');

    expect(validateAceLyrics(optionBDraft, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'full').ok).toBe(true);
    const acapCheck = validateAceLyrics(optionBDraft, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'acappella');
    expect(acapCheck.ok).toBe(false);
    expect(acapCheck.issues.some((i) => i.code === 'INSTRUMENTAL_IN_ACAPPELLA')).toBe(true);

    // Repair strips [Instrumental Intro] for A Cappella
    const acapRepaired = repairAceLyrics(optionBDraft, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'acappella');
    expect(acapRepaired.startsWith('[Verse 1: male]')).toBe(true);
    expect(acapRepaired).not.toContain('[Instrumental Intro]');
    expect(validateAceLyrics(acapRepaired, 'male', LIMITS.ACE_LYRICS_MAX_CHARS, 'acappella').ok).toBe(true);
  });

  it('does not mechanically stuff long topic prompts into unrelated lyric lines', async () => {
    const res = await generateSong(
      {
        topic: 'Silencing the voice in your head that sounds like every person who underestimated you',
        moodId: 'dark',
        tempoId: DEFAULT_TEMPO_ID,
        personaId: 'p1',
        voiceId: 'seasoned-tenor',
        target: 'ace',
      },
      { seed: 2026 },
    );
    expect(res.lyrics).not.toContain('Silencing the Voice Tonight');
    expect(res.lyrics).not.toContain('Yeah, listen');
    expect(res.lyrics.startsWith('[Verse 1: male]')).toBe(true);
    expect(res.report.lyrics.ok).toBe(true);
  });
});
