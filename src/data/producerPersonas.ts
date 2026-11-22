/**
 * Producer Persona library — 68 personas, transcribed from producer-personas.pdf
 * (source: producer-personas-owner.json · Mozart canon, built 2026-11-06).
 *
 * House rules from the library (enforced by the generator):
 *  - Producer prompts are essence only: DNA, palette, hard nos.
 *  - Names marked internal are lane labels only. They are NEVER pasted into a
 *    sound prompt. `foundation` lines are internal only and never leave the app.
 *  - The sound prompt is built exclusively from the `sound` fields below, which
 *    are written in plain words with no real producer or artist names. A test
 *    sweeps every persona to prove it.
 *
 * `essence` is the library text, kept verbatim for display in the picker.
 */

export type PersonaGroup = 'house' | 'owner' | 'internal';

export interface PersonaSound {
  /** Core DNA of the sound in plain words. */
  dna: string;
  instruments?: string[];
  drums?: string[];
  bass?: string[];
  arrangement?: string[];
  mix?: string[];
  /** Hard nos, written as nouns ("trap rolls", "pop gloss"). */
  avoid?: string[];
  /** Overrides the genre tempo range when the persona specifies a real tempo. */
  bpm?: [number, number];
  /** Second tempo after a beat switch (SOULSWITCH). */
  switchBpm?: [number, number];
  switchAt?: string;
  mode?: 'minor' | 'major';
}

export interface ProducerPersona {
  id: string;
  number: number | null;
  name: string;
  tagline?: string;
  group: PersonaGroup;
  /** True when the name is an internal lane label (real-producer name). */
  internal: boolean;
  essence: string;
  /** Internal only. Never displayed in prompts. */
  foundation?: string;
  sound: PersonaSound;
}

export const PERSONA_GROUPS: { id: PersonaGroup; label: string; note: string }[] = [
  { id: 'house', label: 'House', note: 'House picks' },
  { id: 'owner', label: 'Named owner presets', note: '30 presets' },
  { id: 'internal', label: 'Internal lanes', note: 'Lane labels only, never pasted into Flow or Mozart' },
];

/** No producer is pre-selected by default (REELZ is not the default). */
export const DEFAULT_PERSONA_ID = '';

export const PRODUCER_PERSONAS: ProducerPersona[] = [
  // ───────────────────────────── House ─────────────────────────────
  {
    id: 'soulswitch',
    number: null,
    name: 'SOULSWITCH',
    tagline: 'Soul-to-trap late beat switch',
    group: 'house',
    internal: false,
    essence:
      'SOULSWITCH is a hip-hop producer known for the late beat switch. Every track rides early-2000s soul-sample warmth at 80–92 BPM for the first full minute: pitched-up soul vocal or brass chops, vinyl crackle, Rhodes or organ, a walking bassline, and punchy live boom-bap drums. Just after 1:00 a tape-stop, low-pass sweep, or CD-skip drops into dead silence, then explodes into hard modern trap at 136–145 BPM: the same sample pitched down dark, distorted 808 slides, hard kicks, sharp snares, rolling triplet hats, and minor synth bells. Wide, punchy mixes that always leave room for a lead rapper.',
    sound: {
      dna: 'hip-hop with a late beat switch, early-2000s soul-sample warmth into hard modern trap',
      bpm: [80, 92],
      switchBpm: [136, 145],
      switchAt: '1:00',
      instruments: ['pitched-up soul vocal or brass chops', 'vinyl crackle', 'Rhodes or organ', 'minor synth bells after the switch'],
      drums: ['punchy live boom-bap drums first', 'then hard kicks, sharp snares, rolling triplet hats'],
      bass: ['walking bassline', 'then distorted 808 slides'],
      arrangement: ['just after 1:00 a tape-stop drops to dead silence, then explodes into trap with the same sample pitched down dark'],
      mix: ['wide, punchy mix with room for a lead vocal'],
    },
  },
  {
    id: 'p58',
    number: 58,
    name: 'THE PROTEGE',
    tagline: "Ghost's official producer",
    group: 'house',
    internal: false,
    essence:
      'Mid-90s Los Angeles dark minor-key rap at its real tempo, 128-140 BPM. Eerie, cold, after-midnight minor-key music that drives and keeps moving. Steady straight 8th hats at the real BPM, once-per-bar snare on beat 3, off-beat kick pushes, held pedal bass, dark minor chords holding a bar or two, strong staccato played figure, rumbling low piano, tape-warm mellotron strings. Full punchy drums (not trap), deep clean sub, modern loudness. Minor mode every time.',
    sound: {
      dna: 'mid-90s Los Angeles dark minor-key rap, eerie, cold, after-midnight, always driving',
      bpm: [128, 140],
      mode: 'minor',
      instruments: ['dark minor chords held a bar or two', 'strong staccato played figure', 'rumbling low piano', 'tape-warm mellotron strings'],
      drums: ['full punchy drums', 'steady straight 8th hats', 'snare once per bar on beat 3', 'off-beat kick pushes'],
      bass: ['held pedal bass', 'deep clean sub'],
      mix: ['modern loudness'],
      avoid: ['trap drums', 'major mode'],
    },
  },
  {
    id: 'p36',
    number: 36,
    name: 'REELZ',
    tagline: 'Contemporary Soul Glider sound',
    group: 'house',
    internal: false,
    essence:
      'Contemporary Soul Glider house sound. Warm R&B harmony, hip-hop pocket, deep controlled bass, soulful piano or Rhodes, restrained modern drums and subtle live instrumentation. Emotional but masculine, melodic but never soft, with a large clean pocket for high-tenor vocals and falsetto.',
    sound: {
      dna: 'contemporary R&B with warm harmony in a hip-hop pocket, emotional but masculine, melodic but never soft',
      instruments: ['soulful piano or Rhodes', 'subtle live instrumentation'],
      drums: ['restrained modern drums', 'hip-hop pocket'],
      bass: ['deep controlled bass'],
      mix: ['large clean pocket for high vocals and falsetto'],
      avoid: ['soft, sleepy energy'],
    },
  },

  // ─────────────────────── Named owner presets (30) ───────────────────────
  {
    id: 'p1', number: 1, name: 'THE ARCHITECT', group: 'owner', internal: false,
    essence:
      'Raw contemporary boom-bap with brutally clean drums, dusty soul fragments, chopped jazz textures, warm bass guitar and subtle vinyl grit. Hard kick, cracking dry snare, tiny timing imperfections, occasional turntable accents. Minimal but muscular. Premium modern mix with old-school bones.',
    foundation: 'Dr. Dre × DJ Premier',
    sound: {
      dna: 'raw contemporary boom-bap, minimal but muscular',
      instruments: ['dusty soul fragments', 'chopped jazz textures', 'subtle vinyl grit', 'occasional turntable accents'],
      drums: ['brutally clean drums', 'hard kick', 'cracking dry snare', 'tiny timing imperfections'],
      bass: ['warm bass guitar'],
      mix: ['premium modern mix with old-school bones'],
    },
  },
  {
    id: 'p2', number: 2, name: 'THE NIGHTSHIFT', group: 'owner', internal: false,
    essence:
      'Dark melodic hip-hop/R&B with heavy West Coast low end, cinematic tension and wide negative space. Deep moving bass, moody synths, sparse piano notes, hard modern drums and eerie melodic details. Night-drive energy. Expensive, restrained and dangerous.',
    foundation: 'Dr. Dre × DJ U-Neek',
    sound: {
      dna: 'dark melodic hip-hop/R&B, cinematic tension, night-drive energy, expensive, restrained and dangerous',
      instruments: ['moody synths', 'sparse piano notes', 'eerie melodic details'],
      drums: ['hard modern drums'],
      bass: ['heavy West Coast low end', 'deep moving bass'],
      mix: ['wide negative space'],
    },
  },
  {
    id: 'p3', number: 3, name: 'VELVET KNIFE', group: 'owner', internal: false,
    essence:
      'Sensual alternative R&B with strange rhythmic details and a slightly dangerous edge. Warm keys, bent synth textures, unexpected percussion, deep controlled bass and sparse guitar colors. Smooth enough for radio but weird enough to feel unmistakable.',
    foundation: 'Timbaland × D’Mile',
    sound: {
      dna: 'sensual alternative R&B with a slightly dangerous edge, radio-smooth but unmistakably strange',
      instruments: ['warm keys', 'bent synth textures', 'sparse guitar colors'],
      drums: ['unexpected percussion', 'strange rhythmic details'],
      bass: ['deep controlled bass'],
    },
  },
  {
    id: 'p4', number: 4, name: 'GLASSHOUSE', group: 'owner', internal: false,
    essence:
      'Extremely sparse emotional R&B. Fragile piano or processed keys, distant atmospheric textures, soft sub bass, restrained drums and lots of silence. Intimate, exposed and slightly cold. Every sound matters. Huge vocal pocket.',
    foundation: 'Noah “40” Shebib × Frank Dukes',
    sound: {
      dna: 'extremely sparse emotional R&B, intimate, exposed and slightly cold',
      instruments: ['fragile piano or processed keys', 'distant atmospheric textures'],
      drums: ['restrained drums'],
      bass: ['soft sub bass'],
      mix: ['huge vocal pocket', 'lots of silence', 'every sound matters'],
    },
  },
  {
    id: 'p5', number: 5, name: 'MOTOR CITY SAINT', group: 'owner', internal: false,
    essence:
      'Detroit-rooted neo-soul and hip-hop with loose human drums, warm electric bass, Rhodes, gospel-inflected harmony and live-feeling instrumentation. Slightly behind the beat, imperfect and soulful. Feels played by musicians rather than programmed.',
    foundation: 'J Dilla × Raphael Saadiq',
    sound: {
      dna: 'Detroit-rooted neo-soul and hip-hop with gospel-inflected harmony, played by musicians, not programmed',
      instruments: ['Rhodes', 'live-feeling instrumentation'],
      drums: ['loose human drums', 'slightly behind the beat'],
      bass: ['warm electric bass'],
    },
  },
  {
    id: 'p6', number: 6, name: 'HEATCHECK', group: 'owner', internal: false,
    essence:
      'Clean West Coast bounce with thick bass, crisp drums, bright keyboards, funky synth leads and laid-back pocket. Minimal arrangement, strong groove and plenty of space between sounds. Sunny confidence without becoming cheesy.',
    foundation: 'Dr. Dre × DJ Mustard',
    sound: {
      dna: 'clean West Coast bounce, laid-back pocket, sunny confidence',
      instruments: ['bright keyboards', 'funky synth leads'],
      drums: ['crisp drums'],
      bass: ['thick bass'],
      mix: ['minimal arrangement', 'plenty of space between sounds'],
      avoid: ['cheesiness'],
    },
  },
  {
    id: 'p7', number: 7, name: 'NOIR', group: 'owner', internal: false,
    essence:
      'Cinematic dark trap with ominous synth beds, distorted textures, deep 808s, sharp percussion and dramatic harmonic movement. Tension should build gradually. Minimal melody, massive atmosphere and expensive sound design.',
    foundation: 'Metro Boomin × Mike Dean',
    sound: {
      dna: 'cinematic dark trap, minimal melody, massive atmosphere',
      instruments: ['ominous synth beds', 'distorted textures', 'dramatic harmonic movement'],
      drums: ['sharp percussion'],
      bass: ['deep 808s'],
      arrangement: ['tension builds gradually'],
      mix: ['expensive sound design'],
    },
  },
  {
    id: 'p8', number: 8, name: 'CHROME', group: 'owner', internal: false,
    essence:
      'Highly polished contemporary R&B with elegant chords, clean drums, glossy synth textures and controlled bass. Strong melodic architecture and clear sections. Radio-ready without sounding generic. Sophisticated, emotional and extremely clean.',
    foundation: 'Stargate × D’Mile',
    sound: {
      dna: 'highly polished contemporary R&B, sophisticated, emotional and extremely clean',
      instruments: ['elegant chords', 'glossy synth textures'],
      drums: ['clean drums'],
      bass: ['controlled bass'],
      arrangement: ['strong melodic architecture', 'clear sections'],
      avoid: ['generic radio sound'],
    },
  },
  {
    id: 'p9', number: 9, name: 'GRAVITY', group: 'owner', internal: false,
    essence:
      'Heavy modern trap built around enormous sliding 808s, dark melodic loops, hard kicks, sharp hats and eerie atmospheric layers. Slow-moving harmony with aggressive rhythmic movement underneath. Dense low end but open vocal space.',
    foundation: 'Metro Boomin × WondaGurl',
    sound: {
      dna: 'heavy modern trap, slow-moving harmony over aggressive rhythmic movement',
      instruments: ['dark melodic loops', 'eerie atmospheric layers'],
      drums: ['hard kicks', 'sharp hats'],
      bass: ['enormous sliding 808s', 'dense low end'],
      mix: ['open vocal space'],
    },
  },
  {
    id: 'p10', number: 10, name: 'THE DRUMLINE', group: 'owner', internal: false,
    essence:
      'Rhythm-first R&B/hip-hop driven by unusual percussion. Syncopated kicks, hand percussion, rimshots, claps, toms, found sounds and tiny rhythmic surprises. Minimal bass and melodic parts. The drums themselves become the hook.',
    foundation: 'Pharrell × Timbaland',
    sound: {
      dna: 'rhythm-first R&B/hip-hop where the drums themselves become the hook',
      instruments: ['minimal melodic parts'],
      drums: ['syncopated kicks', 'hand percussion', 'rimshots, claps and toms', 'found sounds', 'tiny rhythmic surprises'],
      bass: ['minimal bass'],
    },
  },
  {
    id: 'p11', number: 11, name: 'BLUE HOUR', group: 'owner', internal: false,
    essence:
      'Late-night emotional R&B with warm Rhodes, muted guitar, deep soft sub bass, dry drums and hazy atmospheric details. Intimate and vulnerable, never overly cinematic. Slow-burning groove with lots of breathing room.',
    foundation: 'Noah “40” Shebib × D’Mile',
    sound: {
      dna: 'late-night emotional R&B, intimate and vulnerable, slow-burning groove',
      instruments: ['warm Rhodes', 'muted guitar', 'hazy atmospheric details'],
      drums: ['dry drums'],
      bass: ['deep soft sub bass'],
      mix: ['lots of breathing room'],
      avoid: ['overly cinematic swells'],
    },
  },
  {
    id: 'p12', number: 12, name: 'MAD SCIENTIST', group: 'owner', internal: false,
    essence:
      'Experimental hip-hop that still grooves. Chopped samples, strange vocal fragments, off-center percussion, pitch manipulation, unexpected silence, distorted bass and abrupt arrangement changes. Weird ideas made catchy rather than weird for the sake of it.',
    foundation: 'Kanye West × Timbaland',
    sound: {
      dna: 'experimental hip-hop that still grooves, weird ideas made catchy',
      instruments: ['chopped samples', 'strange vocal fragments', 'pitch manipulation'],
      drums: ['off-center percussion'],
      bass: ['distorted bass'],
      arrangement: ['unexpected silence', 'abrupt arrangement changes'],
      avoid: ['weirdness for its own sake'],
    },
  },
  {
    id: 'p13', number: 13, name: 'RAW SILK', group: 'owner', internal: false,
    essence:
      'Organic modern soul with imperfect drums, close-miked guitar, warm bass, loose piano or Rhodes and human room texture. Intimate, messy and tactile. Avoid over-quantizing. Sounds like musicians discovering the song together in the studio.',
    foundation: 'Carter Lang × Dijon',
    sound: {
      dna: 'organic modern soul, intimate, messy and tactile, musicians discovering the song together',
      instruments: ['close-miked guitar', 'loose piano or Rhodes', 'human room texture'],
      drums: ['imperfect drums'],
      bass: ['warm bass'],
      avoid: ['over-quantizing'],
    },
  },
  {
    id: 'p14', number: 14, name: 'HITMAKER J', group: 'owner', internal: false,
    essence:
      'Hook-first R&B/hip-hop with clean bouncing drums, memorable keyboard motifs, warm bass and simple chord movement. Immediate groove, strong chorus lift and commercial song structure. Fun, sharp and built for replay.',
    foundation: 'Jermaine Dupri × Hit-Boy',
    sound: {
      dna: 'hook-first R&B/hip-hop, fun, sharp and built for replay',
      instruments: ['memorable keyboard motifs', 'simple chord movement'],
      drums: ['clean bouncing drums'],
      bass: ['warm bass'],
      arrangement: ['immediate groove', 'strong chorus lift', 'commercial song structure'],
    },
  },
  {
    id: 'p15', number: 15, name: 'AFTERGLOW', group: 'owner', internal: false,
    essence:
      'Soulful sample-based hip-hop fused with modern trap drums. Warm chopped vocals, pitched soul fragments, emotional piano, thick 808s and crisp hats. Nostalgic harmony with contemporary low-end impact.',
    foundation: 'Kanye West × Metro Boomin',
    sound: {
      dna: 'soulful sample-based hip-hop fused with modern trap drums, nostalgic harmony',
      instruments: ['warm chopped vocals', 'pitched soul fragments', 'emotional piano'],
      drums: ['modern trap drums', 'crisp hats'],
      bass: ['thick 808s', 'contemporary low-end impact'],
    },
  },
  {
    id: 'p16', number: 16, name: 'THE MAESTRO', group: 'owner', internal: false,
    essence:
      'Musically rich hip-hop with sophisticated harmony, real instrumentation and hard foundational drums. Piano, strings, horns, bass guitar and tasteful orchestration should interact with gritty rhythmic elements. Elegant without becoming theatrical.',
    foundation: 'Quincy Jones × DJ Premier',
    sound: {
      dna: 'musically rich hip-hop with sophisticated harmony, elegant',
      instruments: ['piano', 'strings', 'horns', 'tasteful orchestration', 'gritty rhythmic elements'],
      drums: ['hard foundational drums'],
      bass: ['bass guitar'],
      avoid: ['theatrics'],
    },
  },
  {
    id: 'p17', number: 17, name: 'SOUL RUNNER', group: 'owner', internal: false,
    essence:
      'Soul-sample hip-hop with Southern movement. Chopped gospel or soul textures, swinging drums, warm bass and modern 808 reinforcement. Emotional musicality on top, street rhythm underneath. Melodic but still knocks.',
    foundation: '9th Wonder × London on da Track',
    sound: {
      dna: 'soul-sample hip-hop with Southern movement, emotional on top, street rhythm underneath, melodic but still knocks',
      instruments: ['chopped gospel or soul textures'],
      drums: ['swinging drums'],
      bass: ['warm bass', 'modern 808 reinforcement'],
    },
  },
  {
    id: 'p38', number: 38, name: 'STREETRUNNERZ', group: 'owner', internal: false,
    essence:
      'Dramatic soulful street hip-hop with hard drums, emotional piano, chopped vocal textures, orchestral accents and dark cinematic undertones. Big emotional lift without losing the grime. Built for powerful storytelling and anthemic hooks.',
    sound: {
      dna: 'dramatic soulful street hip-hop with dark cinematic undertones, built for storytelling',
      instruments: ['emotional piano', 'chopped vocal textures', 'orchestral accents'],
      drums: ['hard drums'],
      arrangement: ['big emotional lift', 'anthemic hooks'],
      avoid: ['losing the grime'],
    },
  },
  {
    id: 'p39', number: 39, name: 'VELVET ARCHITECT', group: 'owner', internal: false,
    essence:
      'Cinematic luxury soul built around live bass, warm strings, jazz-influenced piano chords, expressive horns and lush R&B instrumentation. Slow dynamic development, elegant transitions and rich harmonic movement. Grand and emotional while leaving the lead vocal completely exposed.',
    sound: {
      dna: 'cinematic luxury soul, grand and emotional',
      instruments: ['warm strings', 'jazz-influenced piano chords', 'expressive horns', 'lush R&B instrumentation'],
      bass: ['live bass'],
      arrangement: ['slow dynamic development', 'elegant transitions', 'rich harmonic movement'],
      mix: ['lead vocal completely exposed'],
    },
  },
  {
    id: 'p46', number: 46, name: 'THE STORYTELLER', group: 'owner', internal: false,
    essence:
      'Mature, soulful animated-film musical architecture with emotional melodies, theatrical harmony, rhythmic storytelling, orchestral movement and huge cinematic finales.',
    foundation: 'Alan Menken × Lin-Manuel Miranda',
    sound: {
      dna: 'mature, soulful animated-film musical, theatrical harmony, rhythmic storytelling',
      instruments: ['orchestral movement', 'emotional melodies'],
      arrangement: ['huge cinematic finale'],
    },
  },
  {
    id: 'p47', number: 47, name: 'THE WONDERMAKER', group: 'owner', internal: false,
    essence:
      'Bright children’s animated-musical energy with playful orchestration, sing-along hooks, funny character moments, magical transitions and uplifting finales.',
    foundation: 'Alan Menken × Robert Lopez',
    sound: {
      dna: 'bright children’s animated-musical energy',
      instruments: ['playful orchestration', 'magical transitions'],
      arrangement: ['sing-along hooks', 'funny character moments', 'uplifting finale'],
      mode: 'major',
    },
  },
  {
    id: 'p48', number: 48, name: 'HAVANA HEAT', group: 'owner', internal: false,
    essence:
      'Cuban salsa and timba: piano montunos, tumbao bass, Afro-Cuban percussion, brass punches, call-and-response and explosive gear changes.',
    foundation: 'Emilio Estefan × Juan Formell',
    sound: {
      dna: 'Cuban salsa and timba',
      instruments: ['piano montunos', 'brass punches'],
      drums: ['Afro-Cuban percussion'],
      bass: ['tumbao bass'],
      arrangement: ['call-and-response', 'explosive gear changes'],
    },
  },
  {
    id: 'p49', number: 49, name: 'SALSA ROYALE', group: 'owner', internal: false,
    essence:
      'Straight salsa: piano montunos, tumbao bass, congas, bongos, timbales, brass, coro/pregón and a steady dance-floor swing.',
    foundation: 'Sergio George × Willie Colón',
    sound: {
      dna: 'straight salsa with a steady dance-floor swing',
      instruments: ['piano montunos', 'brass'],
      drums: ['congas, bongos and timbales'],
      bass: ['tumbao bass'],
      arrangement: ['coro and pregón'],
    },
  },
  {
    id: 'p61', number: 61, name: 'THE CHARMER', tagline: 'from "The One" — smooth 90s R&B love-song sample flips', group: 'owner', internal: false,
    essence:
      'Smooth sample-based hip-hop built from 90s R&B love songs: sweet female vocal harmonies and soft keys as the emotional spine, the dug hook woven through a warm confident groove. Modern clean drums with punchy kick, soft cracking snare, and steady hats; warm round bass that follows the sample. Polished, glossy, romantic but never soft — slow-jam DNA rebuilt for a rapper, with open verses and a sweeter hook lift. Every track digs a different love song and finds a new pocket. No trap rolls, no dark menace, no dusty grit.',
    sound: {
      dna: 'smooth sample-based hip-hop built from 90s R&B love songs, polished, glossy, romantic but never soft',
      instruments: ['sweet female vocal harmonies', 'soft keys', 'a dug love-song hook'],
      drums: ['modern clean drums', 'punchy kick', 'soft cracking snare', 'steady hats'],
      bass: ['warm round bass that follows the sample'],
      arrangement: ['open verses', 'sweeter hook lift'],
      avoid: ['trap rolls', 'dark menace', 'dusty grit'],
    },
  },
  {
    id: 'p62', number: 62, name: 'THE RELIC', tagline: 'from "James Freestyle" — vintage-sampler old-school purist', group: 'owner', internal: false,
    essence:
      "Raw boom-bap made like it came off a vintage hardware sampler. Chopped obscure 1970s/80s funk-soul records, grainy and warm, with the old machine's grit left in the chops. Hard dry drums with swing: punchy kick, cracking snare on the backbeat, no polish. Bass often pulled from the same record. Minimal, relentless freestyle pocket — all knock, no frills. Every track starts from a different forgotten record and a fresh chop pattern. No modern sheen, no trap rolls, no pop gloss.",
    sound: {
      dna: 'raw boom-bap made on a vintage hardware sampler, minimal, relentless freestyle pocket',
      instruments: ['grainy chopped 1970s/80s funk-soul records', 'machine grit left in the chops'],
      drums: ['hard dry drums with swing', 'punchy kick', 'cracking backbeat snare'],
      bass: ['bass pulled from the same record'],
      avoid: ['modern sheen', 'trap rolls', 'pop gloss'],
    },
  },
  {
    id: 'p63', number: 63, name: 'THE PREACHER', tagline: 'from "Mission Statement" — haunting looped-voice conscience beats', group: 'owner', internal: false,
    essence:
      'Modern loop-based hip-hop built around one haunting chopped vocal phrase that loops like a conscience and sets the tone from the first second. Sparse dark piano around the loop, deep simple bass, modern minimal drums — hard kick, sharp snare, restrained hats, lots of open space. Somber and hungry; short statement energy that hits and gets out. Every track finds a new vocal phrase and a new sparse bed under it. No bright party energy, no busy arrangement, no trap hat rolls.',
    sound: {
      dna: 'modern loop-based hip-hop, somber and hungry, hits and gets out',
      instruments: ['one haunting chopped vocal phrase looping like a conscience', 'sparse dark piano'],
      drums: ['modern minimal drums', 'hard kick', 'sharp snare', 'restrained hats'],
      bass: ['deep simple bass'],
      mix: ['lots of open space'],
      avoid: ['bright party energy', 'busy arrangement', 'trap hat rolls'],
    },
  },
  {
    id: 'p64', number: 64, name: 'THE TESTIFIER', tagline: 'from "This Can\'t Be Life" — pitched-up soul pain into celebration', group: 'owner', internal: false,
    essence:
      "Soul-sample hip-hop that pitches vintage soul voices up until pain and celebration live in the same loop. Urgent soaring singer over swelling strings, hard classic drums with swing (big punchy kick, cracking snare, gritty hats), warm rolling bass under the strings. Verses leave room to confess; hooks swell to the singer's full cry. Every track digs a different soul record and finds a new pitch/chop that still carries that triumph. No cold synths, no trap rolls, no empty gloss.",
    sound: {
      dna: 'soul-sample hip-hop where pain and celebration live in the same loop',
      instruments: ['vintage soul voices pitched up', 'urgent soaring sampled singer', 'swelling strings'],
      drums: ['hard classic drums with swing', 'big punchy kick', 'cracking snare', 'gritty hats'],
      bass: ['warm rolling bass under the strings'],
      arrangement: ['verses leave room to confess', 'hooks swell to a full cry'],
      avoid: ['cold synths', 'trap rolls', 'empty gloss'],
    },
  },
  {
    id: 'p65', number: 65, name: 'THE TROPHY', tagline: 'from "27 Summers" — victory-lap trap muscle under soul', group: 'owner', internal: false,
    essence:
      'Victory-lap hip-hop: trap muscle under soul. Deep confident 808 slides, hard snares, quick restrained hats, and a delicate piano or melodic line carrying tension — then a seamless flip into a triumphant soul-vocal sample section that keeps the same energy in new light, never a hard stop. Short blistering winning energy. Every track builds a new trap bed and digs a new soul flip. No dusty boom-bap drums, no gloomy minor-key mood, no jarring switch.',
    sound: {
      dna: 'victory-lap hip-hop, trap muscle under soul, short blistering winning energy',
      mode: 'major',
      instruments: ['delicate piano or melodic line carrying tension', 'triumphant soul-vocal sample section'],
      drums: ['hard snares', 'quick restrained hats'],
      bass: ['deep confident 808 slides'],
      arrangement: ['seamless flip into the soul section, never a hard stop'],
      avoid: ['dusty boom-bap drums', 'gloomy minor-key mood', 'jarring switch'],
    },
  },
  {
    id: 'p66', number: 66, name: 'THE DRUM MAJOR', tagline: 'from "Damage Control" — parade horns and marching-band drums', group: 'owner', internal: false,
    essence:
      'Marching-band hip-hop anthem: spirited blaring horns as fanfare, marching snare rolls and cadences under a hard punchy kick and cracking snare, simple driving bass that keeps the march moving. Verses leave room for rappers trading bars; hooks explode with the full horn section. Stadium energy, street-parade soul. Every track writes a new horn line and a new cadence pattern. No dark brooding, no trap minimalism, no quiet moments.',
    sound: {
      dna: 'marching-band hip-hop anthem, stadium energy, street-parade soul',
      instruments: ['spirited blaring horn fanfare'],
      drums: ['marching snare rolls and cadences', 'hard punchy kick', 'cracking snare'],
      bass: ['simple driving bass that keeps the march moving'],
      arrangement: ['open verses', 'hooks explode with the full horn section'],
      avoid: ['dark brooding', 'trap minimalism', 'quiet moments'],
    },
  },
  {
    id: 'p67', number: 67, name: 'THE ARCHIVIST', tagline: 'crate-digging sample craftsman', group: 'owner', internal: false,
    essence:
      'Sample-first hip-hop producer who digs forgotten records and builds a fresh beat from whatever the crate gives that day — obscure soul, funk, 90s R&B, gospel, spoken word, or brass. Hardware-sampler grit or a clean modern flip, whichever serves the dig. Always leaves a clear pocket for a lead rapper. Signature moves he can reach for (never all at once): sweet R&B love-song flips, raw boom-bap chops, one haunting looped voice, pitched-up soul that turns pain into celebration, trap muscle under a soul flip, or parade horns with marching drums. Each Create is a new dig and a new beat; only the crate-digger ear stays the same. No stock loops, no copy-paste arrangement, no same sample twice.',
    sound: {
      dna: 'sample-first crate-digging hip-hop, a fresh beat from a forgotten record',
      instruments: ['one forgotten soul, funk, 90s R&B, gospel or brass record', 'hardware-sampler grit or a clean modern flip'],
      mix: ['clear pocket for the lead vocal'],
      avoid: ['stock loops', 'copy-paste arrangement'],
    },
  },

  // ─────────────────────── Internal lanes (35) ───────────────────────
  // Lane labels only. The sound fields describe the sound in plain words.
  {
    id: 'p18', number: 18, name: 'DR. DRE', group: 'internal', internal: true,
    essence:
      'Monumental minimalist hip-hop. Huge dry drums, deep precise bass, sparse piano or synth motifs, subtle orchestral tension and ruthless use of silence. Every sound should hit hard and clean. Wide stereo image, powerful low end and almost no clutter.',
    sound: {
      dna: 'monumental minimalist hip-hop, every sound hits hard and clean',
      instruments: ['sparse piano or synth motifs', 'subtle orchestral tension'],
      drums: ['huge dry drums'],
      bass: ['deep precise bass', 'powerful low end'],
      mix: ['ruthless use of silence', 'wide stereo image', 'almost no clutter'],
    },
  },
  {
    id: 'p19', number: 19, name: 'PHARRELL', group: 'internal', internal: true,
    essence:
      'Playful minimalist funk and hip-hop with unusual syncopation. Dry punchy drums, rubbery bass, clipped guitar, quirky keyboard sounds, hand percussion and unexpected rhythmic gaps. Bright, youthful and instantly physical without relying on huge instrumentation.',
    sound: {
      dna: 'playful minimalist funk and hip-hop, bright, youthful and instantly physical',
      instruments: ['clipped guitar', 'quirky keyboard sounds', 'hand percussion'],
      drums: ['dry punchy drums', 'unusual syncopation', 'unexpected rhythmic gaps'],
      bass: ['rubbery bass'],
      avoid: ['huge instrumentation'],
    },
  },
  {
    id: 'p20', number: 20, name: 'DJ QUIK', group: 'internal', internal: true,
    essence:
      'Musical West Coast funk with swinging drums, elastic bass guitar, warm electric piano, talkbox-like synth colors, bright percussion and jazzy chord movement. Smooth enough to cruise to but rhythmically sophisticated underneath.',
    sound: {
      dna: 'musical West Coast funk, smooth enough to cruise to, rhythmically sophisticated',
      instruments: ['warm electric piano', 'talkbox-like synth colors', 'bright percussion', 'jazzy chord movement'],
      drums: ['swinging drums'],
      bass: ['elastic bass guitar'],
    },
  },
  {
    id: 'p21', number: 21, name: 'DJ PREMIER', group: 'internal', internal: true,
    essence:
      'Raw sample-driven boom-bap with chopped jazz or soul fragments, hard swinging kick and snare, gritty texture and short musical loops. Sparse bass and strategic turntable-style cuts. Tough, hypnotic and rhythmically precise.',
    sound: {
      dna: 'raw sample-driven boom-bap, tough, hypnotic and rhythmically precise',
      instruments: ['chopped jazz or soul fragments', 'short musical loops', 'turntable-style cuts', 'gritty texture'],
      drums: ['hard swinging kick and snare'],
      bass: ['sparse bass'],
    },
  },
  {
    id: 'p22', number: 22, name: 'QUINCY JONES', group: 'internal', internal: true,
    essence:
      'Rich live arrangement with sophisticated jazz and soul harmony. Real bass, piano, guitar, horns, strings and percussion arranged with discipline. Dynamic sections, counter-melodies and musical conversation between instruments. Lush but never overcrowded.',
    sound: {
      dna: 'rich live arrangement with sophisticated jazz and soul harmony, lush but never overcrowded',
      instruments: ['piano', 'guitar', 'horns', 'strings', 'counter-melodies'],
      drums: ['live percussion arranged with discipline'],
      bass: ['real bass'],
      arrangement: ['dynamic sections', 'instruments in musical conversation'],
    },
  },
  {
    id: 'p23', number: 23, name: '9TH WONDER', group: 'internal', internal: true,
    essence:
      'Warm soulful boom-bap built from chopped soul and gospel textures. Crunchy drums, emotional vocal samples, thick bass and simple hypnotic loops. Dusty and heartfelt with enough swing to feel human.',
    sound: {
      dna: 'warm soulful boom-bap, dusty and heartfelt',
      instruments: ['chopped soul and gospel textures', 'emotional vocal samples', 'simple hypnotic loops'],
      drums: ['crunchy drums with human swing'],
      bass: ['thick bass'],
    },
  },
  {
    id: 'p24', number: 24, name: 'DJ U-NEEK', group: 'internal', internal: true,
    essence:
      'Dark smoked-out melodic hip-hop with creeping basslines, eerie synths, melancholic chords and slow West Coast-influenced funk. Somber atmosphere with smooth musical movement underneath hard street drums. Haunting rather than horror-movie theatrical.',
    sound: {
      dna: 'dark smoked-out melodic hip-hop with slow West Coast funk, somber and haunting',
      instruments: ['eerie synths', 'melancholic chords'],
      drums: ['hard street drums'],
      bass: ['creeping basslines'],
      avoid: ['horror-movie theatrics'],
    },
  },
  {
    id: 'p25', number: 25, name: 'CARTER LANG', group: 'internal', internal: true,
    essence:
      'Warm contemporary soul with organic drums, live bass, textured keyboards, subtle guitar, dusty ambience and adventurous chord movement. Detailed but understated. Modern musicianship with homemade texture and deep pocket.',
    sound: {
      dna: 'warm contemporary soul, detailed but understated, homemade texture',
      instruments: ['textured keyboards', 'subtle guitar', 'dusty ambience', 'adventurous chord movement'],
      drums: ['organic drums', 'deep pocket'],
      bass: ['live bass'],
    },
  },
  {
    id: 'p26', number: 26, name: 'DIJON', group: 'internal', internal: true,
    essence:
      'Raw intimate alternative soul. Loose drums, distorted room sound, imperfect guitar, piano, strange microphone textures and spontaneous arrangement changes. Emotional and tactile. Keep mistakes, breaths and rough edges rather than polishing them away.',
    sound: {
      dna: 'raw intimate alternative soul, emotional and tactile',
      instruments: ['imperfect guitar', 'piano', 'strange microphone textures', 'distorted room sound'],
      drums: ['loose drums'],
      arrangement: ['spontaneous arrangement changes'],
      mix: ['keep mistakes, breaths and rough edges'],
      avoid: ['over-polishing'],
    },
  },
  {
    id: 'p27', number: 27, name: 'JUST BLAZE', group: 'internal', internal: true,
    essence:
      'Huge triumphant hip-hop with aggressive drums, dramatic soul chops, powerful piano, brass or orchestral accents and explosive section changes. Stadium energy without losing grit. Builds should feel earned and choruses should feel massive.',
    sound: {
      dna: 'huge triumphant hip-hop, stadium energy without losing grit',
      instruments: ['dramatic soul chops', 'powerful piano', 'brass or orchestral accents'],
      drums: ['aggressive drums'],
      arrangement: ['explosive section changes', 'earned builds', 'massive choruses'],
    },
  },
  {
    id: 'p28', number: 28, name: 'JERMAINE DUPRI', group: 'internal', internal: true,
    essence:
      'Smooth, infectious R&B/hip-hop bounce with tight drum-machine grooves, warm bass, catchy keyboard riffs and simple memorable harmony. Strong rhythmic hooks, clean verses and obvious chorus lift. Built for radio and movement.',
    sound: {
      dna: 'smooth, infectious R&B/hip-hop bounce built for radio and movement',
      instruments: ['catchy keyboard riffs', 'simple memorable harmony'],
      drums: ['tight drum-machine grooves'],
      bass: ['warm bass'],
      arrangement: ['strong rhythmic hooks', 'clean verses', 'obvious chorus lift'],
    },
  },
  {
    id: 'p29', number: 29, name: 'TIMBALAND', group: 'internal', internal: true,
    essence:
      'Futuristic rhythm-first R&B with strange percussion, unexpected drum placement, vocal-like sound effects, deep bass and sparse atmospheric chords. Lots of empty space. The groove should feel slightly unpredictable while remaining impossible not to move to.',
    sound: {
      dna: 'futuristic rhythm-first R&B, slightly unpredictable groove that is impossible not to move to',
      instruments: ['vocal-like sound effects', 'sparse atmospheric chords'],
      drums: ['strange percussion', 'unexpected drum placement'],
      bass: ['deep bass'],
      mix: ['lots of empty space'],
    },
  },
  {
    id: 'p30', number: 30, name: 'HIT-BOY', group: 'internal', internal: true,
    essence:
      'Contemporary hip-hop that bridges soulful musicianship and modern drums. Hard kicks, sharp snares, warm bass, chopped textures, piano or synth motifs and arrangement changes that keep evolving. Clean, expensive and rapper/singer friendly.',
    sound: {
      dna: 'contemporary hip-hop bridging soulful musicianship and modern drums, clean and expensive',
      instruments: ['chopped textures', 'piano or synth motifs'],
      drums: ['hard kicks', 'sharp snares'],
      bass: ['warm bass'],
      arrangement: ['changes that keep evolving'],
    },
  },
  {
    id: 'p31', number: 31, name: 'MIKE WILL MADE-IT', group: 'internal', internal: true,
    essence:
      'Massive Southern melodic trap with booming 808s, sparse hypnotic melodies, hard claps, rolling hats and huge negative space. Simple musical idea, enormous low end and addictive bounce. Designed around a memorable rhythmic pocket.',
    sound: {
      dna: 'massive Southern melodic trap, simple musical idea, addictive bounce',
      instruments: ['sparse hypnotic melodies'],
      drums: ['hard claps', 'rolling hats', 'memorable rhythmic pocket'],
      bass: ['booming 808s', 'enormous low end'],
      mix: ['huge negative space'],
    },
  },
  {
    id: 'p32', number: 32, name: 'KANYE WEST', group: 'internal', internal: true,
    essence:
      'Bold sample-driven hip-hop with pitched soul textures, gospel harmony, unusual drum choices, emotional piano and fearless arrangement shifts. Combine raw imperfection with ambitious musical scale. Every section should introduce a new emotional angle.',
    sound: {
      dna: 'bold sample-driven hip-hop, raw imperfection at ambitious musical scale',
      instruments: ['pitched soul textures', 'gospel harmony', 'emotional piano'],
      drums: ['unusual drum choices'],
      arrangement: ['fearless arrangement shifts', 'each section a new emotional angle'],
    },
  },
  {
    id: 'p33', number: 33, name: 'LONDON ON DA TRACK', group: 'internal', internal: true,
    essence:
      'Melodic Atlanta trap with fluid 808 movement, airy keys, bell-like melodies, crisp hats and bouncy drums. Emotional chord progressions over energetic low end. Smooth enough for R&B vocals but still unmistakably Southern.',
    sound: {
      dna: 'melodic Atlanta trap, smooth enough for R&B vocals, unmistakably Southern',
      instruments: ['airy keys', 'bell-like melodies', 'emotional chord progressions'],
      drums: ['crisp hats', 'bouncy drums'],
      bass: ['fluid 808 movement'],
    },
  },
  {
    id: 'p34', number: 34, name: 'BOI-1DA', group: 'internal', internal: true,
    essence:
      'Dark spacious contemporary hip-hop with hard punchy drums, controlled 808s, haunting melodic fragments, atmospheric pads and restrained arrangement. Strong knock without excess layers. Moody, modern and very vocal-friendly.',
    sound: {
      dna: 'dark spacious contemporary hip-hop, moody, modern and very vocal-friendly',
      instruments: ['haunting melodic fragments', 'atmospheric pads'],
      drums: ['hard punchy drums with strong knock'],
      bass: ['controlled 808s'],
      arrangement: ['restrained arrangement'],
      avoid: ['excess layers'],
    },
  },
  {
    id: 'p35', number: 35, name: "D'MILE", group: 'internal', internal: true,
    essence:
      'Sophisticated modern R&B and soul with live drums, rich bass guitar, Rhodes, subtle guitar, layered harmony and beautiful chord extensions. Deep pocket, classic musicianship and contemporary sonic detail. Romantic without becoming sugary.',
    sound: {
      dna: 'sophisticated modern R&B and soul, classic musicianship, contemporary detail',
      instruments: ['Rhodes', 'subtle guitar', 'layered harmony', 'beautiful chord extensions'],
      drums: ['live drums', 'deep pocket'],
      bass: ['rich bass guitar'],
      avoid: ['sugary sweetness'],
    },
  },
  {
    id: 'p37', number: 37, name: 'DJ MUSTARD', group: 'internal', internal: true,
    essence:
      'Minimal West Coast club bounce. Snappy claps, simple aggressive kicks, bouncing bass, bright repetitive keyboard motif and lots of open space. Extremely simple on purpose. Immediate rhythm, infectious repetition and strong dance-floor movement.',
    sound: {
      dna: 'minimal West Coast club bounce, extremely simple on purpose, strong dance-floor movement',
      instruments: ['bright repetitive keyboard motif'],
      drums: ['snappy claps', 'simple aggressive kicks'],
      bass: ['bouncing bass'],
      mix: ['lots of open space'],
    },
  },
  {
    id: 'p40', number: 40, name: 'SCOTT STORCH', group: 'internal', internal: true,
    essence: 'Single producer. Piano-led melodies, dramatic chord progressions, crisp drums and glossy hip-hop/R&B production.',
    sound: {
      dna: 'glossy hip-hop/R&B production',
      instruments: ['piano-led melodies', 'dramatic chord progressions'],
      drums: ['crisp drums'],
    },
  },
  {
    id: 'p41', number: 41, name: 'THE ALCHEMIST', group: 'internal', internal: true,
    essence: 'Single producer. Dusty loops, grimy textures, unusual samples, hypnotic repetition and understated drums.',
    sound: {
      dna: 'dusty, grimy loop-based hip-hop with hypnotic repetition',
      instruments: ['dusty loops', 'grimy textures', 'unusual samples'],
      drums: ['understated drums'],
    },
  },
  {
    id: 'p42', number: 42, name: 'COOL & DRE', group: 'internal', internal: true,
    essence: 'Production team. Cinematic Miami rap, soulful melodies, big drums and polished street records.',
    sound: {
      dna: 'cinematic Miami rap, polished street record',
      instruments: ['soulful melodies'],
      drums: ['big drums'],
    },
  },
  {
    id: 'p43', number: 43, name: 'INFAMOUS', group: 'internal', internal: true,
    essence: 'Single producer. Dark cinematic hip-hop, moody keys, hard drums and dramatic atmosphere.',
    sound: {
      dna: 'dark cinematic hip-hop with dramatic atmosphere',
      instruments: ['moody keys'],
      drums: ['hard drums'],
    },
  },
  {
    id: 'p44', number: 44, name: 'SCOOP DEVILLE', group: 'internal', internal: true,
    essence: 'Single producer. Hard West Coast drums, sample flips, funky bass and aggressive bounce.',
    sound: {
      dna: 'aggressive West Coast bounce',
      instruments: ['sample flips'],
      drums: ['hard West Coast drums'],
      bass: ['funky bass'],
    },
  },
  {
    id: 'p45', number: 45, name: '1500 OR NOTHIN’', group: 'internal', internal: true,
    essence: 'Production band. Live-band hip-hop/R&B, strong musicianship, big arrangements and gospel/funk/soul energy.',
    sound: {
      dna: 'live-band hip-hop/R&B with gospel, funk and soul energy',
      instruments: ['full live band', 'strong musicianship'],
      arrangement: ['big arrangements'],
    },
  },
  {
    id: 'p50', number: 50, name: 'BRYAN-MICHAEL COX', group: 'internal', internal: true,
    essence:
      'Single producer. Polished emotional R&B with piano, sophisticated progressions, clean drums, lush vocal space, strong bridges and radio-ready slow-to-midtempo production.',
    sound: {
      dna: 'polished emotional R&B, radio-ready slow-to-midtempo',
      instruments: ['piano', 'sophisticated progressions'],
      drums: ['clean drums'],
      arrangement: ['strong bridge'],
      mix: ['lush vocal space'],
    },
  },
  {
    id: 'p51', number: 51, name: 'VELVET PULSE', group: 'internal', internal: true,
    essence:
      'Neo-soul × house × R&B: swung dance architecture, warm chords, live-feeling bass, soulful keys, glossy texture and deep pocket.',
    foundation: 'Kaytranada × D’Mile',
    sound: {
      dna: 'neo-soul meets house and R&B, swung dance architecture',
      instruments: ['warm chords', 'soulful keys', 'glossy texture'],
      drums: ['swung dance groove', 'deep pocket'],
      bass: ['live-feeling bass'],
    },
  },
  {
    id: 'p52', number: 52, name: 'FOURTH QUARTER', group: 'internal', internal: true,
    essence:
      'Southern trap × drumline: huge 808s, marching snares, bass-drum cadences, brass punches, chants, call-and-response and halftime momentum.',
    foundation: 'Mike WiLL Made-It × Drumma Boy',
    sound: {
      dna: 'Southern trap meets drumline, halftime momentum',
      instruments: ['brass punches', 'chants'],
      drums: ['marching snares', 'bass-drum cadences'],
      bass: ['huge 808s'],
      arrangement: ['call-and-response'],
    },
  },
  {
    id: 'p53', number: 53, name: 'BLUE FLAME', group: 'internal', internal: true,
    essence:
      'Raw blues guitar and amp grit lead the architecture; warm soul bass and a deep R&B pocket add body and movement.',
    foundation: 'Dan Auerbach × Raphael Saadiq',
    sound: {
      dna: 'raw blues guitar leads over a deep R&B pocket',
      instruments: ['raw blues guitar with amp grit'],
      drums: ['deep R&B pocket'],
      bass: ['warm soul bass'],
    },
  },
  {
    id: 'p54', number: 54, name: 'PRESSURE POINT', group: 'internal', internal: true,
    essence:
      'Hard trap drums and heavy 808s lead the architecture; memorable melodic phrases and bigger hook moments add scale.',
    foundation: 'Southside × Mike WiLL Made-It',
    sound: {
      dna: 'hard trap with memorable melodic phrases',
      instruments: ['memorable melodic phrases'],
      drums: ['hard trap drums'],
      bass: ['heavy 808s'],
      arrangement: ['bigger hook moments add scale'],
    },
  },
  {
    id: 'p55', number: 55, name: 'THE SLOW BURN', group: 'internal', internal: true,
    essence:
      'Emotional piano and grown R&B songcraft lead the architecture; rich chord voicings and a live-feeling groove add depth.',
    foundation: 'Bryan-Michael Cox × D’Mile',
    sound: {
      dna: 'emotional piano-led grown R&B songcraft',
      instruments: ['emotional piano', 'rich chord voicings'],
      drums: ['live-feeling groove'],
    },
  },
  {
    id: 'p56', number: 56, name: 'BARE WIRE', group: 'internal', internal: true,
    essence:
      'Super-minimal R&B for heavy, stripped-down R&B and blues songs. Wide-open vocal space leads; a few gritty, aching blues guitar notes add raw texture.',
    foundation: 'D’Mile × Dan Auerbach',
    sound: {
      dna: 'super-minimal, stripped-down R&B and blues',
      instruments: ['a few gritty, aching blues guitar notes'],
      drums: ['sparse, minimal pulse'],
      mix: ['wide-open vocal space leads'],
    },
  },
  {
    id: 'p57', number: 57, name: 'BLUE PRESSURE', group: 'internal', internal: true,
    essence:
      'Trap blues for anger, grief, and holding-it-together nights. Slow heavy 808s, hard kicks, and sparse drums carry one gritty bent-note guitar riff with worn amp noise. Keep it lean: no busy hi-hats, no long solo, and open upper-midrange space for bright tenor and falsetto.',
    foundation: 'Mike WiLL Made-It × Dan Auerbach',
    sound: {
      dna: 'lean trap blues for anger, grief and holding-it-together nights',
      instruments: ['one gritty bent-note guitar riff with worn amp noise'],
      drums: ['hard kicks', 'sparse drums'],
      bass: ['slow heavy 808s'],
      mix: ['open upper-midrange space for bright vocals and falsetto'],
      avoid: ['busy hi-hats', 'long solo'],
    },
  },
  {
    id: 'p59', number: 59, name: 'STARGATE x CARTER LANG', group: 'internal', internal: true,
    essence:
      'Scandinavian pop-R&B precision warmed by homemade soul. Clean melodic architecture, glossy chords, and sharp song structure fused with organic drums, dusty ambience, textured keys, and deep pocket. Polished but unmistakably human.',
    foundation: 'Stargate × Carter Lang',
    sound: {
      dna: 'Scandinavian pop-R&B precision warmed by homemade soul, polished but human',
      instruments: ['glossy chords', 'textured keys', 'dusty ambience'],
      drums: ['organic drums', 'deep pocket'],
      arrangement: ['clean melodic architecture', 'sharp song structure'],
    },
  },
  {
    id: 'p60', number: 60, name: 'DR. DRE x 9TH WONDER', group: 'internal', internal: true,
    essence:
      'Monumental minimalism with a dusty soul heart. Huge dry drums, deep precise bass, and ruthless use of silence under chopped soul and gospel textures, crunchy swing, and emotional vocal fragments. Sparse, hard-hitting, and heartfelt — every sound earns its place.',
    foundation: 'Dr. Dre × 9th Wonder',
    sound: {
      dna: 'monumental minimalism with a dusty soul heart, sparse, hard-hitting and heartfelt',
      instruments: ['chopped soul and gospel textures', 'emotional vocal fragments'],
      drums: ['huge dry drums', 'crunchy swing'],
      bass: ['deep precise bass'],
      mix: ['ruthless use of silence'],
    },
  },
];

export function findPersona(id?: string): ProducerPersona | undefined {
  if (!id) return undefined;
  return PRODUCER_PERSONAS.find((x) => x.id === id);
}

export function getPersona(id: string): ProducerPersona {
  const p = findPersona(id);
  if (!p) throw new Error(`Unknown producer persona: ${id}`);
  return p;
}

export function personaLabel(p: ProducerPersona): string {
  return p.number === null ? p.name : `#${p.number} ${p.name}`;
}
