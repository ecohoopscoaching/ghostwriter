/**
 * Built-in offline song lyric writer (used when no live LLM API key is configured).
 *
 * Rules enforced at the source:
 *   - Global Cold-Open Rule: every vocal song opens directly at [Verse 1] (or [Verse 1: male|female]).
 *     Zero vocal intros, zero opening ad-libs ("yeah", "listen", "mmm"), zero title chants.
 *   - Artist / Producer Independence: vocal delivery cues come strictly from the selected Artist
 *     (never turning an R&B singer into a rapper over a hip-hop beat, or vice versa).
 *   - Four Creation Modes: returns empty lyrics for 'instrumental' and 'none'; uses purely vocal
 *     directions with zero instrument cues in 'acappella' mode.
 *   - Natural Writing: the topic inspires the title and mood without mechanically stuffing the
 *     title string into unrelated lines.
 */
import type { Palette } from '@/data/moods';
import type { Section } from './lyrics';
import { serialize } from './lyrics';
import type { Rng } from './rng';
import type { SoundSpec } from './types';

interface ImageryBank {
  settings: string[];
  details: string[];
  anchors: string[];
  turns: string[];
  outros: string[];
  naturalTitles: string[];
  hook: {
    question: string;
    echo: string;
    statement: string;
    bridgeQuestion: string;
    followUpQuestions: [string, string, string];
    followUpStatements: [string, string, string];
  };
}

const BANKS: Record<Palette, ImageryBank> = {
  ache: {
    settings: [
      'Two in the morning and the hallway light is still on',
      'Rain on the windshield, wipers moving slow in the dark',
      'Your jacket on the chair like you just stepped out the room',
      'Cold coffee on the counter, radio low on the dial',
      'Streetlights bleeding amber through the blinds on the floor',
      'Half-packed suitcase sitting quiet by the front door',
    ],
    details: [
      'I still reach for my phone before I remember the silence',
      'Every corner of this house still echoes the way you laugh',
      'You folded up the promises and left them on the shelf',
      'Funny how a memory can weigh more than the truth',
      'We traded all our patience for a pride we could not hold',
      'Your name sits on my tongue like a song I should not sing',
    ],
    anchors: [
      'I learned how to breathe with the weight in my chest',
      'You taught me how to love and then you taught me how to leave',
      'Even in the quiet I can hear what we became',
      'Nothing ever breaks as loud as what goes unsaid',
    ],
    turns: [
      'Maybe we were only meant to burn bright for a season',
      'If I could rewind the night I would still walk through that door',
      'I am not asking you to stay, I just needed you to see',
      'Let the smoke clear out the room so I can finally speak',
    ],
    outros: [
      'Leave the porch light burning low',
      'I will carry what we knew',
      'Let the last note fade to quiet',
      'Still standing in the stillness',
    ],
    naturalTitles: ['Hallway Light', 'Still Unsaid', 'After the Silence', 'Left on the Shelf'],
    hook: {
      question: 'Do you still hear it when the house goes quiet',
      echo: 'house goes quiet',
      statement: 'I finally breathe when the house goes quiet',
      bridgeQuestion: 'When did holding on start costing more than letting go?',
      followUpQuestions: [
        'Do you still reach across the dark at two a.m.?',
        'Do you still catch my name inside an empty room?',
        'Did you ever plan to turn around and look?',
      ],
      followUpStatements: [
        'No longer reaching through the dark at two a.m.',
        'I made my peace inside this quiet room',
        'I set the weight down where we used to stand',
      ],
    },
  },
  fire: {
    settings: [
      'Check the scoreboard now, remember how they counted you out',
      'Built this from the concrete with my back against the wall',
      'Came up through the static when nobody called my name',
      'Heavy on the shoulders but I never dropped the crown',
      'Long nights in the basement turning pressure into gold',
      'Every door they locked just taught me how to build my own',
    ],
    details: [
      'They only saw the finish, never saw the miles in the rain',
      'I kept my circle small and let the work do all the talk',
      'Scars across the knuckles just remind me where I stood',
      'No favors on the ledger, every inch was paid in full',
      'Turned the doubt into a pulse that keeps driving through the floor',
      'Now the room goes quiet soon as we step through the frame',
    ],
    anchors: [
      'You cannot break a foundation that was poured in the fire',
      'We did not come this far just to whisper at the top',
      'Every loss became the blueprint for the way we move tonight',
      'Stand tall in the smoke and let the whole block hear it ring',
    ],
    turns: [
      'Remember every night you swore you could not make it through',
      'I owe nothing to the shadows that tried holding me down',
      'When the pressure hits the ceiling, watch us raise the roof',
      'This is not luck, this is patience meeting thunder',
    ],
    outros: [
      'Still standing, still here',
      'Every mile was paid in full',
      'Built from the fire, built to last',
      'Crown steady, head high',
    ],
    naturalTitles: ['Paid in Full', 'Built in the Fire', 'Through the Static', 'Miles in the Rain'],
    hook: {
      question: 'Did you think the fire was supposed to stop me',
      echo: 'supposed to stop me',
      statement: 'Nothing in the fire could ever stop me',
      bridgeQuestion: 'Who would we be if the climb had been easy?',
      followUpQuestions: [
        'Every closed door when we still kept moving?',
        'Every cold night when nobody answered?',
        'Did you forget how we built this from nothing?',
      ],
      followUpStatements: [
        'Every closed door only sharpened the vision',
        'Every cold night built the voice you hear now',
        'We turned the pressure into something permanent',
      ],
    },
  },
  glow: {
    settings: [
      'Golden hour spilling slow across your shoulders in the room',
      'Windows rolled down, warm wind moving through the avenue',
      'Candlelight dancing on the glass while the evening slows',
      'Morning sun breaking soft across the edge of the bed',
      'City lights shimmering like water underneath our feet',
      'Slow dance in the kitchen with no hurry in your pulse',
    ],
    details: [
      'Every time you look at me the static fades away',
      'You pull me from the noise into a place that feels like home',
      'No need to rush the clock when every second feels like this',
      'Your hand inside my hand is all the proof I ever need',
      'We found a little heaven in the middle of the week',
      'The way you say my name makes the whole room come alive',
    ],
    anchors: [
      'Stay right here beside me till the morning finds the floor',
      'You are the calm inside the storm, the rhythm in my chest',
      'Nothing in this world shines brighter than the way you move',
      'I want to spend the rest of my tomorrows in this light',
    ],
    turns: [
      'Let the whole world spin outside, we do not need to move',
      'If this is what forever feels like, stay a little longer',
      'Take a breath and lean in closer, let the moment hold us',
      'Every road I ever walked was leading straight to you',
    ],
    outros: [
      'Hold me in the afterglow',
      'Right here in the warm light',
      'Stay close till the morning',
      'Nowhere else I need to be',
    ],
    naturalTitles: ['Golden Hour', 'In This Light', 'Middle of the Week', 'Afterglow'],
    hook: {
      question: 'Do you feel how the whole room slows down with you',
      echo: 'slows down with you',
      statement: 'The whole world slows down right here with you',
      bridgeQuestion: 'How did we find peace in the middle of the noise?',
      followUpQuestions: [
        'When your hand stays warm against my shoulder?',
        'When the sunlight hits the kitchen floor?',
        'Could we stay right here a little longer?',
      ],
      followUpStatements: [
        'Your hand stays warm against my shoulder',
        'Sunlight resting on the kitchen floor',
        'We do not have to chase tomorrow anymore',
      ],
    },
  },
  shadow: {
    settings: [
      'Midnight on the avenue, the engine humming low in neutral',
      'Fog rolling off the river, neon reflecting off the chrome',
      'No witnesses, no alibi, just shadows on the glass',
      'Tinted windows up while the city blurs past the frame',
      'Cold air on the rooftop, watching headlights crawl below',
      'Three a.m. confession with the curtains pulled tight',
    ],
    details: [
      'Smile in the front row, knives behind the velvet curtain',
      'Every secret has a pulse if you listen close enough',
      'Trust is a luxury nobody on this side can afford',
      'Read between the lines before you sign your name in ink',
      'Keep your eyes open when the room starts getting sweet',
      'I walk through the dark because I know where all the traps sit',
    ],
    anchors: [
      'Silence speaks louder when the stakes are this high',
      'You learn to move smart when the night has teeth',
      'Keep your cards close and let them guess the next move',
      'Steady hand, clear eyes, never flinching in the glare',
    ],
    turns: [
      'Turn the lights down low so we can see who stays loyal',
      'I made peace with the dark a long time ago',
      'Every shadow in this room knows my silhouette by heart',
      'Step carefully, the floor remembers every promise broken',
    ],
    outros: [
      'Fade back into the night',
      'Engines off, lights out',
      'Keep it quiet when we leave',
      'Cold air, clear mind',
    ],
    naturalTitles: ['Velvet Curtain', 'Midnight Avenue', 'Between the Lines', 'Cold Air'],
    hook: {
      question: 'Who stays loyal when the lights go low',
      echo: 'lights go low',
      statement: 'Now I know who stays when the lights go low',
      bridgeQuestion: 'When did watching every corner become second nature?',
      followUpQuestions: [
        'When the smiles in the front row start to fade?',
        'When the silence says more than anybody admits?',
        'Who still answers when there is nothing left to gain?',
      ],
      followUpStatements: [
        'Watched the smiles in the front row fade away',
        'Learned to trust the quiet over polished words',
        'Keeping only what is real inside the circle now',
      ],
    },
  },
};

function cleanTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function titleCase(s: string): string {
  const minor = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'in', 'on', 'of', 'to', 'for', 'at', 'by', 'with']);
  return s
    .split(/\s+/)
    .map((w, i) => {
      const low = w.toLowerCase();
      if (i > 0 && minor.has(low)) return low;
      return low.charAt(0).toUpperCase() + low.slice(1);
    })
    .join(' ');
}

function makeTitle(topic: string, bank: ImageryBank, rng: Rng): string {
  if (!topic) return rng.pick(bank.naturalTitles);
  const words = topic
    .replace(/[^a-zA-Z0-9\s'-]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  // Short, clean topics make good natural titles; long scene prompts use a clean thematic title
  // instead of awkwardly truncating the first 3 words.
  if (words.length >= 1 && words.length <= 4) {
    return titleCase(words.join(' '));
  }
  return rng.pick(bank.naturalTitles);
}

function voiceCues(spec: SoundSpec): {
  verse1: string;
  pre: string;
  chorus: string;
  verse2: string;
  bridge: string;
  finalChorus: string;
  outro: string;
} {
  const voice = spec.voice;
  if (!voice) {
    return {
      verse1: '[close, steady]',
      pre: '[gentle lift]',
      chorus: '[open, clear]',
      verse2: '[grounded, focused]',
      bridge: '[stripped back, raw]',
      finalChorus: '[full voice, peak]',
      outro: '[soft, breath]',
    };
  }

  if (spec.isRap) {
    return {
      verse1: spec.flowMode.verse1Cue,
      pre: '[tighten cadence]',
      chorus: '[strong hook, forward]',
      verse2: spec.flowMode.verse2Cue,
      bridge: '[stripped back, raw]',
      finalChorus: '[full energy, emphatic]',
      outro: '[low, deliberate]',
    };
  }

  if (voice.category === 'tenor') {
    return {
      verse1: '[close, conversational]',
      pre: '[lift into mix]',
      chorus: '[bright mask, full]',
      verse2: '[warm, rhythmic]',
      bridge: '[gospel run, soar]',
      finalChorus: '[falsetto peak, control]',
      outro: '[soft falsetto, breath]',
    };
  }
  if (voice.category === 'baritone') {
    return {
      verse1: '[warm, close mic]',
      pre: '[smooth rise, mix]',
      chorus: '[rich chest, forward]',
      verse2: '[steady, grounded]',
      bridge: '[gospel melisma, lift]',
      finalChorus: '[steady falsetto, full]',
      outro: '[low baritone, fade]',
    };
  }
  if (voice.id === 'voc-fem-4') {
    return {
      verse1: '[smooth mixed voice]',
      pre: '[connected rise]',
      chorus: '[full mix, seamless]',
      verse2: '[warm, controlled]',
      bridge: '[long connected phrase]',
      finalChorus: '[soaring mix, no break]',
      outro: '[soft, natural breath]',
    };
  }
  return {
    verse1: '[low anchor, rhythmic]',
    pre: '[agile lift]',
    chorus: '[ringing head voice]',
    verse2: '[percussive, melodic]',
    bridge: '[syncopated, free]',
    finalChorus: '[multi-octave crown]',
    outro: '[warm low, fade]',
  };
}

/**
 * Generates a Flow / Mozart format offline song.
 * Cold-opens directly at [Verse 1] (zero vocal intro, zero mechanical title stuffing).
 */
export function generateOfflineSong(
  topicRaw: string,
  spec: SoundSpec,
  rng: Rng,
): { title: string; lyrics: string } {
  if (spec.mode === 'instrumental' || spec.mode === 'none' || !spec.voice) {
    return { title: '', lyrics: '' };
  }

  const topic = cleanTopic(topicRaw);
  const bank = BANKS[spec.mood.palette];
  const title = makeTitle(topic, bank, rng);
  const cues = voiceCues(spec);

  const settings = rng.shuffle(bank.settings);
  const details = rng.shuffle(bank.details);
  const anchors = rng.shuffle(bank.anchors);
  const turns = rng.shuffle(bank.turns);
  const outros = rng.shuffle(bank.outros);

  const chorusLines = [
    `${bank.hook.question}?`,
    anchors[0],
    bank.hook.followUpQuestions[0],
    anchors[1] ?? anchors[0],
  ];

  const finalChorusLines = [
    bank.hook.statement,
    bank.hook.followUpStatements[0],
    anchors[0],
    bank.hook.followUpStatements[2],
  ];

  const isSoulSwitch = spec.mode === 'full' && spec.persona?.id === 'soulswitch';

  const sections: Section[] = [
    {
      label: '[Verse 1]',
      lines: [
        cues.verse1,
        settings[0],
        details[0],
        details[1],
        settings[1],
        details[2],
      ],
    },
    {
      label: '[Pre-Chorus]',
      lines: [
        cues.pre,
        'You can feel the room shift when the truth comes out',
        'No more hiding what the quiet already knows',
      ],
    },
    {
      label: '[Chorus]',
      lines: [cues.chorus, ...chorusLines],
    },
    {
      label: '[Verse 2]',
      lines: [
        isSoulSwitch ? '[beat switch, sharp]' : cues.verse2,
        settings[2],
        details[3],
        details[4],
        settings[3],
        details[5],
      ],
    },
    {
      label: '[Pre-Chorus]',
      lines: [
        cues.pre,
        'You can feel the room shift when the truth comes out',
        'Say it clear while the moment is still here',
      ],
    },
    {
      label: '[Chorus]',
      lines: [cues.chorus, ...chorusLines],
    },
    {
      label: '[Bridge]',
      lines: [
        cues.bridge,
        turns[0],
        bank.hook.bridgeQuestion,
        turns[1] ?? turns[0],
        anchors[2] ?? anchors[0],
      ],
    },
    {
      label: '[Chorus]',
      lines: [cues.finalChorus, ...finalChorusLines],
    },
    {
      label: '[Outro]',
      lines: [
        cues.outro,
        outros[0],
        outros[1] ?? outros[0],
      ],
    },
  ];

  return { title, lyrics: serialize(sections) };
}

// ──────────────────────── ACE Music v1 Native Songwriter ────────────────────────

interface AceHookPair {
  title: string;
  question: string;
  echo: string;
  statement: string;
  bridgeQuestion: string;
  followUpQuestions: [string, string, string];
  followUpStatements: [string, string, string];
}

function buildAceHook(topic: string, bank: ImageryBank, rng: Rng): AceHookPair {
  const lower = topic.toLowerCase();

  if (/\btoo quiet\b|\bpeace feels\b|\bcan'?t sleep when it'?s quiet\b/.test(lower)) {
    return {
      title: 'Too Quiet',
      question: 'Why does peace feel loud when it gets too quiet',
      echo: 'too quiet',
      statement: 'I used to pray for peace, now I sleep through the quiet',
      bridgeQuestion: 'When did calm start sounding like a warning sign?',
      followUpQuestions: [
        'I used to pray for peace, why do I jump at the silence?',
        'Why do I check every lock when nobody is fighting?',
        'How do you rest when chaos was the only clock you knew?',
      ],
      followUpStatements: [
        'I used to pray for peace and now I finally let it stay',
        'No more waiting on a storm just to feel awake',
        'The quiet is not a trap, it is the room I earned',
      ],
    };
  }

  if (/\bworth it\b|\bhard years\b|\byounger self\b/.test(lower)) {
    return {
      title: 'Worth Every Mile',
      question: 'Was it worth every mile',
      echo: 'worth every mile',
      statement: 'It was worth every mile',
      bridgeQuestion: 'Who would I be if the road had been easy?',
      followUpQuestions: [
        'Every late night staring at the ceiling?',
        'Every quiet tear nobody ever saw?',
        'Every closed door when we still kept believing?',
      ],
      followUpStatements: [
        'Every late night built the voice I carry',
        'Every quiet tear taught me how to stand',
        'Every closed door led me right to this moment',
      ],
    };
  }

  if (/\bman enough\b|\bnot ready\b|\benough\b/.test(lower)) {
    return {
      title: 'Still Enough',
      question: 'Am I still enough',
      echo: 'still enough',
      statement: 'I am still enough',
      bridgeQuestion: 'When did I decide I had to hide to be loved?',
      followUpQuestions: [
        'If I tell you I am tired tonight?',
        'If my hands shake while I hold the truth?',
        'If I let you see the weight I carry?',
      ],
      followUpStatements: [
        'Even when I tell you I am tired tonight',
        'Let my hands shake while I hold the truth',
        'You can see the weight and I am standing tall',
      ],
    };
  }

  if (/\bfather\b|\bnewborn\b|\bcar seat\b|\bdad\b/.test(lower)) {
    return {
      title: 'Hands on the Wheel',
      question: 'Will I be the shelter you never have to doubt',
      echo: 'never have to doubt',
      statement: 'I will be the shelter you never have to doubt',
      bridgeQuestion: 'How do you give a warmth nobody taught you how to hold?',
      followUpQuestions: [
        'Driving slow at three a.m. with your whole future in the back?',
        'Breaking every old cycle before it reaches your door?',
        'Learning how to stay calm when my own hands shake?',
      ],
      followUpStatements: [
        'Driving slow at three a.m. with your whole future in the back',
        'The old cycle ends tonight right here at my door',
        'You will only know the steady version of my voice',
      ],
    };
  }

  if (/\bleave\b|\bletting go\b|\bgoodbye\b|\blost\b|\bheartbreak\b|\bghosted\b/.test(lower)) {
    return {
      title: 'Still Standing Here',
      question: 'Are we still standing here',
      echo: 'still standing here',
      statement: 'We are still standing here',
      bridgeQuestion: 'What if letting go is how we finally breathe?',
      followUpQuestions: [
        'When the hallway light is all that stays?',
        'When the silence says what we could not?',
        'When the memory hits at two a.m.?',
      ],
      followUpStatements: [
        'Even when the hallway light is all that stays',
        'Through the silence that we left behind',
        'When the morning breaks, we make it through',
      ],
    };
  }

  return {
    title: makeTitle(topic, bank, rng),
    ...bank.hook,
  };
}

/**
 * Generates a complete ACE Music v1 native-format vocal song:
 *   - Strict Cold Open: begins IMMEDIATELY with [Verse 1: male|female] — zero vocal
 *     intro, zero opening ad-libs/hums, zero title chants.
 *   - Respects Artist vocal identity independently from Producer genre.
 *   - In A Cappella mode, uses ONLY vocal directions (zero instrument/beat cues).
 *   - Returns empty lyrics in Instrumental and No Selection modes.
 */
export function generateAceOfflineSong(
  topicRaw: string,
  spec: SoundSpec,
  rng: Rng,
): { title: string; lyrics: string } {
  if (spec.mode === 'instrumental' || spec.mode === 'none' || !spec.voice || !spec.gender) {
    return { title: '', lyrics: '' };
  }

  const topic = cleanTopic(topicRaw);
  const g = spec.gender;
  const tag = (name: string) => `[${name}: ${g}]`;
  const bank = BANKS[spec.mood.palette];
  const hook = buildAceHook(topic, bank, rng);

  const settings = rng.shuffle(bank.settings);
  const details = rng.shuffle(bank.details);
  const turns = rng.shuffle(bank.turns);
  const outros = rng.shuffle(bank.outros);

  const isAcappella = spec.mode === 'acappella';
  const isRapArtist = spec.isRap; // strictly voice.category === 'rap'
  const isPureRap = isRapArtist && spec.flowMode.id !== 'melodic-rap';

  const peakCue = isPureRap
    ? '[Lead rap delivery locks into sharp, emphatic cadence with crisp internal rhymes, no singing]'
    : isRapArtist
      ? '[Melodic rap hook opens vowels on the key phrase with tight rhythmic doubles]'
      : spec.voice.id === 'voc-fem-4'
        ? '[Lead vocal carries full, seamless mixed voice into the upper range with no break, intentional run on the key word]'
        : spec.voice.id === 'voc-fem-2'
          ? '[Lead vocal crowns the hook in a ringing multi-octave head voice with controlled melisma on the payoff word]'
          : spec.voice.id === 'voc-fem-1' || spec.voice.id === 'voc-fem-5'
            ? '[Lead vocal rises into clean, controlled whistle-register peaks with space to breathe]'
            : spec.voice.id === 'voc-fem-3'
              ? '[Lead contralto holds deep, smoky velvet weight across the open vowels of the hook]'
              : '[Lead vocal shifts into a strong, steady falsetto with one purposeful gospel run landing on the key phrase]';

  const verse1Cue = isRapArtist
    ? isAcappella
      ? '[Unaccompanied close-mic rap entry, crisp articulation and elastic pocket]'
      : spec.flowMode.aceVerse1Cue
    : isAcappella
      ? `[Unaccompanied close-mic ${g} vocal, warm low register, intimate and conversational]`
      : spec.voice.gender === 'female'
        ? '[Warm, grounded low register inside the pocket, intimate and conversational with space to breathe]'
        : '[Warm, seasoned chest voice inside the pocket, intimate and conversational with space to breathe]';

  const verse2Cue = isRapArtist
    ? isAcappella
      ? '[Unaccompanied cadence tightens with crisp internal rhymes and natural breath pockets]'
      : spec.persona?.id === 'soulswitch'
        ? '[Beat switch: tape-stop drops into hard trap pocket; rap cadence accelerates cleanly]'
        : spec.flowMode.aceVerse2Cue
    : isAcappella
      ? '[Intimate solo vocal leans forward with subtle dynamic lift and clean phrasing]'
      : spec.persona?.id === 'soulswitch'
        ? '[Beat switch hits beneath; soulful sung vocal stays poised and expressive over the heavier groove]'
        : '[Restrained background harmonies warm the edges without crowding the lead vocal]';

  const chorus1Cue = isPureRap
    ? isAcappella
      ? '[Emphatic unaccompanied rap hook with crisp rhythmic focus]'
      : '[Lead rap hook steps forward cleanly over the groove with tight doubles]'
    : isAcappella
      ? '[Restrained emotional release, unaccompanied lead vocal open and clear]'
      : '[Restrained emotional release: lead vocal opens up cleanly inside the pocket]';

  const chorus2Cue = isPureRap
    ? isAcappella
      ? '[Higher vocal intensity and tighter cadence on the second hook]'
      : '[Higher intensity rap hook with tight stacked doubles]'
    : isAcappella
      ? '[Fuller vocal release with warm self-harmonized lift]'
      : '[Fuller release: purposeful background harmonies lift the lead vocal]';

  const finalChorusCue = isPureRap
    ? isAcappella
      ? '[Climax: commanding unaccompanied rap hook with sharp enunciation]'
      : '[Climax: hard-hitting full-energy rap hook with emphatic ad-lib echoes in the pocket]'
    : isAcappella
      ? '[Peak emotional release: exposed chest-to-falsetto unaccompanied vocal moment]'
      : '[Peak emotional release: exposed chest-to-falsetto replay moment with purposeful harmonies and spontaneous ad-libs in the gaps]';

  const bridgeCue1 = isPureRap
    ? isAcappella
      ? '[Stark, hushed spoken-rap cadence, slow and deliberate]'
      : '[Arrangement pulls back; stark, focused spoken-rap turn]'
    : isAcappella
      ? '[Raw whisper-to-chest unaccompanied confession, letting the breath show]'
      : '[Arrangement thins out; raw whisper-to-chest confession, letting the breath show]';

  const bridgeCue2 = isPureRap
    ? '[Cadence tightens bar by bar, driving into the final hook]'
    : '[Harmonies swell gently behind one sustained open-vowel phrase]';

  const outroCue = isPureRap
    ? isAcappella
      ? '[Voice drops to a calm, final unaccompanied cadence]'
      : '[Delivery pulls back calmly as the arrangement fades out]'
    : isAcappella
      ? '[Soft, exposed final vocal phrase fading into quiet room air]'
      : '[Arrangement softens into space with one lingering, honest vocal breath]';

  const preCue1 = isPureRap
    ? '[Cadence leans forward, building tension into the hook]'
    : '[Melody climbs gently with open vowels into the chorus]';

  const preCue2 = isPureRap
    ? '[Brief vocal pause before snapping back into the hook]'
    : '[Soft breath pause before lifting back into the chorus]';

  const verse1TurnCue = isPureRap
    ? '[Poetic turn: dense internal rhyme pattern breaks into two stark, direct landing lines]'
    : '[Dynamics soften slightly, holding emotional tension right before the pre-chorus climb]';

  const chorusBody = [
    `${hook.question}? (${hook.echo})`,
    hook.followUpQuestions[0],
    `${hook.question}? (${hook.echo})`,
    hook.followUpQuestions[1],
    peakCue,
    hook.followUpQuestions[2],
    'Tell me the truth right now',
    'Before the silence answers for us',
  ];

  const finalChorusBlock = [
    finalChorusCue,
    `${hook.statement} (${hook.echo})`,
    hook.followUpStatements[0],
    `${hook.statement} (${hook.echo})`,
    hook.followUpStatements[1],
    peakCue,
    `${hook.followUpStatements[2]} (${hook.echo})`,
    'No more hiding what was always real',
  ];

  const sections: Section[] = [
    {
      label: tag('Verse 1'),
      lines: [
        verse1Cue,
        settings[0],
        details[0],
        details[1],
        settings[1],
        verse1TurnCue,
        'You kept your head down and your promise tight',
        'Never knew how far one honest word could carry through the night',
      ],
    },
    {
      label: tag('Pre-Chorus'),
      lines: [
        preCue1,
        'Maybe the hard road was never meant to break you',
        'Maybe every heavy hour was shaping what stayed true',
        'Look back at the mirror and say it out loud',
      ],
    },
    {
      label: tag('Chorus'),
      lines: [chorus1Cue, ...chorusBody],
    },
    {
      label: tag('Verse 2'),
      lines: [
        verse2Cue,
        settings[2],
        details[2],
        'If you could sit across from who you were before',
        details[3],
        settings[3],
        'You would tell that version to keep an open heart',
        'Every quiet scar we carried taught us how to stand',
      ],
    },
    {
      label: tag('Pre-Chorus'),
      lines: [
        preCue2,
        'Maybe the hard road was never meant to break you',
        'Maybe every heavy hour was shaping what stayed true',
        'Take a breath and let the whole room hear it clear',
      ],
    },
    {
      label: tag('Chorus'),
      lines: [chorus2Cue, ...chorusBody],
    },
    {
      label: tag('Bridge'),
      lines: [
        bridgeCue1,
        hook.bridgeQuestion,
        turns[0],
        'What if the waiting was the gift we did not recognize?',
        bridgeCue2,
        turns[1] ?? turns[0],
        'Not asking for permission anymore',
        'Already lived the answer',
      ],
    },
    {
      label: tag('Final Chorus'),
      lines: finalChorusBlock,
    },
    {
      label: tag('Outro'),
      lines: [
        outroCue,
        outros[0],
        `${outros[1] ?? outros[0]} (${hook.echo})`,
        outros[2] ?? outros[0],
      ],
    },
  ];

  const lyrics = sections.map((s) => [s.label, ...s.lines].join('\n')).join('\n');
  return { title: hook.title, lyrics };
}
