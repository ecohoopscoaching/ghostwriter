import { useMemo, useRef, useState } from 'react';
import { Check, ClipboardCheck, Copy, RefreshCw } from 'lucide-react';
import { CraftAuditPanel } from '@/components/CraftAuditPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { Picker, type PickerOption } from '@/components/Picker';
import { Button } from '@/components/ui/button';
import {
  ADVANCED_TECHNIQUES,
  DEFAULT_FLOW_MODE_ID,
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
  SONGWRITING_FORMULA,
  TOPICS,
  TOPIC_CATEGORIES,
} from '@/data/topics';
import {
  DEFAULT_VOICE_ID,
  VOICE_GROUPS,
  VOICE_PRESETS,
  getVoice,
} from '@/data/voicePresets';
import { generateSong } from '@/lib/engine/generate';
import { buildLiveLlmPrompts } from '@/lib/engine/providers';
import {
  DEFAULT_TARGET,
  TARGETS,
  formatCount,
  type OutputTarget,
} from '@/lib/engine/limits';
import { validateAceLyrics, validateLyrics } from '@/lib/engine/lyrics';
import { validateAceStyle, validateSoundPrompt } from '@/lib/engine/soundPrompt';
import type { GenerationResult } from '@/lib/engine/types';
import { cn } from '@/lib/utils';

const RANDOM_PRODUCER_ID = '__random__';

export function App() {
  const [target, setTarget] = useState<OutputTarget>(DEFAULT_TARGET);
  const [topic, setTopic] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [moodId, setMoodId] = useState(DEFAULT_MOOD_ID);
  const [tempoId, setTempoId] = useState(DEFAULT_TEMPO_ID);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [personaId, setPersonaId] = useState(DEFAULT_PERSONA_ID);
  const [perspectiveId, setPerspectiveId] = useState('auto');
  const [storytellingIds, setStorytellingIds] = useState<string[]>([]);
  const [techniqueIds, setTechniqueIds] = useState<string[]>([]);
  const [flowModeId, setFlowModeId] = useState(DEFAULT_FLOW_MODE_ID);
  const [producerError, setProducerError] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [soundText, setSoundText] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  const activeTarget = TARGETS[target];
  const outputTarget = TARGETS[result?.spec.target ?? target];

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

  const topicOptions: PickerOption[] = useMemo(
    () =>
      TOPICS.map((t) => ({
        id: t.id,
        label: t.label,
        group: t.category,
      })),
    [],
  );

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
    () => [{ id: 'quick', label: 'Default' }, ...PERSPECTIVE_GROUPS],
    [],
  );

  const perspectiveOptions: PickerOption[] = useMemo(
    () => [
      {
        id: 'auto',
        label: 'Auto (Best Fit)',
        sublabel: 'Let the song choose the strongest angle (least obvious person in the room)',
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

  const lyricsValidation = useMemo(() => {
    const t = result?.spec.target ?? target;
    const g = result?.spec.gender ?? selectedVoice.gender;
    return t === 'ace'
      ? validateAceLyrics(lyricsText, g, TARGETS.ace.lyricsMax)
      : validateLyrics(lyricsText, TARGETS.flow.lyricsMax);
  }, [lyricsText, result, target, selectedVoice.gender]);

  const soundValidation = useMemo(() => {
    const t = result?.spec.target ?? target;
    return t === 'ace'
      ? validateAceStyle(soundText, TARGETS.ace.styleMax)
      : validateSoundPrompt(soundText, TARGETS.flow.styleMax);
  }, [soundText, result, target]);

  const handleSelectTopic = (id: string) => {
    const match = TOPICS.find((t) => t.id === id);
    if (!match) return;
    setSelectedTopicId(id);
    setTopic(match.label);
  };

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
    setGenerating(true);
    try {
      const next = await generateSong({
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
      });
      setResult(next);
      setLyricsText(next.lyrics);
      setSoundText(next.soundPrompt);
      window.requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10 sm:py-20">
        {/* Header — minimal, bold statement with ACE primary target */}
        <header className="flex flex-wrap items-end justify-between gap-6 pb-14 sm:pb-16">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-[#c0c0c0]">
              {activeTarget.shortName}
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.04em] text-white sm:text-7xl">
              GHOSTWRITER
            </h1>
          </div>

          {/* Clean target switch: ACE Music primary, Flow / Mozart secondary */}
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
                    'px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer',
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
        </header>

        {/* Stage 1: Topic + Topic Bible Dropdown */}
        <section className="pb-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="topic-input"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]"
            >
              Topic
            </label>
            <Picker
              label="Topics"
              value={selectedTopicId}
              displayValue="Topics (92)"
              options={topicOptions}
              groups={TOPIC_CATEGORIES}
              searchable
              searchPlaceholder="Search 92 topics across 10 categories…"
              compact
              onSelect={handleSelectTopic}
            />
          </div>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setSelectedTopicId('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            placeholder="Pick a topic above or write your own scene…"
            className="mt-3 w-full border-b border-[#3f3f46] bg-transparent pb-4 text-2xl font-extrabold tracking-tight text-white placeholder:text-[#52525b] outline-none transition-colors focus:border-white sm:text-4xl"
          />
          <p className="mt-2.5 font-mono text-[11px] tracking-wide text-[#71717a]">
            {SONGWRITING_FORMULA}
          </p>
        </section>

        {/* Stage 2: Two Persona Selectors — Artist (vocals) & Producer (production) */}
        <section className="grid grid-cols-1 gap-5 pb-12 sm:grid-cols-2">
          <Picker
            label="Artist (vocals)"
            value={voiceId}
            displayValue={selectedVoice.name}
            displaySublabel={selectedVoice.note}
            options={voiceOptions}
            groups={VOICE_GROUPS}
            searchable
            searchPlaceholder="Search 32 vocalists by style, voice, or city…"
            prominent
            onSelect={setVoiceId}
          />
          <div>
            <Picker
              label="Producer (production)"
              value={personaId}
              displayValue={selectedPersona ? personaLabel(selectedPersona) : 'Select a producer…'}
              displaySublabel={
                selectedPersona
                  ? (selectedPersona.tagline ?? selectedPersona.sound.dna)
                  : 'Choose from 68 producer personas (sets genre & sound)'
              }
              options={personaOptions}
              groups={personaGroups}
              searchPlaceholder="Search 68 producer personas…"
              prominent
              isPlaceholder={!selectedPersona}
              highlightError={producerError}
              onSelect={handleSelectPersona}
            />
            {producerError && (
              <p className="mt-2 font-mono text-xs text-white">
                Select a Producer (production) before generating.
              </p>
            )}
          </div>
        </section>

        {/* Stage 3: Mood & Tempo */}
        <section className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2">
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
            searchPlaceholder="Pick tempo or type BPM (e.g. 84)…"
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
        </section>

        {/* Stage 3.5: Craft & Narrative (39 Perspectives, 80 Storytelling Styles, 30 Techniques, Flow Mode) */}
        <section className="grid grid-cols-1 gap-8 pb-14 sm:grid-cols-2">
          <Picker
            label="Perspective (39)"
            value={perspectiveId}
            displayValue={selectedPerspective ? selectedPerspective.label : 'Auto (Best Fit)'}
            displaySublabel={
              selectedPerspective
                ? selectedPerspective.description
                : 'Choose who tells the story (optional)'
            }
            options={perspectiveOptions}
            groups={perspectiveGroups}
            searchable
            searchPlaceholder="Search 39 perspectives (witness, child, object…)"
            onSelect={setPerspectiveId}
          />
          <Picker
            label="Storytelling Styles (80)"
            values={storytellingIds}
            maxSelect={3}
            displayValue={
              selectedStorytelling.length
                ? selectedStorytelling.map((s) => s.label).join(' + ')
                : 'Any / Combine up to 3'
            }
            displaySublabel={
              selectedStorytelling.length
                ? `${selectedStorytelling.length} selected · click to toggle`
                : 'Timeline, twist, confession, montage, documentary…'
            }
            options={storytellingOptions}
            groups={STORYTELLING_GROUPS}
            searchable
            searchPlaceholder="Search 80 storytelling styles (e.g. Reverse, Full-Circle…)"
            onToggle={handleToggleStorytelling}
          />
          <Picker
            label="Advanced Techniques (30)"
            values={techniqueIds}
            maxSelect={3}
            displayValue={
              selectedTechniques.length
                ? selectedTechniques.map((t) => t.label).join(' · ')
                : 'Core 8 Weapons (Auto)'
            }
            displaySublabel={
              selectedTechniques.length
                ? `${selectedTechniques.length} active + Liquid Legend Rule`
                : 'Motif mutation, object correlative, subtext, callbacks…'
            }
            options={techniqueOptions}
            groups={TECHNIQUE_GROUPS}
            searchable
            searchPlaceholder="Search 30 craft techniques…"
            onToggle={handleToggleTechnique}
          />
          {isRapSelection ? (
            <Picker
              label="Rap Flow Mode"
              value={flowModeId}
              displayValue={selectedFlowMode.label}
              displaySublabel={selectedFlowMode.tagline}
              options={flowModeOptions}
              searchable={false}
              onSelect={setFlowModeId}
            />
          ) : (
            <div className="flex flex-col justify-between border-b border-[#262626] pb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
                Writing Rulebook
              </span>
              <span className="mt-2 text-lg font-black tracking-tight text-white sm:text-xl">
                R&amp;B Rulebook (Auto)
              </span>
              <span className="mt-1.5 line-clamp-1 text-xs text-[#71717a]">
                Hook-first · open vowels · pocket · Hit Song &amp; Liquid Legend Rules
              </span>
            </div>
          )}
        </section>

        {/* Stage 4: One Big GENERATE Button */}
        <section className="pb-14">
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
                Generating
              </>
            ) : (
              'Generate'
            )}
          </Button>
          <p className="mt-3 font-mono text-[11px] tracking-wider text-[#71717a]">
            {activeTarget.shortName} · Lyrics max {formatCount(activeTarget.lyricsMax)} · {activeTarget.styleHeading} max {formatCount(activeTarget.styleMax)} · {activeTarget.modelNote}
          </p>
        </section>

        {/* Outputs — Target indicator + always-visible LYRICS box and STYLE box */}
        <div ref={outputRef} className="space-y-14 pt-2">
          {/* Target indicator bar with both live counters */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-[#262626] bg-[#0a0a0a] px-5 py-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                {outputTarget.shortName}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#71717a]">
                {outputTarget.modelNote}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 font-mono text-xs uppercase tracking-wider text-[#c0c0c0]">
              <span>
                Lyrics{' '}
                <strong className="text-white">
                  {formatCount(lyricsValidation.chars)} / {formatCount(lyricsValidation.max)}
                </strong>
              </span>
              <span className="text-[#3f3f46]">|</span>
              <span>
                {outputTarget.styleHeading}{' '}
                <strong className="text-white">
                  {formatCount(soundValidation.chars)} / {formatCount(soundValidation.max)}
                </strong>
              </span>
              {result && (
                <>
                  <span className="text-[#3f3f46]">|</span>
                  <button
                    type="button"
                    onClick={handleCopyLlmPrompt}
                    className="inline-flex items-center gap-1.5 border border-[#3f3f46] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#c0c0c0] transition-colors hover:border-white hover:text-white cursor-pointer"
                  >
                    {promptCopied ? (
                      <>
                        <Check className="h-3 w-3 text-white" />
                        Rulebook Prompt Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Rulebook Prompt
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
                        : 'border-[#3f3f46] text-[#c0c0c0] hover:border-white hover:text-white',
                    )}
                  >
                    <ClipboardCheck className="h-3 w-3" />
                    Craft Audit
                  </button>
                </>
              )}
            </div>
          </div>

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
            meta={
              result
                ? `${personaLabel(result.spec.persona)} · ${result.spec.mood.label} · ${result.spec.tempo.label} · ${result.spec.gender} vocal tags`
                : `Write your lyrics here or click Generate (${formatCount(outputTarget.lyricsMax)} char max)`
            }
            value={lyricsText}
            placeholder={
              target === 'ace'
                ? `[Intro: ${selectedVoice.gender}]\n[Cold open direction...]\nWrite your lyrics directly here, or click GENERATE above to write a complete ACE-formatted song...`
                : '[Intro]\nWrite your lyrics directly here, or click GENERATE above...'
            }
            onChange={setLyricsText}
            validation={lyricsValidation}
            copyLabel="Copy Lyrics"
            minRows={result ? (result.spec.target === 'ace' ? 26 : 20) : 14}
          />

          <OutputPanel
            index="02"
            heading={outputTarget.styleHeading}
            meta={
              result
                ? `${result.spec.bpm}${result.spec.switchBpm ? ` → ${result.spec.switchBpm}` : ''} BPM · ${result.spec.key} · ${result.spec.voice.name} · ${personaLabel(result.spec.persona)}`
                : `Matching ${outputTarget.styleHeading.toLowerCase()} prompt appears here (${formatCount(outputTarget.styleMax)} char max)`
            }
            value={soundText}
            placeholder={
              target === 'ace'
                ? 'Click GENERATE above to build a matching ACE Style prose brief (producer genre DNA, BPM, key, instruments, production, vocal character + guardrail), or edit directly here...'
                : 'Click GENERATE above to build a matching Sound Prompt, or edit directly here...'
            }
            onChange={setSoundText}
            validation={soundValidation}
            copyLabel={outputTarget.styleCopyLabel}
            minRows={7}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
