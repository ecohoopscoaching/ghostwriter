import { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';
import {
  HIT_MAKING_CHECKLIST,
  HIT_SONG_QUESTIONS,
  RAP_QUALITY_CHECKLIST,
  RNB_REPLAY_CHECKLIST,
} from '@/data/craftLibrary';

interface CraftAuditPanelProps {
  lyrics: string;
  title: string;
  isRap: boolean;
}

interface AutoCheckResult {
  label: string;
  status: 'pass' | 'review';
  detail?: string;
}

function evaluateHitChecklist(lyrics: string, title: string): AutoCheckResult[] {
  const text = lyrics.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const chorusCount = lines.filter((l) => /^\[(Final\s+)?Chorus(?::\s*(?:male|female))?\]$/i.test(l)).length;
  const hasPreChorus = lines.some((l) => /^\[Pre-Chorus(?::\s*(?:male|female))?\]$/i.test(l));
  const hasBridge = lines.some((l) => /^\[Bridge(?::\s*(?:male|female))?\]$/i.test(l));
  const hasVerse1 = lines.some((l) => /^\[Verse 1(?::\s*(?:male|female))?\]$/i.test(l));
  const hasVerse2 = lines.some((l) => /^\[Verse 2(?::\s*(?:male|female))?\]$/i.test(l));
  const hasEchoOrHookDensity = /\([^)]+\)/.test(text);

  const firstChorusIdx = lines.findIndex((l) => /^\[Chorus(?::\s*(?:male|female))?\]$/i.test(l));
  const chorusEarlyEnough = firstChorusIdx > 0 && firstChorusIdx <= Math.ceil(lines.length * 0.42);

  const titleLower = title.trim().toLowerCase();
  const chorusBlocks = text.split(/(?=\[(?:Final\s+)?Chorus(?::\s*(?:male|female))?\])/i).slice(1);
  const titleInChorus =
    titleLower.length > 0 &&
    chorusBlocks.some((block) => {
      const onlySection = block.split(/\n\[(?:Intro|Verse|Pre-Chorus|Bridge|Outro)/i)[0] ?? '';
      return onlySection.toLowerCase().includes(titleLower);
    });

  // Check whether Verse 1 and Verse 2 have distinct lyric content
  const verse1Match = text.match(/\[Verse 1(?::\s*(?:male|female))?\]([\s\S]*?)(?=\n\[|$)/i);
  const verse2Match = text.match(/\[Verse 2(?::\s*(?:male|female))?\]([\s\S]*?)(?=\n\[|$)/i);
  const versesAdvance =
    Boolean(verse1Match && verse2Match) &&
    verse1Match![1].trim().toLowerCase() !== verse2Match![1].trim().toLowerCase();

  // Commercial sweet spot pacing (~2:50-3:40 corresponds roughly to 1,400–4,600 chars)
  const chars = text.length;
  const commercialPacing = chars >= 1400 && chars <= 4800;

  // Map 1:1 with HIT_MAKING_CHECKLIST (10 items)
  const statuses: Array<'pass' | 'review'> = [
    chorusEarlyEnough ? 'pass' : 'review',
    hasPreChorus && hasBridge ? 'pass' : 'review',
    chorusCount >= 3 ? 'pass' : 'review',
    titleInChorus ? 'pass' : 'review',
    hasVerse1 && hasVerse2 && versesAdvance ? 'pass' : 'review',
    'review', // Rhyme scheme supporting melody/flow — ear check
    commercialPacing ? 'pass' : 'review',
    hasEchoOrHookDensity && chorusCount >= 3 ? 'pass' : 'review',
    hasVerse1 && hasVerse2 && hasBridge && chorusCount >= 2 ? 'pass' : 'review',
    'review', // Emotional journey continuity — ear check
  ];

  return HIT_MAKING_CHECKLIST.map((label, idx) => ({
    label,
    status: statuses[idx] ?? 'review',
  }));
}

export function CraftAuditPanel({ lyrics, title, isRap }: CraftAuditPanelProps) {
  const hitChecks = useMemo(() => evaluateHitChecklist(lyrics, title), [lyrics, title]);
  const passedCount = hitChecks.filter((c) => c.status === 'pass').length;
  const modeChecklist = isRap ? RAP_QUALITY_CHECKLIST : RNB_REPLAY_CHECKLIST;

  return (
    <section className="border border-[#262626] bg-[#0a0a0a] p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#a1a1aa]">
            CRAFT AUDIT · {isRap ? 'MASTER RAP RULEBOOK' : 'R&B SONGWRITING RULEBOOK'}
          </p>
          <h3 className="mt-1.5 text-xl font-black uppercase tracking-tight text-white">
            Final Hit-Making Checklist
          </h3>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#c0c0c0]">
          {passedCount} / {hitChecks.length} Auto-Verified
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717a]">
            Hit-Making Checklist (10)
          </p>
          <ul className="mt-3 space-y-2.5">
            {hitChecks.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5 text-xs leading-relaxed">
                {item.status === 'pass' ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#52525b]" />
                )}
                <span className={item.status === 'pass' ? 'text-[#f4f4f5]' : 'text-[#a1a1aa]'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717a]">
              {isRap ? 'Rap Quality Test (9)' : 'R&B Replay Value Test (7)'}
            </p>
            <ul className="mt-3 space-y-2">
              {modeChecklist.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs leading-relaxed text-[#d4d4d8]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#c0c0c0]" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#262626] pt-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717a]">
              Hit Test Questions
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {HIT_SONG_QUESTIONS.map((q) => (
                <li key={q} className="font-mono text-[11px] text-[#a1a1aa]">
                  — {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
