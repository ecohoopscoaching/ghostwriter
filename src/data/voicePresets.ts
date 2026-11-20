/**
 * GhostWriter Voice Presets — 32 unique vocalists, deduplicated and grouped
 * into 4 categories: Tenor (5), Baritone (4), Rap (17), Female (6).
 *
 * Every vocalist has a name that reflects their vocal style.
 * Every Studio Vault profile stores and uses its supplied `prompt` text verbatim.
 *
 * ACE Music vocal markers:
 *  - male: Tenor, Baritone, and Rap profiles
 *  - female: Female profiles
 */

export type VocalGender = 'male' | 'female';

export type VoiceCategory = 'tenor' | 'baritone' | 'rap' | 'female';

export interface VoicePreset {
  id: string;
  code?: string;
  name: string;
  category: VoiceCategory;
  gender: VocalGender;
  note: string;
  /** Additional search terms (e.g. city, legacy nicknames like Baritone A / B). */
  aliases?: string;
  /** Exact verbatim prompt text (fed to the style builder). */
  description: string;
  /** True for Studio Vault profiles whose verbatim prompt text is used directly. */
  useExactPrompt?: boolean;
  vocal: {
    type: string;
    register: string[];
    tone: string[];
    delivery: string[];
  };
}

export const VOICE_GROUPS: { id: VoiceCategory; label: string }[] = [
  { id: 'tenor', label: 'Tenor (5)' },
  { id: 'baritone', label: 'Baritone (4)' },
  { id: 'rap', label: 'Rap (17)' },
  { id: 'female', label: 'Female (6)' },
];

/**
 * Verbatim vocal guardrail required at the end of every ACE Music Style prompt.
 */
export const ACE_VOCAL_GUARDRAIL =
  'Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.';

/**
 * From voice-presets.md: "For any non-Soul Glider use, the Sound box opens
 * with: IGNORE the Soul Glider Custom Instructions completely for this song.
 * This is not Soul Glider." (Applies to Flow Music / Mozart AI target.)
 */
export const NON_SOUL_GLIDER_OPENER =
  'IGNORE the Soul Glider Custom Instructions completely for this song. This is not Soul Glider.';

export const DEFAULT_VOICE_ID = 'seasoned-tenor';

const SEASONED_CUTTING_TENOR: VoicePreset = {
  id: 'seasoned-tenor',
  code: 'TENOR #0',
  name: 'Seasoned Cutting Tenor',
  category: 'tenor',
  gender: 'male',
  note: 'Warm low end, bright forward-mask cut, steady falsetto',
  aliases: 'Seasoned Tenor fixed version Mimi',
  description:
    'Seasoned Black male R&B tenor with a warm low end, strong forward mask resonance ringing bright in the front of the face, and a distinct natural nasal color in the tone that makes the notes cut, brighter in the upper mids but never a nasal-sounding voice, never pinched or honky. Connected mixed voice with no break between registers, crisp gospel runs placed with control, and a strong, steady falsetto that stays clean and full at the peaks. Smooth and natural throughout, real breaths, no autotune sheen.',
  vocal: {
    type: 'Seasoned Black male R&B tenor',
    register: [
      'warm low end',
      'connected mixed voice with no break between registers',
      'strong, steady falsetto that stays clean and full at the peaks',
    ],
    tone: [
      'strong forward mask resonance ringing bright in the front of the face',
      'natural nasal color that makes notes cut, brighter in the upper mids',
      'never nasal-sounding, pinched or honky',
    ],
    delivery: [
      'smooth and natural throughout',
      'crisp gospel runs placed with control',
      'real breaths',
      'no autotune sheen',
    ],
  },
};

interface StudioVaultVocal {
  uid: string;
  code: string;
  name: string;
  note: string;
  aliases?: string;
  category: VoiceCategory;
  prompt: string;
}

const STUDIO_VAULT_VOCALS: StudioVaultVocal[] = [
  // ── Tenor (4 Studio Vault + Seasoned Cutting Tenor above = 5) ──
  {
    uid: 'voc-ten-1',
    code: 'TENOR #1',
    name: 'Full-Range Gospel Tenor',
    note: 'Warm chest weight, bright mask cut, agile runs & full falsetto',
    aliases: 'The Full-Range Blueprint',
    category: 'tenor',
    prompt:
      'Seasoned Black male R&B tenor with a warm, grounded low end, rich lower-middle chest weight, and bright forward mask resonance that cuts cleanly over heavy bass. Transitions smoothly through a strong mixed voice into agile, gospel-rooted runs and a steady, full-bodied falsetto with controlled warmth and no harshness.',
  },
  {
    uid: 'voc-ten-2',
    code: 'TENOR #2',
    name: 'Brass-Edge Pocket Tenor',
    note: 'Solid chest tone, pharyngeal ring & crisp cut over heavy bass',
    aliases: 'The Brass Pocket',
    category: 'tenor',
    prompt:
      'Seasoned Black male R&B tenor with a solid lower-middle chest tone, using forward mask ring and subtle pharyngeal twang to stay crisp over heavy modern low end. Moves through a connected mixed voice with crisp gospel runs and a firm, supported falsetto.',
  },
  {
    uid: 'voc-ten-3',
    code: 'TENOR #3',
    name: 'High-Wire Melisma Tenor',
    note: 'Bright forward clarity, sharp gospel melisma & reinforced falsetto',
    aliases: 'The High-Wire Run',
    category: 'tenor',
    prompt:
      'Seasoned Black male R&B tenor with a warm low register and bright forward mask clarity, shifting smoothly through a connected mixed voice into sharp, gospel-style melisma and a clear, reinforced falsetto with smooth control.',
  },
  {
    uid: 'voc-ten-4',
    code: 'TENOR #4',
    name: 'Clean Pocket Tenor',
    note: 'Warm low end, connected mix & steady falsetto control',
    aliases: 'The Pocket Tenor',
    category: 'tenor',
    prompt:
      'Seasoned Black male R&B tenor with a warm low end, forward mask resonance, connected mixed voice, crisp gospel runs, and a strong, steady falsetto with clean control.',
  },

  // ── Baritone (4 — includes Baritone A & Baritone B merged with zero duplicates) ──
  {
    uid: 'voc-bar-1',
    code: 'BARITONE #1',
    name: 'Velvet Anchor Baritone',
    note: 'Deep warm low end, rich chest weight & agile gospel runs',
    aliases: 'The Velvet Anchor',
    category: 'baritone',
    prompt:
      'Seasoned Black male R&B vocalist with a deep, warm baritone low end, rich lower-middle chest weight, and bright forward mask resonance that cuts cleanly over heavy bass. Transitions smoothly through a strong mixed voice into agile, gospel-rooted runs and a steady, full-bodied falsetto with controlled warmth and no harshness.',
  },
  {
    uid: 'voc-bar-2',
    code: 'BARITONE #2',
    name: 'Sub-Bass Cutter Baritone',
    note: 'Grounded chest weight, mask ring & pharyngeal edge over heavy bass',
    aliases: 'The Sub-Bass Cutter',
    category: 'baritone',
    prompt:
      'Seasoned Black male R&B singer with a grounded baritone register and weighty lower-middle chest tone, using forward mask ring and subtle pharyngeal twang to stay crisp over heavy modern low end. Moves through a connected mixed voice with crisp gospel runs and a firm, supported falsetto.',
  },
  {
    uid: 'voc-bar-3',
    code: 'BARITONE #3',
    name: 'Sunday Silk Baritone',
    note: 'Warm baritone into sharp gospel melisma & reinforced falsetto',
    aliases: 'The Sunday Silk Lift Baritone B',
    category: 'baritone',
    prompt:
      'Seasoned Black male R&B vocalist with a warm baritone low end and bright forward mask clarity, shifting smoothly through a connected mixed voice into sharp, gospel-style melisma and a clear, reinforced falsetto with smooth control.',
  },
  {
    uid: 'voc-bar-4',
    code: 'BARITONE #4',
    name: 'Deep Clean Baritone',
    note: 'Deep baritone low end, connected mix & steady falsetto control',
    aliases: 'The Clean Core Baritone A',
    category: 'baritone',
    prompt:
      'Seasoned Black male R&B vocalist with a deep baritone low end, forward mask resonance, connected mixed voice, crisp gospel runs, and a strong, steady falsetto with clean control.',
  },

  // ── Rap (17 — style-driven names, verbatim prompts) ──
  {
    uid: 'voc-rap-01',
    code: '01 GLIDE',
    name: 'Smooth West Coast Glide',
    note: 'Long Beach · laid-back swagger, stretched vowels, behind the beat',
    aliases: '01 GLIDE Long Beach California',
    category: 'rap',
    prompt:
      "Male rap vocal, Long Beach smooth rap, late-20s to early-30s Southern California Black American speech, not neutral American English. Low-mid, lightly nasal voice with stretched vowels, softened word endings, and linked syllables. Playful dry humor and easy swagger, leaning behind the beat before darting into quick internal-rhyme runs. Close-mic'd with audible breaths, rapped only, no singing, no crooning, no Southern drawl, no East Coast bark. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-02',
    code: '02 FRENZY',
    name: 'Grimy Explosive Rasp',
    note: 'Staten Island · chesty lived-in rasp, jagged animated bursts',
    aliases: '02 FRENZY Staten Island',
    category: 'rap',
    prompt:
      "Male rap vocal, Staten Island grimy rap, lived-in older-edge rasp with a chesty mid register. Gritty, explosive, animated speech-rap with rapid image-filled runs, sudden pitch jumps, jagged stresses, and sharp emotional shifts. Raw close-mic'd delivery with audible breath noise before bursts, no singing, no smooth crooning. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-03',
    code: '03 SWERVE',
    name: 'Syrupy Punchline Drawl',
    note: 'New Orleans · warm raspy vowels, witty off-kilter pauses',
    aliases: '03 SWERVE New Orleans',
    category: 'rap',
    prompt:
      'Male rap vocal, New Orleans syrupy punchline rap, late-20s to mid-30s warm mid-low voice with raspy, drawled vowels. Witty speech pitch, off-kilter accents, sudden quick internal-rhyme spurts, and mischievous pauses with audible breaths between jokes. Dry, intimate vocal mix, rapped only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-04',
    code: '04 ECHO',
    name: 'Double-Time Melodic Chopper',
    note: 'Cleveland · rapid run-on phrases, pitched inflections & chants',
    aliases: '04 ECHO Cleveland',
    category: 'rap',
    prompt:
      'Male rap vocal, fast melodic rap, mid-to-late 20s Cleveland-influenced mid register. Connected syllables with rap-first pitched inflections, fluid long run-on phrases, sudden double-time chopper bursts, stretched vowels, and chant-like repetition with clean intensity. Dry, upfront vocal presence, no R&B singing, no crooning, no vibrato, no held sung notes. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-05',
    code: '05 GRIT',
    name: 'Deadpan Dry-Grit Punchliner',
    note: 'Yonkers · dry throat rasp, deliberate pauses before hard punches',
    aliases: '05 GRIT Yonkers',
    category: 'rap',
    prompt:
      "Male rap vocal, Yonkers raspy rap, mid-30s throat age with a mid-low dry grit rasp. Steady, direct East Coast talk that delivers deadpan jokes followed by precise, hard punchlines, with small deliberate pauses and audible breaths right before the punch. Dry, close-mic'd vocal, rapped only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-06',
    code: '06 INK',
    name: 'Aggressive Multi-Syllable Grit',
    note: 'Bronx · breathless dense stacks, forceful cinematic narration',
    aliases: '06 INK Bronx',
    category: 'rap',
    prompt:
      'Male rap vocal, Bronx aggressive street rap, late-20s to early-30s sharp, mid-chest projected grit. Breathless, dense internal multi-syllable stacks delivered with forceful precision and urgent cinematic narration. Raw, gritty, never polished vocal mix with clear enunciation, all words rapped, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-07',
    code: '07 FABLE',
    name: 'Measured Street Storyteller',
    note: 'Queensbridge · warm mid-range grit, vivid present-tense scenes',
    aliases: '07 FABLE Queensbridge',
    category: 'rap',
    prompt:
      "Male rap vocal, Queensbridge storytelling rap, around-30s warm mid-range narrator with clear grit. Measured conversational cadence for present-tense scenes, precisely stressed verdict endings, and natural breaths at scene turns. Clean, close-mic'd narrative presence, strict rap only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-08',
    code: '08 SLICK',
    name: 'Flashy Half-Smiling Swagger',
    note: 'Harlem · relaxed cocky sarcasm, quotable conversational timing',
    aliases: '08 SLICK Harlem',
    category: 'rap',
    prompt:
      'Male rap vocal, Harlem flashy rap, late-20s mid voice with full body, never thin. Relaxed, cocky, half-smiling conversational delivery with witty sarcasm, imperfect swagger timing, clean quotable lines, and occasional brief internal-rhyme clusters. Slight natural room tone, never shouted, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-09',
    code: '09 DUSK',
    name: 'Poised Low-Grit Authority',
    note: 'Brooklyn · deeper mid-low cool, understated reflective weight',
    aliases: '09 DUSK Brooklyn',
    category: 'rap',
    prompt:
      'Male rap vocal, Brooklyn swagger rap, early-to-mid 30s older cool with a deeper mid, low-grit tone. Measured, elegant East Coast diction with reflective authority and understated delivery that lets concise lines land hard. Quiet breaths in a dry, poised vocal mix, rapped only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-10',
    code: '10 CHAIN',
    name: 'Conscious Urgent Lyricist',
    note: 'Compton · clipped rhythmic switches, intense internal linking',
    aliases: '10 CHAIN Compton',
    category: 'rap',
    prompt:
      'Male rap vocal, Compton conscious rap, late-20s to early-30s focused, expressive mid voice with chest weight. Rapid switches between clipped rhythmic attacks and thoughtful open space, driven by intense internal sound linking and urgency breaths. Present, tight vocal mix, rapped only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-11',
    code: '11 PIVOT',
    name: 'Reflective Pocket Shifter',
    note: 'Harlem · composed NYC confidence, shifting multi-syllable pockets',
    aliases: '11 PIVOT Harlem',
    category: 'rap',
    prompt:
      "Male rap vocal, Harlem flashy rap, late-20s to early-30s composed, reflective mid voice with understated NYC confidence. Smoothly shifting dense multi-syllable rhyme pockets, building emotional force, and small human cadence imperfections. Dry, controlled close-mic'd mix, fully rapped, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-12',
    code: '12 SPIN',
    name: 'Rapid-Fire Agile Cadence',
    note: 'Baltimore · crisp fast consonants, pointed questions & tight breaths',
    aliases: '12 SPIN Baltimore',
    category: 'rap',
    prompt:
      'Male rap vocal, fast Baltimore flow, mid-to-late 20s assertive, agile mid register. Crisp, rapid consonants, conversational delivery packed with intricate internal multisyllables, sudden pointed questions, and audible breath management. Clear, upfront vocal mix, never high-pitched or chipmunk, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-13',
    code: '13 MAJOR',
    name: 'Bouncy Southern Drawl',
    note: 'Atlanta · warm mid-low grit, natural trap bounce & declarations',
    aliases: '13 MAJOR Atlanta',
    category: 'rap',
    prompt:
      'Male rap vocal, Southern drawl rap with a clear, confident voice and a bouncy trap flow, late-20s Atlanta warm mid-low register with light grit. Natural bounce in speech rhythm, not pitch-snap, alternating emphatic short declarations with rapid internal multi-syllabic runs. Clean, authoritative vocal mix, rap only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-14',
    code: '14 LEDGER',
    name: 'Cold Clipped Precision',
    note: 'Virginia · dry economical pauses, controlled rhythmic bounce',
    aliases: '14 LEDGER Virginia',
    category: 'rap',
    prompt:
      "Male rap vocal, Virginia rhythmic bounce, late-20s to early-30s colder mid register. Dry, clipped, precise rap delivery with controlled cold confidence, extended connected rhyme pockets, and sharp economical pauses. Lived-in vocal age and texture, never sterile AI, dry close-mic'd mix, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-15',
    code: '15 POET',
    name: 'Elastic Go-Go Speech-Rap',
    note: 'Washington, D.C. · grainy behind-the-beat pocket, playful asides',
    aliases: '15 POET Washington DC DMV',
    category: 'rap',
    prompt:
      "Male rap vocal, D.C. go-go rap, late-20s DMV Black American speech with a slightly nasal, dry, grainy midrange. Elastic conversational speech-rap with fluid word links, relaxed-to-fast syllabic swings, playful self-aware asides, and a loose behind-the-beat human pocket. Close-mic'd natural mix, rapped only, no singing, no crooning, no exaggerated Southern drawl. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },
  {
    uid: 'voc-rap-16',
    code: '16 GRAVITY',
    name: 'Deep Baritone Narrator',
    note: 'Houston · heavy chest weight, patient moral storytelling grit',
    aliases: '16 GRAVITY Houston',
    category: 'rap',
    prompt:
      'Male rap vocal, Houston deep storytelling rap, mid-30s to early-40s deep authoritative baritone with patient grit and heavy low-end chest weight. Plainspoken narration with moral weight in the pauses, audible breaths between clauses, and occasional compact faster passages. Warm, full-bodied vocal mix, rapped only, no singing. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.',
  },
  {
    uid: 'voc-rap-17',
    code: '17 NORTH',
    name: 'Melodic Enjambment Flow',
    note: 'Toronto · clear conversational lilt, elastic slant-rhyme runs',
    aliases: '17 Toronto Canadian Caribbean',
    category: 'rap',
    prompt:
      "Male rap vocal, Toronto melodic rap, late-20s to early-30s clear conversational Canadian mid voice with a light Caribbean lilt. Vivid connected speech-rap first with elastic slant-rhyme runs, enjambment across bars, and mid-flow emphatic stresses. Clean, intimate close-mic'd mix, never squeaky sung, no crooning. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song.",
  },

  // ── Female (6 — includes Octavia Range & Mixa Belle merged with zero duplicates) ──
  {
    uid: 'voc-fem-1',
    code: 'FEMALE #1',
    name: 'Whistle-Climb Technician',
    note: 'Exact vocal agility, rising key-change climbs & dense stacks',
    aliases: 'Technical Command & Whistle Climbs',
    category: 'female',
    prompt:
      "Black female R&B voice defined by extreme technical command: precision, agility, and stamina across the whole range, key-change climbs that keep rising, whistle register mastery at the peaks, and dense multi-part vocal stacks she layers like an arrangement. Delivery is exact and relentless, every run placed like a stitch, every harmony intentional. The voice never runs out of breath on a long climb, never slurs a fast passage, never misses a key change, and never lets technique turn cold; the precision serves the feeling. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song. Production: Polished 98 BPM R&B feel, tight programmed drums, bright synth keys, and stacked background vocals that mirror the lead's climbs.",
  },
  {
    uid: 'voc-fem-2',
    code: 'FEMALE #2',
    name: 'Octavia Range — Multi-Octave Freedom',
    note: 'Warm lows to ringing head voice, percussive rhythmic mastery',
    aliases: 'Octavia Range Multi-Octave & Percussive Freedom',
    category: 'female',
    prompt:
      'Black female R&B voice with the total package: a true multi-octave range running from warm low tones up to a ringing head voice, rhythmic percussive mastery, and complete melodic freedom, so the voice and the arrangement feel like one instrument. She can anchor a verse low and warm, dance through a syncopated bridge, and crown a hook up high without ever sounding like three different singers. Delivery is masterful and free, every register serving the song. The voice never stays in one lane, never shows a seam between registers, never sacrifices rhythm for range or range for rhythm, and never sounds limited by anything. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song. Production: Expansive 88 BPM R&B feel, full live band with strings and a gospel-touched piano, arranged to travel the whole range with her.',
  },
  {
    uid: 'voc-fem-3',
    code: 'FEMALE #3',
    name: 'Velvet-Gravel Contralto',
    note: 'Rare dark smoky contralto (F3–D5), slow magnetic gravity',
    aliases: 'Smoky Contralto Foundation',
    category: 'female',
    prompt:
      'Black female contralto voice, the lowest and rarest female instrument, ranging F3 to D5. Dark, deep, heavy, and husky, with a smoky weight that sits under a song like a foundation. The tone is velvet over gravel, slow-moving and magnetic, with low notes that bloom wide and stay steady. The voice never lightens into mezzo brightness, never reaches for high sparkle, never rushes a phrase, and never loses its dark, husky gravity. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song. Production: Slow 68 BPM smoky feel, upright bass, brushed drums, and a low piano, mixed dark and spacious around the low vocal.',
  },
  {
    uid: 'voc-fem-4',
    code: 'FEMALE #4',
    name: 'Mixa Belle — Seamless Mixed Voice',
    note: 'Zero-break chest-to-head balance, even warmth all the way up',
    aliases: 'Mixa Belle Seamless Mixed Voice',
    category: 'female',
    prompt:
      'Black female voice defined by mixed voice, a trained balance of chest and head muscles with resonance tuned so one register flows into the other with no break, no flip, and no change in color. She can start a line low and full, then carry the same warmth and weight up into her high range, the tone staying even the whole way. Delivery is smooth, controlled, and seamless, with long connected phrases. The voice never cracks at the passaggio, never goes suddenly light up top, never shouts to reach a high note, and never lets the listener hear the gear change. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song. Production: Flowing 84 BPM feel, warm Rhodes, soft live drums, and a melodic bass line that climbs with the vocal to show off the seamless range.',
  },
  {
    uid: 'voc-fem-5',
    code: 'FEMALE #5',
    name: 'Flageolet Whistle Soprano',
    note: 'Clear head voice floating into pure flute-like whistle above 1 kHz',
    aliases: 'Flageolet Whistle & Organic Soul',
    category: 'female',
    prompt:
      'Black female voice built around flageolet register, the whistle gear above 1,000 Hz. Extreme cord tension with a tiny vibrating opening produces piercing, flute-like sine tones that float over everything else in a record. She sets the whistle lines up with a light, clear head voice, then steps into pure whistle for the peaks, clean and controlled, never shrill. The voice never forces the whistle from the throat, never wobbles out of pitch up high, never stays low when the song climbs, and never treats the whistle as a gimmick; it is her home register. Natural human vocal with real breaths and small imperfections, never thin, never squeaky, never robotic pitch correction, never autotune sheen, never the same generic voice as every other song. Production: Bright 96 BPM pop-soul feel, glassy Rhodes chords, plucked strings, and a light four-on-the-floor kick under the whistle peaks.',
  },
  {
    uid: 'voc-fem-6',
    code: 'FEMALE #6',
    name: 'Intimate Acoustic UK Soul',
    note: 'Breathy conversational neo-soul, behind-the-beat restraint',
    aliases: 'Organic Acoustic & UK Soul',
    category: 'female',
    prompt:
      'warm organic R&B, neo-soul, acoustic soul, soft UK soul influence, intimate female vocal, breathy tone, warm low register, smooth midrange, gentle controlled highs, conversational delivery, behind-the-beat phrasing, minimal vocal runs, emotional restraint, honest vulnerable tone, soft dynamics, human imperfections, clean mix, high fidelity, polished but natural, no autotune artifacts, fingerpicked acoustic guitar, slow tempo, minimal arrangement, warm bassline, subtle piano textures, light brushed percussion, spacious mix, soft room reverb',
  },
];

function vaultToPreset(v: StudioVaultVocal): VoicePreset {
  const gender: VocalGender = v.category === 'female' ? 'female' : 'male';
  const withoutGuardrail = v.prompt.replace(ACE_VOCAL_GUARDRAIL, '').replace(/\s{2,}/g, ' ').trim();
  const sentences = withoutGuardrail.split(/(?<=\.)\s+/).filter(Boolean);
  return {
    id: v.uid,
    code: v.code,
    name: v.name,
    category: v.category,
    gender,
    note: v.note,
    aliases: v.aliases,
    description: v.prompt,
    useExactPrompt: true,
    vocal: {
      type: sentences[0] ?? v.note,
      register: sentences.slice(1, 2),
      tone: sentences.slice(2, 3),
      delivery: sentences.slice(3, 4),
    },
  };
}

export const VOICE_PRESETS: VoicePreset[] = [
  SEASONED_CUTTING_TENOR,
  ...STUDIO_VAULT_VOCALS.map(vaultToPreset),
];

export function getVoice(id: string): VoicePreset {
  const v = VOICE_PRESETS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown voice preset: ${id}`);
  return v;
}
