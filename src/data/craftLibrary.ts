/**
 * Complete Songwriting Craft Library
 *
 * Houses the user's personal songwriting rulebooks and craft frameworks:
 *   - 39 Songwriting Perspectives
 *   - 80 Storytelling Styles for Songs (combinable)
 *   - 30 Advanced Songwriting Techniques (8 Core Priority Weapons + Liquid Legend Rule)
 *   - Rap Flow Modes (Rhythm Weaver, Chopper, Torrent, Conversational Pocket, Melodic Rap)
 *   - Master Rap Rulebook, R&B Songwriting Rulebook, Hit-Making Checklist, & Flow/Poetics levers
 */

export interface CraftGroup {
  id: string;
  label: string;
}

export interface SongPerspective {
  id: string;
  label: string;
  group: 'core' | 'time' | 'role' | 'nonhuman';
  description: string;
  example?: string;
}

export interface StorytellingStyle {
  id: string;
  number: number;
  label: string;
  group: 'timeline' | 'twist' | 'dialogue' | 'montage' | 'arc' | 'pov' | 'genre';
  description: string;
}

export interface AdvancedTechnique {
  id: string;
  label: string;
  priority: boolean;
  description: string;
  example: string;
}

export interface RapFlowMode {
  id: string;
  label: string;
  tagline: string;
  promptRule: string;
  verse1Cue: string;
  verse2Cue: string;
  aceVerse1Cue: string;
  aceVerse2Cue: string;
}

// ─────────────────────────── Core Master Rules ───────────────────────────

export const HIT_SONG_RULE =
  'THE HIT SONG RULE: Make the verses impressive, but make the hook unforgettable. Answer before drafting: "What is the one line I want somebody singing or repeating to themselves tomorrow?"';

export const LIQUID_LEGEND_RULE =
  'THE LIQUID LEGEND RULE: At least one word, object, location, phrase, hook, memory, name, or image must mean something different by the end of the song than it did at the beginning.';

export const RAP_GOLDEN_RULE =
  'GOLDEN RULE: Meaning comes first, always. A great rhyme that says nothing is a bad bar.';

export const RNB_NON_NEGOTIABLE_RULE =
  'NON-NEGOTIABLE R&B RULE: Include at least one unforgettable replay moment where melody, words, and vocal delivery fuse so cleanly that the listener rewinds for that exact moment.';

export const HIT_MAKING_CHECKLIST: readonly string[] = [
  'Strong, memorable chorus that arrives early enough',
  'Clear energy contrast between sections',
  'Three choruses (or equivalent hook repetitions)',
  'Title placed effectively (usually in the chorus)',
  'Verses that advance the idea instead of repeating',
  'Rhyme scheme that supports melody and flow',
  'Total length in the commercial sweet spot (~2:50–3:40)',
  'Something catchy appearing frequently (hook density)',
  'Every section serves a clear purpose',
  'Emotional journey feels continuous and intentional',
];

export const HIT_SONG_QUESTIONS: readonly string[] = [
  'Does it have a chorus that people remember?',
  'Does it have a melody that people hum?',
  'Does it have a hook that people quote?',
  'Does it have a story that people relate to?',
  'Does it have a feeling that people feel?',
];

export const RAP_QUALITY_CHECKLIST: readonly string[] = [
  'Every bar makes conversational sense and moves the story or argument forward',
  'Each 16-bar verse has a complete beginning (establish), middle (develop), and end (land) arc',
  'Thoughts connect naturally across bar lines via enjambment (no predictable end-stop 4-bar cadence)',
  'Internal and slant rhymes feel natural without sounding forced (~90/10 slant-to-perfect target)',
  'Cadence shifts organically where the beat and emotion call for it',
  'Every syllable is realistically performable by a human voice with natural breath pockets',
  'Writing stays sharply focused on one clear idea, emotion, and persona',
  'Zero filler, clichés, fake toughness, corny GOAT boasts, or empty punchlines',
  'Verses are impressive and the chorus/hook is unforgettable on first listen',
];

export const RNB_REPLAY_CHECKLIST: readonly string[] = [
  'Melody leads and passes the hum test (still works with just a piano)',
  'Phrasing is effortlessly singable — open vowels (ah, oh, ay, oo) on held notes, zero tongue-twisters',
  'Vocal rides inside the groove with deliberate space and restraint',
  'Chorus feels like an emotional release after verse tension and stays stuck in your head',
  'Runs and melisma are intentional and land on words that matter (less is more)',
  'Harmonies have purpose: lead tells the story, BGVs add warmth/lift, ad-libs add freedom in gaps',
  'Contains at least one unforgettable replay moment with simple, direct, honest language',
];

export const RAP_RULEBOOK_PROMPT = [
  'MASTER RAP WRITING RULEBOOK:',
  `- ${RAP_GOLDEN_RULE} Every 4 bars must advance the story, argument, or emotion; verses must make conversational sense even with rhymes removed.`,
  '- Treat 16 Bars as the Core of the Craft: every verse is one complete thought with a clear beginning (establish the idea), middle (develop it), and end (land it) — never a random pile of disconnected bars.',
  '- Keep Focus Sharp & Chorus Memorable: a song should be about one clear idea, message, emotion, and voice; deliver the chorus with maximum impact so people remember, quote, and replay it, targeting the ~2:50–3:40 commercial sweet spot.',
  '- Rhyme Engine: aim for roughly 90% slant rhymes / 10% perfect rhymes, dense multisyllabic chains, 3+ meaningful internal rhymes per bar when flow calls for density, assonance/consonance carried across bars, triplet chains, and semantic rhyme clustering where rhymed words converse in meaning.',
  '- Connected Sentences & Enjambment: run thoughts cleanly across bar lines; avoid predictable end-stop 4-bar rhyme-and-stop patterns; mix short punch statements inside long run-on thoughts.',
  '- Dynamic Cadence & Flow Levers: vary rhyme placement (early, mid-bar, delayed, across bars), accent placement (on-beat for action lines, syncopated for conflicted inner-state lines), syllable density, and rests. Sound like natural speech with extraordinary rhythm.',
  '- Wordplay & Poetic Turn: homophones, mirror lines, double meanings, and callbacks must earn their place (zero word salad). Break dense rhyme patterns right before the closing 2–4 lines of a verse for a stark poetic turn.',
  '- Never number bars, never write generic fake toughness, corny GOAT boasts, empty rhyme stacking, repeated sentence templates, or unnecessary filler intros.',
].join('\n');

export const RNB_RULEBOOK_PROMPT = [
  'THE R&B SONGWRITING RULEBOOK:',
  '- Melody Leads, Lyrics Follow: melody, emotion, groove, and vocal delivery carry R&B. Build a hook-first chorus that passes the hum test and works with just a piano; never force clever words onto a melody that wants to be simple.',
  '- Prioritize Singable Phrasing Over Clever Writing: R&B is sung, not spoken. Do NOT force dense rap multisyllabic chains into sung lines. Avoid tongue-twisters and awkward consonant clusters; favor open vowels (ah, oh, ay, oo) on sustained notes and leave room to breathe.',
  '- Make the Groove the Engine: live in the pocket. Sing inside the beat with slight late entries, stretched phrases, silence, and restraint — never crowd the pocket.',
  '- Build Around Moments & Emotional Conflict: anchor the song in one specific emotional conflict and a single replayable moment (a look, touch, goodbye, return). The verse sets up the moment and holds tension; the chorus lives in it and feels like emotional release.',
  '- Let the Voice Carry the Emotion: dynamics are emotion (whisper vs. belt, breath, vibrato, an honest crack, letting a note linger). Never write every line at full intensity.',
  '- Use Runs & Melisma With Intention: runs are emotion in motion, not decoration. Save them for words that matter; one perfect run beats ten forgettable ones.',
  '- Use Harmonies With Purpose & Let the Song Grow: Lead vocal = the story; Background vocals = warmth, support, and lift; Ad-libs = freedom and spontaneity in the gaps. Grow dynamically from Chorus 1 (restrained) → Chorus 2 (fuller harmonies) → Final Chorus (exposed or peaking).',
  '- Simple, Direct, Emotionally Honest Language: zero dictionary metaphors or stiff poetic clichés; write lines someone would actually say with concrete visual details ("I still make enough coffee for two").',
  `- ${RNB_NON_NEGOTIABLE_RULE}`,
].join('\n');

// ─────────────────────────── Rap Flow Modes ───────────────────────────

export const DEFAULT_FLOW_MODE_ID = 'rhythm-weaver';

export const RAP_FLOW_MODES: readonly RapFlowMode[] = [
  {
    id: 'rhythm-weaver',
    label: 'Rhythm Weaver',
    tagline: 'Elastic timing, enjambed thoughts, internal chains & unexpected pockets',
    promptRule:
      'FLOW MODE — RHYTHM WEAVER: Long connected thoughts stretched across bar lines, internal rhyme chains linking like an instrument, elastic timing that speeds up and slows down, unexpected pockets, occasional sharp bursts, and strong enunciation when the core message lands.',
    verse1Cue: '[elastic pocket, enjambed]',
    verse2Cue: '[rhythm weave, pocket shift]',
    aceVerse1Cue: '[Close-mic rap vocal weaving long enjambed thoughts across the pocket with internal slant rhymes]',
    aceVerse2Cue: '[Elastic cadence shifts speed mid-bar, pushing ahead then relaxing behind the snare]',
  },
  {
    id: 'chopper',
    label: 'Chopper (Controlled Bursts)',
    tagline: 'Crisp 2–4 bar speed bursts followed by heavy breathing room',
    promptRule:
      'FLOW MODE — CHOPPER: Deliver controlled rapid-fire runs lasting 2 to 4 bars with crisp plosive consonants and linked syllables, followed immediately by breathing room or a heavier, slower anchor line. Speed must preserve crystal-clear articulation and meaning.',
    verse1Cue: '[crisp chopper bursts]',
    verse2Cue: '[rapid burst, heavy drop]',
    aceVerse1Cue: '[Sharp 2-to-4-bar double-time bursts with crisp consonants followed by slow, heavy breathing room]',
    aceVerse2Cue: '[Sudden rapid-fire acceleration snaps back into deliberate, hard-hitting anchor lines]',
  },
  {
    id: 'torrent',
    label: 'Torrent (Sustained Speed)',
    tagline: 'Sustained 16–20 syllables/bar, dense internals, no planned recovery bars',
    promptRule:
      'FLOW MODE — TORRENT: Sustained maximum-speed delivery around 16 to 20 syllables per bar with dense multisyllabic internal chains, connected run-on sentences, and no planned recovery bars throughout the main verse run. Maintain sharp enunciation, rhythm, and real meaning throughout.',
    verse1Cue: '[sustained torrent, dense]',
    verse2Cue: '[relentless torrent flow]',
    aceVerse1Cue: '[Sustained rapid-fire torrent delivery, 16–20 syllables per bar with crisp articulation and zero wasted words]',
    aceVerse2Cue: '[Unbroken high-velocity internal rhyme stream driving straight through the bar lines]',
  },
  {
    id: 'conversational-pocket',
    label: 'Conversational Storyteller',
    tagline: 'Behind-the-beat documentary realism, vivid scenes, relaxed authority',
    promptRule:
      'FLOW MODE — CONVERSATIONAL STORYTELLER: Relaxed, slightly behind-the-beat pocket with legato phrasing, reporter-over-commentator sensory detail, internal slant rhymes woven naturally into spoken syntax, and deliberate caesuras for emotional weight.',
    verse1Cue: '[laid-back, storytelling]',
    verse2Cue: '[close, conversational]',
    aceVerse1Cue: '[Relaxed, behind-the-beat storyteller pocket with vivid detail and natural spoken cadence]',
    aceVerse2Cue: '[Intimate documentary delivery leaning slightly behind the drum pocket with sharp enunciation]',
  },
  {
    id: 'melodic-rap',
    label: 'Melodic Rap / Half-Sung',
    tagline: 'Pitch-contoured cadence fusing rap rhythm with singable hooks',
    promptRule:
      'FLOW MODE — MELODIC RAP: Blend rhythmic hip-hop cadence with pitch-contoured, half-sung phrasing. Keep verses agile with slant internal rhymes while opening vowels and melodic lift in the pre-chorus and hook.',
    verse1Cue: '[melodic cadence, smooth]',
    verse2Cue: '[half-sung, rising pocket]',
    aceVerse1Cue: '[Pitch-contoured melodic rap pocket balancing rhythmic internal rhymes with smooth vowel glide]',
    aceVerse2Cue: '[Half-sung rap cadence climbing into an emotional, melodic lift before the chorus]',
  },
];

export function getFlowMode(id?: string): RapFlowMode {
  return RAP_FLOW_MODES.find((f) => f.id === id) ?? RAP_FLOW_MODES[0];
}

// ──────────────────────── 39 Songwriting Perspectives ────────────────────────

export const PERSPECTIVE_GROUPS: readonly CraftGroup[] = [
  { id: 'core', label: 'Core Narrative Voices' },
  { id: 'time', label: 'Time-Shifted Perspectives' },
  { id: 'role', label: 'Role, Moral & Relational' },
  { id: 'nonhuman', label: 'Non-Human & Epistolary' },
];

export const PERSPECTIVES: readonly SongPerspective[] = [
  // Core (13)
  {
    id: 'first-person',
    label: 'First person — "I"',
    group: 'core',
    description: 'The singer is living it. Best for confession, pain, flexing, regret, desire.',
    example: 'I watched you leave with my jacket on.',
  },
  {
    id: 'second-person',
    label: 'Second person — "you"',
    group: 'core',
    description: 'Talks directly to somebody. Confrontational and intimate.',
    example: 'You still call when your new love falls asleep.',
  },
  {
    id: 'third-person',
    label: 'Third person — "he/she/they"',
    group: 'core',
    description: "Tells somebody else's story. Great for cinematic storytelling.",
    example: 'She keeps his picture underneath the bed.',
  },
  {
    id: 'first-person-witness',
    label: 'First-person witness',
    group: 'core',
    description: 'The narrator is there, observing things the main character may not understand.',
    example: 'I used to see him shooting alone every night.',
  },
  {
    id: 'omniscient-narrator',
    label: 'Omniscient narrator',
    group: 'core',
    description: "Knows everybody's thoughts, secrets, and motives. Feels like a movie.",
    example: 'She thinks he forgot. He keeps her number memorized.',
  },
  {
    id: 'limited-third-person',
    label: 'Limited third person',
    group: 'core',
    description: 'Follows one character closely and shares only what they know.',
  },
  {
    id: 'unreliable-narrator',
    label: 'Unreliable narrator',
    group: 'core',
    description: 'Tells one version while subtle clues expose they are lying to themselves.',
    example: 'I never cared anyway, while every detail proves he did.',
  },
  {
    id: 'two-sided-perspective',
    label: 'Two-sided perspective',
    group: 'core',
    description: 'Verse 1 is one side, Verse 2 is the other; the chorus transforms after hearing both.',
  },
  {
    id: 'alternating-dialogue',
    label: 'Alternating dialogue',
    group: 'core',
    description: 'Works like a real-time conversation: one line speaks, the next answers.',
  },
  {
    id: 'collective-we',
    label: 'Collective — "we"',
    group: 'core',
    description: 'Speaks for a couple, family, neighborhood, team, generation, or community.',
    example: 'We learned to dream underneath those streetlights.',
  },
  {
    id: 'observer-camera',
    label: 'Observer / camera perspective',
    group: 'core',
    description: 'Barely explains anything; purely visual, screenplay-like observation.',
    example: '2:13 AM. Porch light on. Keys still sitting by the phone.',
  },
  {
    id: 'internal-monologue',
    label: 'Internal monologue',
    group: 'core',
    description: "Inside somebody's head where thoughts jump, contradict, repeat, and spiral.",
  },
  {
    id: 'stream-of-consciousness',
    label: 'Stream of consciousness',
    group: 'core',
    description: 'Memories, images, fears, and thoughts collide organically without neat transitions.',
  },
  // Time-shifted (7)
  {
    id: 'memory-perspective',
    label: 'Memory perspective',
    group: 'time',
    description: 'Told years later with hindsight knowing how everything turned out.',
    example: "I didn't know that would be the last summer we were friends.",
  },
  {
    id: 'present-tense',
    label: 'Present-tense perspective',
    group: 'time',
    description: 'Happening right now for raw immediacy and urgency.',
    example: 'Door opens. She walks in. My whole chest freezes.',
  },
  {
    id: 'future-perspective',
    label: 'Future perspective',
    group: 'time',
    description: 'Imagines what will happen down the road.',
    example: "One day you'll drive past this house and finally understand.",
  },
  {
    id: 'looking-backward',
    label: 'Looking backward from the ending',
    group: 'time',
    description: 'Opens after everything has gone wrong, then traces how it happened.',
    example: 'By sunrise, she was gone. But six hours earlier...',
  },
  {
    id: 'older-to-younger',
    label: 'Older self talking to younger self',
    group: 'time',
    description: 'Speaks across time with earned perspective.',
    example: 'You think missing that scholarship ruined your life. You have no idea yet.',
  },
  {
    id: 'younger-to-older',
    label: 'Younger self talking to older self',
    group: 'time',
    description: 'A child or younger version asks hard questions about who the adult became.',
  },
  {
    id: 'future-to-present',
    label: 'Future self talking to present self',
    group: 'time',
    description: 'A warning or promise sent back from ten years ahead.',
    example: "I'm you ten years from now. Don't get in that car.",
  },
  // Role, Moral & Relational (13)
  {
    id: 'dead-person',
    label: 'Dead person perspective',
    group: 'role',
    description: 'Speaks after death, watching the people left behind.',
  },
  {
    id: 'person-who-disappeared',
    label: 'Person who disappeared',
    group: 'role',
    description: 'Someone who vanished, left town, or cut everyone off finally gives their side.',
  },
  {
    id: 'person-left-behind',
    label: 'The person left behind',
    group: 'role',
    description: 'Same departure experienced from the one still standing there.',
  },
  {
    id: 'villain-perspective',
    label: 'Villain perspective',
    group: 'role',
    description: 'From the person everyone assumes is wrong—let them explain without excusing them.',
  },
  {
    id: 'victim-perspective',
    label: 'Victim perspective',
    group: 'role',
    description: 'Experienced directly by the person absorbing the damage.',
  },
  {
    id: 'antagonist-hero',
    label: 'Antagonist who thinks they are the hero',
    group: 'role',
    description: 'Distinct from a basic villain: they genuinely believe they are right.',
  },
  {
    id: 'child-perspective',
    label: 'Child perspective',
    group: 'role',
    description: 'Notices details without understanding them while the audience grasps the full weight.',
    example: "Dad sleeps all day now. Mom says he's tired.",
  },
  {
    id: 'parent-perspective',
    label: 'Parent perspective',
    group: 'role',
    description: 'Watching the child—worrying, remembering, regretting, protecting, letting go.',
  },
  {
    id: 'stranger-perspective',
    label: 'Stranger perspective',
    group: 'role',
    description: 'Brief witness to a life: cab driver, bartender, nurse, neighbor, hotel clerk.',
  },
  {
    id: 'audience-perspective',
    label: 'Audience perspective',
    group: 'role',
    description: 'Spoken as if everyone watching is narrating the rise or downfall.',
  },
  {
    id: 'fan-perspective',
    label: 'Fan perspective',
    group: 'role',
    description: "Tells a celebrity or athlete's story through someone who worships them.",
  },
  {
    id: 'enemy-perspective',
    label: 'Enemy perspective',
    group: 'role',
    description: 'Someone who hates the protagonist tells us why.',
  },
  {
    id: 'ex-lover-perspective',
    label: 'Ex-lover perspective',
    group: 'role',
    description: 'Tells the aftermath or reply from the former partner’s side.',
  },
  // Non-Human & Epistolary (6)
  {
    id: 'object-perspective',
    label: 'Object perspective',
    group: 'nonhuman',
    description: 'A house, jersey, ring, gun, car, phone, or hospital bed witnessing years of life.',
  },
  {
    id: 'place-perspective',
    label: 'Place perspective',
    group: 'nonhuman',
    description: 'The neighborhood, gym, or street narrates the story.',
    example: 'I watched you boys grow taller on my cracked sidewalks.',
  },
  {
    id: 'institution-perspective',
    label: 'Institution perspective',
    group: 'nonhuman',
    description: 'A school, prison, hospital, church, team, courtroom, or city speaks as a character.',
  },
  {
    id: 'concept-perspective',
    label: 'Concept perspective',
    group: 'nonhuman',
    description: 'Love, Death, Fame, Addiction, Time, Money, or Anxiety becomes the narrator.',
    example: "I'm Fame. Everybody wants me until I move into their house.",
  },
  {
    id: 'god-fate-universe',
    label: 'God / fate / universe perspective',
    group: 'nonhuman',
    description: "Sees the character's entire path while the character only sees today.",
  },
  {
    id: 'anonymous-letter',
    label: 'Anonymous letter / voicemail / confession',
    group: 'nonhuman',
    description: 'Framed as a letter, voicemail, diary page, police statement, prayer, or unsent text.',
  },
];

export function resolvePerspective(id?: string): SongPerspective | undefined {
  if (!id || id === 'auto') return undefined;
  return PERSPECTIVES.find((p) => p.id === id);
}

// ──────────────────────── 80 Storytelling Styles ────────────────────────

export const STORYTELLING_GROUPS: readonly CraftGroup[] = [
  { id: 'timeline', label: 'Timeline & Pacing (1–13)' },
  { id: 'twist', label: 'Dualities, Twists & Secrets (14–19)' },
  { id: 'dialogue', label: 'Confession & Dialogue (20–27)' },
  { id: 'montage', label: 'Montage, Cycles & Clocks (28–43)' },
  { id: 'arc', label: 'Character Arcs & Stakes (44–53)' },
  { id: 'pov', label: 'POV & Offscreen Frames (54–67)' },
  { id: 'genre', label: 'Metaphor, Surreal & Documentary (68–80)' },
];

export const STORYTELLING_STYLES: readonly StorytellingStyle[] = [
  { id: 's01-straight-timeline', number: 1, label: 'Straight Timeline', group: 'timeline', description: 'Start at the beginning and move forward (meet → fall in love → break → goodbye).' },
  { id: 's02-reverse-timeline', number: 2, label: 'Reverse Timeline', group: 'timeline', description: 'Start with the ending, then work backward to show how it happened.' },
  { id: 's03-start-at-climax', number: 3, label: 'Start at the Climax', group: 'timeline', description: 'Open at the biggest moment ("outside your house at 2 AM"), then explain why.' },
  { id: 's04-one-night', number: 4, label: 'One Night Story', group: 'timeline', description: 'The entire song unfolds over one tight, cinematic night (club → argument → drive → sunrise).' },
  { id: 's05-one-moment-stretched', number: 5, label: 'One Moment Stretched Out', group: 'timeline', description: 'Take five seconds and turn it into an entire song.' },
  { id: 's06-one-location', number: 6, label: 'One Location', group: 'timeline', description: 'Everything happens in one place (hospital room, porch, barbershop, court, funeral).' },
  { id: 's07-journey-story', number: 7, label: 'Journey Story', group: 'timeline', description: 'Physical movement mirrors emotional unfolding (driving back through the old neighborhood).' },
  { id: 's08-memory-trigger', number: 8, label: 'Memory Trigger', group: 'timeline', description: 'One object, smell, song, place, or photo unlocks the entire story.' },
  { id: 's09-flashback-story', number: 9, label: 'Flashback Story', group: 'timeline', description: 'Present-day scenes keep cutting back to the past.' },
  { id: 's10-then-vs-now', number: 10, label: 'Then vs. Now', group: 'timeline', description: 'Constantly contrast who the character was with who they became.' },
  { id: 's11-before-and-after', number: 11, label: 'Before and After', group: 'timeline', description: 'Everything revolves around one event that split life in two (before/after the call).' },
  { id: 's12-two-timelines', number: 12, label: 'Two Timelines at Once', group: 'timeline', description: 'Past and present unfold side by side until they connect.' },
  { id: 's13-parallel-stories', number: 13, label: 'Parallel Stories', group: 'timeline', description: 'Tell two people’s stories that mirror each other (father at 17 vs. son at 17).' },

  { id: 's14-two-sides', number: 14, label: 'Two Sides of the Same Story', group: 'twist', description: "Verse 1 tells one person's version; Verse 2 tells the other's." },
  { id: 's15-unreliable-narrator', number: 15, label: 'Unreliable Narrator', group: 'twist', description: "Slowly reveal the narrator's version is not completely true." },
  { id: 's16-hidden-truth', number: 16, label: 'Hidden Truth Reveal', group: 'twist', description: 'The listener misunderstands the situation until a late reveal changes everything.' },
  { id: 's17-twist-ending', number: 17, label: 'Twist Ending', group: 'twist', description: 'The final line or verse rewrites the meaning of everything before it.' },
  { id: 's18-missing-information', number: 18, label: 'Missing Information Story', group: 'twist', description: 'Important pieces are purposely withheld so the listener figures out what happened.' },
  { id: 's19-mystery-story', number: 19, label: 'Mystery Story', group: 'twist', description: 'Something happened, and the song reveals clues piece by piece.' },

  { id: 's20-confession', number: 20, label: 'Confession', group: 'dialogue', description: "Finally telling somebody something that's been hidden." },
  { id: 's21-letter-song', number: 21, label: 'Letter Song', group: 'dialogue', description: 'The whole song is written like a letter to someone.' },
  { id: 's22-phone-call', number: 22, label: 'Phone Call Story', group: 'dialogue', description: 'The song happens through a phone conversation.' },
  { id: 's23-conversation', number: 23, label: 'Conversation Story', group: 'dialogue', description: 'Lyrics unfold like two people talking in real time.' },
  { id: 's24-argument-story', number: 24, label: 'Argument Story', group: 'dialogue', description: 'Built around an argument escalating, shifting direction, or exposing deeper pain.' },
  { id: 's25-interview-style', number: 25, label: 'Interview Style', group: 'dialogue', description: 'Questions and answers slowly reveal a life.' },
  { id: 's26-testimony-story', number: 26, label: 'Testimony Story', group: 'dialogue', description: 'Looking back to explain what happened from a survivor’s perspective.' },
  { id: 's27-diary-entry', number: 27, label: 'Diary Entry', group: 'dialogue', description: "Intimate and private—feels like reading pages you weren't meant to see." },

  { id: 's28-scene-montage', number: 28, label: 'Scene Montage', group: 'montage', description: 'Short snapshots across time (kitchen table, hallway, funeral, empty bedroom).' },
  { id: 's29-photograph-style', number: 29, label: 'Photograph Style', group: 'montage', description: "Each verse acts like another still photograph from the character's life." },
  { id: 's30-time-lapse', number: 30, label: 'Time-Lapse Story', group: 'montage', description: 'Cover years or decades rapidly (age 8 → 17 → 30 → 60).' },
  { id: 's31-age-by-age', number: 31, label: 'Age-by-Age Story', group: 'montage', description: 'Each verse happens at a specific age.' },
  { id: 's32-generational', number: 32, label: 'Generational Story', group: 'montage', description: 'Grandparent → parent → child: same dream or wound across generations.' },
  { id: 's33-full-circle', number: 33, label: 'Full-Circle Story', group: 'montage', description: 'Returns to the opening place, phrase, object, or situation with changed meaning.' },
  { id: 's34-circular-story', number: 34, label: 'Circular Story', group: 'montage', description: 'Character keeps repeating the same mistake; ending suggests the cycle continues.' },
  { id: 's35-countdown-story', number: 35, label: 'Countdown Story', group: 'montage', description: 'A deadline approaches (five minutes before the train, final seconds of a game).' },
  { id: 's36-race-against-time', number: 36, label: 'Race Against Time', group: 'montage', description: 'Trying to reach someone or fix something before it is too late.' },
  { id: 's37-decision-story', number: 37, label: 'Decision Story', group: 'montage', description: 'The entire song builds toward one choice.' },
  { id: 's38-fork-in-the-road', number: 38, label: 'Fork-in-the-Road Story', group: 'montage', description: 'Shows two different outcomes depending on the choice made.' },
  { id: 's39-what-if', number: 39, label: 'What-If Story', group: 'montage', description: 'Tells an alternate version of life ("What if I answered that call?").' },
  { id: 's40-sliding-doors', number: 40, label: 'Sliding Doors Story', group: 'montage', description: "One tiny decision completely changes the character's life." },
  { id: 's41-almost-story', number: 41, label: 'Almost Story', group: 'montage', description: 'Centered on something that nearly happened (almost kissed, almost made it).' },
  { id: 's42-last-time', number: 42, label: 'Last Time Story', group: 'montage', description: "Narrator doesn't realize it's happening for the final time until later." },
  { id: 's43-first-time', number: 43, label: 'First Time Story', group: 'montage', description: 'Centers on experiencing something for the very first time.' },

  { id: 's44-coming-of-age', number: 44, label: 'Coming-of-Age Story', group: 'arc', description: 'A kid experiences something that forces them to grow up.' },
  { id: 's45-rise-and-fall', number: 45, label: 'Rise and Fall', group: 'arc', description: 'Gets everything they wanted, then loses it.' },
  { id: 's46-fall-and-rise', number: 46, label: 'Fall and Rise', group: 'arc', description: 'Starts with the character broken, then shows how they rebuild.' },
  { id: 's47-success-with-cost', number: 47, label: 'Success-With-a-Cost Story', group: 'arc', description: 'Achieved the dream, but the dream took something vital in return.' },
  { id: 's48-pyrrhic-victory', number: 48, label: 'Pyrrhic Victory', group: 'arc', description: 'The character wins, yet the price makes victory feel like loss.' },
  { id: 's49-revenge-story', number: 49, label: 'Revenge Story', group: 'arc', description: 'Wronged character moves steadily toward retaliation.' },
  { id: 's50-redemption-story', number: 50, label: 'Redemption Story', group: 'arc', description: 'Someone tries to repair damage they caused.' },
  { id: 's51-escape-story', number: 51, label: 'Escape Story', group: 'arc', description: 'Trying to break out of a place, relationship, lifestyle, family pattern, or old self.' },
  { id: 's52-return-home', number: 52, label: 'Return Home Story', group: 'arc', description: 'Comes back after years away and sees everything differently.' },
  { id: 's53-ghost-without-ghost', number: 53, label: 'Ghost Story Without a Ghost', group: 'arc', description: 'A dead or absent person is everywhere through habits, objects, memories, and places.' },

  { id: 's54-object-narrator', number: 54, label: 'Object Narrator', group: 'pov', description: 'Told from the POV of an object (ring, gun, basketball, car, photo, house).' },
  { id: 's55-place-narrator', number: 55, label: 'Place Narrator', group: 'pov', description: 'The neighborhood, house, gym, or street narrates.' },
  { id: 's56-third-person-movie', number: 56, label: 'Third-Person Movie Style', group: 'pov', description: 'Camera-eye narration ("He walked into the room...").' },
  { id: 's57-first-person-immersion', number: 57, label: 'First-Person Immersion', group: 'pov', description: 'Experienced directly and viscerally through "I".' },
  { id: 's58-second-person-story', number: 58, label: 'Second-Person Story', group: 'pov', description: 'Talks directly to "you", making the listener feel like a character.' },
  { id: 's59-multiple-pov', number: 59, label: 'Multiple POV Story', group: 'pov', description: 'Different verses belong to different characters.' },
  { id: 's60-observer-story', number: 60, label: 'Observer Story', group: 'pov', description: "Narrator watches somebody else's life fall apart or transform." },
  { id: 's61-childs-eye', number: 61, label: "Child's-Eye Story", group: 'pov', description: 'Adult events told through what a child understands.' },
  { id: 's62-older-self-looking-back', number: 62, label: 'Older-Self Looking Back', group: 'pov', description: "Told with hindsight their younger self didn't have." },
  { id: 's63-future-self-story', number: 63, label: 'Future Self Story', group: 'pov', description: 'Imagines themselves years from now looking back.' },
  { id: 's64-dead-person-pov', number: 64, label: 'Dead Person POV', group: 'pov', description: 'Told by someone who has already died.' },
  { id: 's65-aftermath-story', number: 65, label: 'Aftermath Story', group: 'pov', description: 'Skip the big event completely; tell the story through what remains afterward.' },
  { id: 's66-offscreen-event', number: 66, label: 'Offscreen Event', group: 'pov', description: 'Never describe the event itself; show its impact through reactions and details.' },
  { id: 's67-breadcrumb-story', number: 67, label: 'Breadcrumb Story', group: 'pov', description: 'Every verse gives one more clue without over-explaining.' },

  { id: 's68-symbolic-story', number: 68, label: 'Symbolic Story', group: 'genre', description: 'A literal story carrying a second meaning underneath.' },
  { id: 's69-extended-metaphor', number: 69, label: 'Extended Metaphor Story', group: 'genre', description: 'Entire narrative built around one metaphor (relationship as boxing match, fame as drug).' },
  { id: 's70-dream-story', number: 70, label: 'Dream Story', group: 'genre', description: 'Surreal experience before waking up to a different reality.' },
  { id: 's71-nightmare-story', number: 71, label: 'Nightmare Story', group: 'genre', description: 'Reality grows increasingly distorted as fear escalates.' },
  { id: 's72-fantasy-reality', number: 72, label: 'Fantasy Version of Reality', group: 'genre', description: 'Tell a real emotional problem through an imaginary world.' },
  { id: 's73-fable-style', number: 73, label: 'Fable Style', group: 'genre', description: 'Simple characters and events carrying a deeper lesson.' },
  { id: 's74-parable-style', number: 74, label: 'Parable Style', group: 'genre', description: 'The story itself teaches something without directly preaching.' },
  { id: 's75-documentary-style', number: 75, label: 'Documentary Style', group: 'genre', description: 'Hyper-specific real details: dates, places, names, prices, clothes, weather.' },
  { id: 's76-news-report', number: 76, label: 'News Report Style', group: 'genre', description: 'Unfolds like live coverage of an event.' },
  { id: 's77-case-file', number: 77, label: 'Police Report / Case File Style', group: 'genre', description: 'Facts emerge piece by piece through evidence.' },
  { id: 's78-voicemail-story', number: 78, label: 'Voicemail Story', group: 'genre', description: 'Feels like a voicemail someone may never hear.' },
  { id: 's79-message-never-sent', number: 79, label: 'Message Never Sent', group: 'genre', description: 'What the narrator wishes they could say, never sent.' },
  { id: 's80-last-words', number: 80, label: 'Last Words Story', group: 'genre', description: 'Built around what someone wishes they had said before a death, breakup, or departure.' },
];

export function resolveStorytellingStyles(ids?: string[]): StorytellingStyle[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => STORYTELLING_STYLES.find((s) => s.id === id))
    .filter((s): s is StorytellingStyle => Boolean(s));
}

// ──────────────────── 30 Advanced Songwriting Techniques ────────────────────

export const TECHNIQUE_GROUPS: readonly CraftGroup[] = [
  { id: 'priority', label: 'Core 8 Priority Weapons' },
  { id: 'craft', label: 'Additional Lyric & Structural Devices (22)' },
];

export const ADVANCED_TECHNIQUES: readonly AdvancedTechnique[] = [
  // Core 8 Priority Weapons
  { id: 'motif-mutation', label: 'Motif mutation', priority: true, description: 'Repeat the same phrase, image, or object while letting its meaning change.', example: '"Home" shifts from place escaped → place missed → carried inside.' },
  { id: 'object-correlative', label: 'Object correlative', priority: true, description: 'Let one physical object carry the emotion instead of naming it.', example: 'Cracked phone screen, old jersey, hospital bracelet, empty passenger seat.' },
  { id: 'narrative-withholding', label: 'Narrative withholding', priority: true, description: 'Hide one crucial fact until later so a reveal reframes the whole song.', example: 'Verse 1 sounds like a breakup; final verse reveals a death.' },
  { id: 'callback-payoff', label: 'Callback payoff', priority: true, description: 'Plant a small detail early and return to it later with deeper weight.', example: 'Early: "Mom left the porch light on." Later: "Porch light\'s gone now."' },
  { id: 'subtext-writing', label: 'Subtext writing', priority: true, description: 'Character says one thing while the listener hears the deeper truth underneath.', example: '"I\'m glad you\'re doing good" meaning "I still love you and hate it."' },
  { id: 'rhyme-displacement', label: 'Rhyme displacement', priority: true, description: 'Move rhymes off the predictable bar end (early, mid-bar, late, across bar lines).', example: 'Listener hears the rhyme before or after expected.' },
  { id: 'perspective-fracture', label: 'Perspective fracture', priority: true, description: 'Briefly switch who is speaking or whose eyes we look through.', example: 'Adult self speaks, then child self answers.' },
  { id: 'refrain-evolution', label: 'Refrain evolution', priority: true, description: 'Keep chorus words identical while verses change what those words mean.', example: '"Come home" = romantic → desperate → accepting.' },

  // Remaining 22 Techniques
  { id: 'enjambment', label: 'Enjambment', priority: false, description: 'Let a sentence spill cleanly across the musical bar line.', example: '"I thought I had more time / but time had already..."' },
  { id: 'caesura', label: 'Caesura', priority: false, description: 'Stop deliberately inside the line so silence becomes part of the lyric.', example: '"I called your number... / never mind."' },
  { id: 'anaphora', label: 'Anaphora', priority: false, description: 'Repeat the same opening phrase across consecutive lines.', example: '"I remember the bus stop / I remember the old court..."' },
  { id: 'epistrophe', label: 'Epistrophe', priority: false, description: 'Repeat the same ending phrase across consecutive lines.', example: '"I stayed for you / lied for you / lost myself for you."' },
  { id: 'chiasmus', label: 'Chiasmus', priority: false, description: 'Mirror or reverse the structure of an idea in the second half.', example: '"I left home to find myself / found myself when I came home."' },
  { id: 'zeugma', label: 'Zeugma', priority: false, description: 'Use one word to govern two different meanings in the same line.', example: '"She broke the silence and my trust."' },
  { id: 'metonymy', label: 'Metonymy', priority: false, description: 'Name something closely connected instead of the thing itself.', example: '"The badge showed up" instead of "the police."' },
  { id: 'synecdoche', label: 'Synecdoche', priority: false, description: 'Use a part to stand for the whole.', example: '"Ten thousand hands in the air" for the whole crowd.' },
  { id: 'image-chaining', label: 'Image chaining', priority: false, description: 'Let each visual image flow naturally into the next.', example: 'Rain → windshield → blurred streetlights → blurry memories.' },
  { id: 'semantic-chaining', label: 'Semantic chaining', priority: false, description: 'Grab a word/idea from the previous line and push it somewhere new.', example: '"I needed space / space turned into distance / distance turned into silence..."' },
  { id: 'double-entendre', label: 'Double entendre', priority: false, description: 'One phrase carrying two simultaneous, earned meanings.', example: 'Sports, money, faith, travel, streets, and relationship flips.' },
  { id: 'delayed-rhyme', label: 'Delayed rhyme', priority: false, description: 'Set up a rhyme sound and hold off two or more bars before paying it off.', example: 'Expectation builds until the delayed rhyme snaps shut.' },
  { id: 'stress-manipulation', label: 'Stress manipulation', priority: false, description: 'Shift which syllable gets the rhythmic punch to make plain words feel musical.', example: 'Same words, new syllable emphasis creates a hook.' },
  { id: 'rhythmic-motif', label: 'Rhythmic motif repetition', priority: false, description: 'Repeat the exact rhythmic bounce with different words so rhythm becomes the hook.', example: 'Three lines share identical cadence without end rhymes.' },
  { id: 'cadence-mutation', label: 'Cadence mutation', priority: false, description: 'Bring back an idea/hook while changing how its rhythm behaves each time.', example: 'Hook 1 laid back → Hook 2 tighter → Final hook spills over bar lines.' },
  { id: 'scene-to-summary', label: 'Scene-to-summary switching', priority: false, description: 'Zoom tight into one concrete gesture, then zoom out to summarize years.', example: '"She dropped the keys on the table" → "We spent five years doing this."' },
  { id: 'time-compression', label: 'Time compression', priority: false, description: 'Cover years of life in a few crisp lines.', example: '"Freshman year / wedding ring / hospital room / empty side of the bed."' },
  { id: 'time-dilation', label: 'Time dilation', priority: false, description: 'Stretch a tiny moment into an entire verse or song.', example: 'Five seconds before answering a phone call fills Verse 1.' },
  { id: 'unreliable-narrator-tech', label: 'Unreliable narrator (subtextual)', priority: false, description: 'Narrator insists on one truth while concrete details prove the opposite.', example: 'Saying "I\'m over her" while proving she still runs his mind.' },
  { id: 'contradiction-writing', label: 'Contradiction writing', priority: false, description: 'Let two opposite feelings be true at the exact same time.', example: '"I\'m proud I left / mad I had to."' },
  { id: 'negative-space', label: 'Negative space', priority: false, description: 'Leave crucial things unsaid so the listener fills the emotional gap.', example: 'Untouched dinner, packed bag, quiet hallway—never stating the fight.' },
  { id: 'lexical-mirroring', label: 'Lexical mirroring', priority: false, description: "Reuse another character's exact words later to turn or transform their meaning.", example: '"You said forever." Later: "Funny, forever got short."' },
];

export function resolveTechniques(ids?: string[]): AdvancedTechnique[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => ADVANCED_TECHNIQUES.find((t) => t.id === id))
    .filter((t): t is AdvancedTechnique => Boolean(t));
}
