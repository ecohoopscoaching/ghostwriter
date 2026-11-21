import { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CraftAuditPanel } from '@/components/CraftAuditPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { Picker, type PickerOption } from '@/components/Picker';
import { TopicPicker } from '@/components/TopicPicker';
import { Button } from '@/components/ui/button';
import {
  ADVANCED_TECHNIQUES,
  DEFAULT_FLOW_MODE_ID,
  DEFAULT_PERSPECTIVE_ID,
  PERSPECTIVES,
  PERSPECTIVE_GROUPS,
  RAP_FLOW_MODES,
  STORYTELLING_GROUPS,
  STORYTELLING_STYLES,
  TECHNIQUE_GROUPS,
  getFlowMode,
  resolvePerspective,
  resolveStorytellingStyles,
  resolveTechniques,
} from '@/data/craftLibrary';
import { DEFAULT_MOOD_ID, MOODS, getMood } from '@/data/moods';
import {
  DEFAULT_PERSONA_ID,
  PERSONA_GROUPS,
  PRODUCER_PERSONAS,
  getPersona,
  personaLabel,
} from '@/data/producerPersonas';
import {
  CUSTOM_TEMPO_PREFIX,
  DEFAULT_TEMPO_ID,
  TEMPOS,
  resolveTempo,
} from '@/data/tempos';
import {
  DEFAULT_VOICE_ID,
  VOICE_GROUPS,
  VOICE_PRESETS,
  getVoice,
} from '@/data/voicePresets';
import {
  GEMINI_MODELS,
  createGeminiProvider,
  loadGeminiSettings,
  saveGeminiSettings,
  type GeminiModelId,
} from '@/lib/engine/geminiProvider';
import { generateSong } from '@/lib/engine/generate';
import {
  DEFAULT_TARGET,
  TARGETS,
  formatCount,
  type OutputTarget,
} from '@/lib/engine/limits';
import { validateAceLyrics, validateLyrics } from '@/lib/engine/lyrics';
import { buildLiveLlmPrompts } from '@/lib/engine/providers';
import { validateAceStyle, validateSoundPrompt } from '@/lib/engine/soundPrompt';
import type { GenerationResult } from '@/lib/engine/types';
import { cn } from '@/lib/utils';

const RANDOM_PRODUCER_ID = '__random__';

export function App() {
  const initialGemini = useMemo(() => loadGeminiSettings(), []);

  const [target, setTarget] = useState<OutputTarget>(DEFAULT_TARGET);
  const [topic, setTopic] = useState('');
  const [moodId, setMoodId] = useState(DEFAULT_MOOD_ID);
  const [tempoId, setTempoId] = useState(DEFAULT_TEMPO_ID);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [personaId, setPersonaId] = useState(DEFAULT_PERSONA_ID);
  const [perspectiveId, setPerspectiveId] = useState(DEFAULT_PERSPECTIVE_ID);
  const [storytellingIds, setStorytellingIds] = useState<string[]>([]);
  const [techniqueIds, setTechniqueIds] = useState<string[]>([]);
  const [flowModeId, setFlowModeId] = useState(DEFAULT_FLOW_MODE_ID);

  // Calm progressive disclosure: optional settings & Gemini key stay tucked away
  const [showOptions, setShowOptions] = useState(false);
  const [showGeminiPanel, setShowGeminiPanel] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(initialGemini.apiKey);
  const [geminiKeyDraft, setGeminiKeyDraft] = useState(initialGemini.apiKey);
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>(initialGemini.model);
  const [showKeyText, setShowKeyText] = useState(false);

  const [producerError, setProducerError] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [soundText, setSoundText] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  const activeTarget = TARGETS[target];
  const hasGeminiKey = geminiApiKey.trim().length > 0;

  const selectedMood = getMood(moodId);
  const selectedTempo = resolveTempo(tempoId);
  const selectedVoice = getVoice(voiceId);
  const selectedPersona = personaId ? getPersona(personaId) : null;
  const selectedPerspective = resolvePerspective(perspectiveId);
  const selectedStorytelling = resolveStorytellingStyles(storytellingIds);
  const selectedTechniques = resolveTechniques(techniqueIds);
  const selectedFlowMode = getFlowMode(flowModeId);
  const isRapSelection =
    selectedVoice.category === 'rap' ||
    (selectedPersona
      ? /\b(rap|boom-bap|trap)\b/i.test(selectedPersona.sound.dna) &&
        !/\br&b\b/i.test(selectedPersona.sound.dna)
      : false);

  const customOptionCount = useMemo(() => {
    let count = 0;
    if (moodId !== DEFAULT_MOOD_ID) count++;
    if (tempoId !== DEFAULT_TEMPO_ID) count++;
    if (perspectiveId !== DEFAULT_PERSPECTIVE_ID) count++;
    if (storytellingIds.length > 0) count++;
    if (techniqueIds.length > 0) count++;
    if (isRapSelection && flowModeId !== DEFAULT_FLOW_MODE_ID) count++;
    return count;
  }, [moodId, tempoId, perspectiveId, storytellingIds.length, techniqueIds.length, isRapSelection, flowModeId]);

  const voiceOptions: PickerOption[] = useMemo(
    () =>
      VOICE_PRESETS.map((v) => ({
        id: v.id,
        label: v.name,
        sublabel: v.note,
        searchText: `${v.code ?? ''} ${v.aliases ?? ''} ${v.category} ${v.description}`,
        group: v.category,
      })),
    [],
  );

  const personaGroups = useMemo(
    () => [
      { id: 'quick', label: 'Quick Pick' },
      ...PERSONA_GROUPS.map((g) => ({ id: g.id, label: g.label })),
    ],
    [],
  );

  const personaOptions: PickerOption[] = useMemo(
    () => [
      {
        id: RANDOM_PRODUCER_ID,
        label: 'Surprise Me (Random Producer)',
        sublabel: 'Pick a fresh producer from all 68 personas',
        searchText: 'random surprise shuffle any',
        group: 'quick',
      },
      ...PRODUCER_PERSONAS.map((p) => ({
        id: p.id,
        label: personaLabel(p),
        sublabel: p.tagline ?? p.essence,
        searchText: `${p.essence} ${p.foundation ?? ''}`,
        group: p.group,
      })),
    ],
    [],
  );

  const moodOptions: PickerOption[] = useMemo(
    () =>
      MOODS.map((m) => ({
        id: m.id,
        label: m.label,
        sublabel: m.descriptors.join(', '),
      })),
    [],
  );

  const tempoOptions: PickerOption[] = useMemo(
    () =>
      TEMPOS.map((t) => ({
        id: t.id,
        label: t.label,
        sublabel: t.note,
      })),
    [],
  );

  const perspectiveGroups = useMemo(
    () => [{ id: 'quick', label: 'Auto' }, ...PERSPECTIVE_GROUPS],
    [],
  );

  const perspectiveOptions: PickerOption[] = useMemo(
    () => [
      {
        id: 'auto',
        label: 'Auto (Let Song Choose)',
        sublabel: 'Pick whichever angle hits hardest for the topic',
        group: 'quick',
      },
      ...PERSPECTIVES.map((p) => ({
        id: p.id,
        label: p.label,
        sublabel: p.example ? `${p.description} “${p.example}”` : p.description,
        searchText: `${p.description} ${p.example ?? ''}`,
        group: p.group,
      })),
    ],
    [],
  );

  const storytellingOptions: PickerOption[] = useMemo(
    () =>
      STORYTELLING_STYLES.map((s) => ({
        id: s.id,
        label: `${s.number}. ${s.label}`,
        sublabel: s.description,
        searchText: `${s.number} ${s.description}`,
        group: s.group,
      })),
    [],
  );

  const techniqueOptions: PickerOption[] = useMemo(
    () =>
      ADVANCED_TECHNIQUES.map((t) => ({
        id: t.id,
        label: t.label,
        sublabel: `${t.description} (${t.example})`,
        searchText: `${t.description} ${t.example}`,
        group: t.priority ? 'priority' : 'craft',
      })),
    [],
  );

  const flowModeOptions: PickerOption[] = useMemo(
    () =>
      RAP_FLOW_MODES.map((f) => ({
        id: f.id,
        label: f.label,
        sublabel: f.tagline,
      })),
    [],
  );

  // Always validate against the active target so switching ACE <-> Flow updates caps live
  const lyricsValidation = useMemo(() => {
    const g = result?.spec.gender ?? selectedVoice.gender;
    return target === 'ace'
      ? validateAceLyrics(lyricsText, g, TARGETS.ace.lyricsMax)
      : validateLyrics(lyricsText, TARGETS.flow.lyricsMax);
  }, [lyricsText, result, target, selectedVoice.gender]);

  const soundValidation = useMemo(() => {
    return target === 'ace'
      ? validateAceStyle(soundText, TARGETS.ace.styleMax)
      : validateSoundPrompt(soundText, TARGETS.flow.styleMax);
  }, [soundText, target]);

  const handleSelectPersona = (id: string) => {
    setProducerError(false);
    if (id === RANDOM_PRODUCER_ID) {
      const random = PRODUCER_PERSONAS[Math.floor(Math.random() * PRODUCER_PERSONAS.length)];
      setPersonaId(random.id);
      return;
    }
    setPersonaId(id);
  };

  const handleToggleStorytelling = (id: string) => {
    setStorytellingIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleToggleTechnique = (id: string) => {
    setTechniqueIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleResetOptions = () => {
    setMoodId(DEFAULT_MOOD_ID);
    setTempoId(DEFAULT_TEMPO_ID);
    setPerspectiveId(DEFAULT_PERSPECTIVE_ID);
    setStorytellingIds([]);
    setTechniqueIds([]);
    setFlowModeId(DEFAULT_FLOW_MODE_ID);
  };

  const handleSaveGemini = () => {
    const trimmed = geminiKeyDraft.trim();
    setGeminiApiKey(trimmed);
    setGeminiKeyDraft(trimmed);
    saveGeminiSettings({ apiKey: trimmed, model: geminiModel });
    setGenerateError('');
    setShowGeminiPanel(false);
  };

  const handleClearGemini = () => {
    setGeminiApiKey('');
    setGeminiKeyDraft('');
    saveGeminiSettings({ apiKey: '', model: geminiModel });
    setGenerateError('');
  };

  const handleSelectGeminiModel = (nextModel: GeminiModelId) => {
    setGeminiModel(nextModel);
    saveGeminiSettings({ apiKey: geminiApiKey, model: nextModel });
  };

  const handleCopyLlmPrompt = async () => {
    if (!result) return;
    const { system, user } = buildLiveLlmPrompts(topic || result.title, result.spec);
    const combined = `SYSTEM:\n${system}\n\nUSER:\n${user}`;
    try {
      await navigator.clipboard.writeText(combined);
    } catch {
      const el = document.createElement('textarea');
      el.value = combined;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setPromptCopied(true);
    window.setTimeout(() => setPromptCopied(false), 1800);
  };

  const handleGenerate = async () => {
    if (!personaId) {
      setProducerError(true);
      return;
    }
    setProducerError(false);
    setGenerateError('');
    setGenerating(true);
    try {
      const provider = hasGeminiKey
        ? createGeminiProvider({ apiKey: geminiApiKey, model: geminiModel })
        : undefined;

      const next = await generateSong(
        {
          topic,
          moodId,
          tempoId,
          personaId,
          voiceId,
          target,
          perspectiveId,
          storytellingIds,
          techniqueIds,
          flowModeId,
        },
        { provider },
      );
      setResult(next);
      setLyricsText(next.lyrics);
      setSoundText(next.soundPrompt);
      window.requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Something went wrong while generating lyrics.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const activeGeminiLabel =
    GEMINI_MODELS.find((m) => m.id === geminiModel)?.label ?? 'Gemini';

  const lyricsMeta = useMemo(() => {
    if (!result) {
      return `${formatCount(activeTarget.lyricsMax)} char max`;
    }
    const parts = [personaLabel(result.spec.persona), result.spec.mood.label];
    if (target === 'ace') {
      parts.push(`${result.spec.gender} vocal tags`);
    }
    return parts.join(' · ');
  }, [result, target, activeTarget.lyricsMax]);

  const soundMeta = useMemo(() => {
    if (!result) {
      return `${formatCount(activeTarget.styleMax)} char max`;
    }
    return `${result.spec.bpm}${result.spec.switchBpm ? ` → ${result.spec.switchBpm}` : ''} BPM · ${result.spec.key} · ${result.spec.voice.name}`;
  }, [result, activeTarget.styleMax]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        {/* Header — calm, single row */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-12">
          <h1 className="text-4xl font-black uppercase tracking-[-0.04em] text-white sm:text-5xl">
            GHOSTWRITER
          </h1>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target switch */}
            <div
              role="radiogroup"
              aria-label="Output target"
              className="inline-flex border border-[#262626] bg-[#0a0a0a] p-1"
            >
              {(['ace', 'flow'] as OutputTarget[]).map((id) => {
                const active = target === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTarget(id)}
                    className={cn(
                      'px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer',
                      active
                        ? 'bg-white text-black'
                        : 'text-[#a1a1aa] hover:text-white',
                    )}
                  >
                    {TARGETS[id].name}
                  </button>
                );
              })}
            </div>

            {/* Gemini API key toggle */}
            <button
              type="button"
              onClick={() => {
                setGeminiKeyDraft(geminiApiKey);
                setShowGeminiPanel((v) => !v);
              }}
              aria-expanded={showGeminiPanel}
              className={cn(
                'inline-flex items-center gap-2 border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer',
                hasGeminiKey
                  ? 'border-[#3f3f46] bg-[#0a0a0a] text-white hover:border-white'
                  : 'border-[#262626] bg-[#0a0a0a] text-[#a1a1aa] hover:border-[#c0c0c0] hover:text-white',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  hasGeminiKey ? 'bg-white' : 'bg-[#52525b]',
                )}
              />
              <KeyRound className="h-3.5 w-3.5" />
              {hasGeminiKey ? 'Gemini On' : 'Gemini Key'}
            </button>
          </div>
        </header>

        {/* Collapsible Gemini API settings drawer */}
        {showGeminiPanel && (
          <section
            aria-label="Gemini API settings"
            className="mb-10 border border-[#262626] bg-[#0a0a0a] p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">
                Gemini Brain
              </p>
              <button
                type="button"
                onClick={() => setShowGeminiPanel(false)}
                aria-label="Close Gemini settings"
                className="text-[#71717a] transition-colors hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="gemini-api-key"
                  className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#a1a1aa]"
                >
                  API Key
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="gemini-api-key"
                      type={showKeyText ? 'text' : 'password'}
                      value={geminiKeyDraft}
                      onChange={(e) => setGeminiKeyDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveGemini();
                      }}
                      placeholder="Paste your Gemini API key (AIza…)"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full border border-[#262626] bg-black px-3.5 py-2.5 pr-10 font-mono text-xs text-white placeholder:text-[#52525b] outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyText((v) => !v)}
                      aria-label={showKeyText ? 'Hide API key' : 'Show API key'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white cursor-pointer"
                    >
                      {showKeyText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="button" variant="primary" size="md" onClick={handleSaveGemini}>
                    Save
                  </Button>
                  {hasGeminiKey && (
                    <Button type="button" variant="silver" size="md" onClick={handleClearGemini}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="inline-flex border border-[#262626] bg-black p-1">
                  {GEMINI_MODELS.map((m) => {
                    const active = geminiModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectGeminiModel(m.id)}
                        className={cn(
                          'px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer',
                          active
                            ? 'bg-white text-black'
                            : 'text-[#a1a1aa] hover:text-white',
                        )}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                <p className="font-mono text-[11px] text-[#71717a]">
                  Stored locally in your browser only.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Step 1: Topic */}
        <section className="pb-10">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="topic-input"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]"
            >
              Topic
            </label>
            <TopicPicker onSelectTopic={setTopic} />
          </div>
          <textarea
            id="topic-input"
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            placeholder="Pick a specific topic above or describe your own scene…"
            className="mt-3 block w-full resize-none border-b border-[#3f3f46] bg-transparent pb-3 text-xl font-extrabold leading-snug tracking-tight text-white placeholder:text-[#52525b] outline-none transition-colors focus:border-white sm:text-2xl"
          />
        </section>

        {/* Step 2: Artist & Producer (only 2 core pickers visible) */}
        <section className="grid grid-cols-1 gap-5 pb-8 sm:grid-cols-2">
          <Picker
            label="Artist (vocals)"
            value={voiceId}
            displayValue={selectedVoice.name}
            displaySublabel={selectedVoice.note}
            options={voiceOptions}
            groups={VOICE_GROUPS}
            searchable
            searchPlaceholder="Search vocalists…"
            prominent
            onSelect={setVoiceId}
          />
          <div>
            <Picker
              label="Producer (sound)"
              value={personaId}
              displayValue={selectedPersona ? personaLabel(selectedPersona) : 'Select a producer…'}
              displaySublabel={
                selectedPersona
                  ? (selectedPersona.tagline ?? selectedPersona.sound.dna)
                  : 'Sets genre & production'
              }
              options={personaOptions}
              groups={personaGroups}
              searchPlaceholder="Search producers…"
              prominent
              isPlaceholder={!selectedPersona}
              highlightError={producerError}
              onSelect={handleSelectPersona}
            />
            {producerError && (
              <p className="mt-2 font-mono text-xs text-white">
                Pick a producer first.
              </p>
            )}
          </div>
        </section>

        {/* Collapsible More Options (collapsed by default for ADHD focus) */}
        <section className="pb-10">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowOptions((v) => !v)}
              aria-expanded={showOptions}
              className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#a1a1aa] transition-colors hover:text-white cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>More options</span>
              {customOptionCount > 0 && (
                <span className="border border-[#3f3f46] px-1.5 py-0.5 text-[10px] text-white">
                  {customOptionCount}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  showOptions && 'rotate-180',
                )}
              />
            </button>

            {showOptions && customOptionCount > 0 && (
              <button
                type="button"
                onClick={handleResetOptions}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#71717a] transition-colors hover:text-white cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {showOptions && (
            <div className="mt-6 grid grid-cols-1 gap-7 border border-[#262626] bg-[#0a0a0a] p-6 sm:grid-cols-2">
              <Picker
                label="Mood"
                value={moodId}
                displayValue={selectedMood.label}
                options={moodOptions}
                searchable={false}
                onSelect={setMoodId}
              />
              <Picker
                label="Tempo"
                value={tempoId}
                displayValue={selectedTempo.label}
                options={tempoOptions}
                searchable
                searchPlaceholder="Pick tempo or type BPM…"
                allowCustom
                customPrefix={CUSTOM_TEMPO_PREFIX}
                customActionLabel={(q) => {
                  const n = Number.parseInt(q.replace(/[^0-9]/g, ''), 10);
                  return Number.isFinite(n) && n >= 40 && n <= 220
                    ? `Set exact tempo: ${n} BPM`
                    : 'Enter a BPM between 40 and 220';
                }}
                onSelect={setTempoId}
              />
              <Picker
                label="Perspective"
                value={perspectiveId}
                displayValue={selectedPerspective ? selectedPerspective.label : 'Auto (Let Song Choose)'}
                options={perspectiveOptions}
                groups={perspectiveGroups}
                searchable
                searchPlaceholder="Search perspectives…"
                onSelect={setPerspectiveId}
              />
              {isRapSelection && (
                <Picker
                  label="Rap Flow"
                  value={flowModeId}
                  displayValue={selectedFlowMode.label}
                  options={flowModeOptions}
                  searchable={false}
                  onSelect={setFlowModeId}
                />
              )}
              <Picker
                label="Storytelling (optional)"
                values={storytellingIds}
                maxSelect={3}
                displayValue={
                  selectedStorytelling.length
                    ? selectedStorytelling.map((s) => s.label).join(' + ')
                    : 'None'
                }
                options={storytellingOptions}
                groups={STORYTELLING_GROUPS}
                searchable
                searchPlaceholder="Search storytelling styles…"
                onToggle={handleToggleStorytelling}
              />
              <Picker
                label="Techniques (optional)"
                values={techniqueIds}
                maxSelect={3}
                displayValue={
                  selectedTechniques.length
                    ? selectedTechniques.map((t) => t.label).join(' · ')
                    : 'None'
                }
                options={techniqueOptions}
                groups={TECHNIQUE_GROUPS}
                searchable
                searchPlaceholder="Search techniques…"
                onToggle={handleToggleTechnique}
              />
            </div>
          )}
        </section>

        {/* Step 3: One Big GENERATE Button */}
        <section className="pb-12">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full tracking-[0.22em]"
          >
            {generating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                {hasGeminiKey ? `Writing with ${activeGeminiLabel}` : 'Generating'}
              </>
            ) : (
              'Generate'
            )}
          </Button>

          {generateError && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-[#3f3f46] bg-[#0a0a0a] px-4 py-3 font-mono text-xs text-white">
              <span>{generateError}</span>
              <button
                type="button"
                onClick={() => setShowGeminiPanel(true)}
                className="underline underline-offset-4 text-[#c0c0c0] hover:text-white cursor-pointer"
              >
                Check Gemini Key
              </button>
            </div>
          )}
        </section>

        {/* Outputs */}
        <div ref={outputRef} className="space-y-12">
          {result && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#71717a]">
                {result.report.engine} · {activeTarget.name}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLlmPrompt}
                  className="inline-flex items-center gap-1.5 border border-[#262626] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#a1a1aa] transition-colors hover:border-white hover:text-white cursor-pointer"
                >
                  {promptCopied ? (
                    <>
                      <Check className="h-3 w-3 text-white" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy Prompt
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAudit((v) => !v)}
                  aria-expanded={showAudit}
                  className={cn(
                    'inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer',
                    showAudit
                      ? 'border-white bg-white text-black'
                      : 'border-[#262626] text-[#a1a1aa] hover:border-white hover:text-white',
                  )}
                >
                  <ClipboardCheck className="h-3 w-3" />
                  Audit
                </button>
              </div>
            </div>
          )}

          {result && showAudit && (
            <CraftAuditPanel
              lyrics={lyricsText}
              title={result.title}
              isRap={result.spec.isRap}
            />
          )}

          <OutputPanel
            index="01"
            heading="LYRICS"
            title={result?.title}
            meta={lyricsMeta}
            value={lyricsText}
            placeholder={
              target === 'ace'
                ? `[Intro: ${selectedVoice.gender}]\nLyrics appear here…`
                : '[Intro]\nLyrics appear here…'
            }
            onChange={setLyricsText}
            validation={lyricsValidation}
            copyLabel="Copy Lyrics"
            minRows={result ? (target === 'ace' ? 24 : 18) : 12}
          />

          <OutputPanel
            index="02"
            heading={activeTarget.styleHeading}
            meta={soundMeta}
            value={soundText}
            placeholder={`Matching ${activeTarget.styleHeading.toLowerCase()} appears here…`}
            onChange={setSoundText}
            validation={soundValidation}
            copyLabel={activeTarget.styleCopyLabel}
            minRows={6}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
