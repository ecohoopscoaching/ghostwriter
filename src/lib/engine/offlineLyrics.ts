/**
 * Built-in offline song lyric writer.
 *
 * Produces complete, structured original songs tailored to the user's topic,
 * genre, mood, artist writing style, producer feel, and voice preset — with
 * simple section labels and short bracketed vocal cues. Every seed rolls a
 * fresh combination of title, imagery, verse frames, hook cadence, and bridge.
 */
import type { Palette } from '@/data/moods';
import type { Rng } from './rng';
import type { Section } from './lyrics';
import { serialize } from './lyrics';
import type { SoundSpec } from './types';

interface ImageryBank {
  settings: string[];
  details: string[];
  anchors: string[];
  turns: string[];
  outros: string[];
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
      'I folded up the promises and left them on the shelf',
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
      'Let the last note fade to black',
      'Still standing in the quiet',
    ],
  },
  fire: {
    settings: [
      'Check the scoreboard now, remember how they counted me out',
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
      'Turned the doubt into a drumbeat that keeps driving through the floor',
      'Now the room goes quiet soon as we step through the frame',
    ],
    anchors: [
      'You cannot break a foundation that was poured in the fire',
      'We did not come this far just to whisper at the top',
      'Every loss became the blueprint for the way we move tonight',
      'Stand tall in the smoke and let the whole block hear it ring',
    ],
    turns: [
      'Put your hands up if you made it out the deep end',
      'I owe nothing to the shadows that tried holding me down',
      'When the pressure hits the ceiling, watch us raise the roof',
      'This is not luck, this is patience meeting thunder',
    ],
    outros: [
      'Let the drums ride out',
      'Still standing, still here',
      'Say it one more time for the ones who kept the faith',
      'Crown heavy, head high',
    ],
  },
  glow: {
    settings: [
      'Golden hour spilling slow across your shoulders in the room',
      'Windows rolled down, warm wind moving through the avenue',
      'Candlelight dancing on the glass while the record spins',
      'Morning sun breaking soft across the edge of the bed',
      'City lights shimmering like water underneath our feet',
      'Slow dance in the kitchen with no music but your pulse',
    ],
    details: [
      'Every time you look at me the static fades away',
      'You pull me from the noise into a place that feels like home',
      'No need to rush the clock when every second tastes like this',
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
      'If this is what forever feels like, pour another round',
      'Take a breath and lean in closer, let the melody hold us',
      'Every road I ever walked was leading straight to you',
    ],
    outros: [
      'Hold me in the afterglow',
      'Right here, right now',
      'Slow fade in the warm light',
      'Stay close till the morning',
    ],
  },
  shadow: {
    settings: [
      'Midnight on the avenue, the engine humming low in neutral',
      'Fog rolling off the river, neon reflecting off the chrome',
      'No witnesses, no alibi, just shadows on the glass',
      'Tinted windows up while the bass shakes through the frame',
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
      'Cold blood, steady hand, never flinching in the glare',
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
  },
};

function cleanTopic(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  return t || 'midnight confessions';
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

function makeTitle(topic: string, rng: Rng): string {
  const words = topic
    .replace(/[^a-zA-Z0-9\s'-]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= 4 && words.length > 0) {
    return titleCase(words.join(' '));
  }
  const core = words.slice(0, 3).join(' ');
  const frames = [
    () => titleCase(core),
    () => titleCase(`${core} Tonight`),
    () => titleCase(`After ${core}`),
    () => titleCase(`Still ${core}`),
  ];
  return rng.pick(frames)();
}

function voiceCues(spec: SoundSpec, rng: Rng): {
  intro: string;
  verse1: string;
  pre: string;
  chorus: string;
  verse2: string;
  bridge: string;
  finalChorus: string;
  outro: string;
} {
  const vid = spec.voice.id;
  const isRap = spec.isRap;

  if (isRap) {
    return {
      intro: rng.pick(['[low, spoken]', '[dry, close mic]']),
      verse1: spec.flowMode.verse1Cue,
      pre: '[build tension]',
      chorus: spec.voice.gender === 'female' ? '[full mixed voice]' : '[strong hook, forward]',
      verse2: spec.flowMode.verse2Cue,
      bridge: '[stripped back, raw]',
      finalChorus: '[full voice, layered]',
      outro: '[spoken, fade out]',
    };
  }

  if (spec.voice.category === 'tenor') {
    return {
      intro: '[soft, warm low]',
      verse1: '[close, conversational]',
      pre: '[lift into mix]',
      chorus: '[bright mask, full]',
      verse2: '[warm, rhythmic]',
      bridge: '[gospel run, soar]',
      finalChorus: '[falsetto peak, control]',
      outro: '[soft falsetto, breath]',
    };
  }
  if (spec.voice.category === 'baritone') {
    return {
      intro: '[deep baritone, low]',
      verse1: '[warm, close mic]',
      pre: '[smooth rise, mix]',
      chorus: '[rich chest, forward]',
      verse2: '[steady, grounded]',
      bridge: '[gospel melisma, lift]',
      finalChorus: '[steady falsetto, full]',
      outro: '[low baritone, fade]',
    };
  }
  if (vid === 'voc-fem-4') {
    return {
      intro: '[low, warm, even]',
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
    intro: '[warm low, intimate]',
    verse1: '[low anchor, rhythmic]',
    pre: '[agile lift]',
    chorus: '[ringing head voice]',
    verse2: '[percussive, melodic]',
    bridge: '[syncopated, free]',
    finalChorus: '[multi-octave crown]',
    outro: '[warm low, fade]',
  };
}

export function generateOfflineSong(
  topicRaw: string,
  spec: SoundSpec,
  rng: Rng,
): { title: string; lyrics: string } {
  const topic = cleanTopic(topicRaw);
  const topicLower = topic.toLowerCase();
  const title = makeTitle(topic, rng);
  const bank = BANKS[spec.mood.palette];
  const cues = voiceCues(spec, rng);

  const settings = rng.shuffle(bank.settings);
  const details = rng.shuffle(bank.details);
  const anchors = rng.shuffle(bank.anchors);
  const turns = rng.shuffle(bank.turns);
  const outros = rng.shuffle(bank.outros);

  const isSoulSwitch = spec.persona.id === 'soulswitch';

  const chorusLines = [
    `All about ${topicLower}, feel it running through the night`,
    anchors[0],
    `Hold onto ${topicLower}, do not let it slip from sight`,
    anchors[1] ?? anchors[0],
  ];

  const sections: Section[] = [
    {
      label: '[Intro]',
      lines: [
        cues.intro,
        `Yeah, thinking about ${topicLower}`,
        `${outros[0]}`,
      ],
    },
    {
      label: '[Verse 1]',
      lines: [
        cues.verse1,
        settings[0],
        `Still got ${topicLower} sitting heavy on my mind`,
        details[0],
        details[1],
        settings[1],
        `Trying to put the pieces of ${topicLower} in line`,
      ],
    },
    {
      label: '[Pre-Chorus]',
      lines: [
        cues.pre,
        `Can you feel the room shift when the truth comes out`,
        `No more running from ${topicLower}, hear me now`,
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
        details[2],
        `Every mile we traveled brought ${topicLower} back around`,
        details[3],
        settings[3],
        `Now we say it out loud, no holding back the sound`,
      ],
    },
    {
      label: '[Pre-Chorus]',
      lines: [
        cues.pre,
        `Can you feel the room shift when the truth comes out`,
        `No more running from ${topicLower}, hear me now`,
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
        `Even when the walls shake, ${topicLower} stays true`,
        turns[1] ?? turns[0],
        anchors[2] ?? anchors[0],
      ],
    },
    {
      label: '[Chorus]',
      lines: [cues.finalChorus, ...chorusLines],
    },
    {
      label: '[Outro]',
      lines: [
        cues.outro,
        `${title}, let it breathe`,
        outros[1] ?? outros[0],
      ],
    },
  ];

  return { title, lyrics: serialize(sections) };
}

// ──────────────────────── ACE Music Native Songwriter ────────────────────────

interface AceHookPair {
  title: string;
  question: string;
  echo: string;
  statement: string;
  bridgeQuestion: string;
  followUpQuestions: [string, string, string];
  followUpStatements: [string, string, string];
}

function buildAceHook(topic: string, rng: Rng): AceHookPair {
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

  if (/\bman enough\b|\benough\b/.test(lower)) {
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

  if (/\bleave\b|\bletting go\b|\bgoodbye\b|\blost\b|\bheartbreak\b/.test(lower)) {
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

  const coreTitle = makeTitle(topic, rng);
  const shortEcho = coreTitle.toLowerCase();
  return {
    title: coreTitle,
    question: `Is it ${shortEcho}`,
    echo: shortEcho,
    statement: `It is ${shortEcho}`,
    bridgeQuestion: 'What if the answer was inside us all along?',
    followUpQuestions: [
      'When the lights go low and the truth speaks up?',
      'When the weight gets heavy in the middle of the night?',
      'When we drop the armor and just say it plain?',
    ],
    followUpStatements: [
      'Now the lights are low and the truth speaks clear',
      'Even when the weight gets heavy in the night',
      'We can drop the armor and just say it plain',
    ],
  };
}

/**
 * Generates a complete ACE Music native-format song:
 * - Vocal gender markers on every section tag ([Verse 1: male] / [Verse 1: female])
 * - Cold open (voice starts at 0:00 or after a brief instrumental under ~15s)
 * - Standalone bracketed production/delivery directions + optional trailing cues
 * - Backing vocal echoes in parentheses (...) only
 * - Full 10-section structure (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2,
 *   Pre-Chorus, Chorus, Bridge, Final Chorus, Outro)
 * - Chorus carries the title as a QUESTION; Bridge changes the question;
 *   Final Chorus flips it to a STATEMENT; Outro mirrors the Intro.
 */
export function generateAceOfflineSong(
  topicRaw: string,
  spec: SoundSpec,
  rng: Rng,
): { title: string; lyrics: string } {
  const topic = cleanTopic(topicRaw);
  const g = spec.gender;
  const tag = (name: string) => `[${name}: ${g}]`;
  const hook = buildAceHook(topic, rng);
  const bank = BANKS[spec.mood.palette];

  const settings = rng.shuffle(bank.settings);
  const details = rng.shuffle(bank.details);
  const turns = rng.shuffle(bank.turns);
  const outros = rng.shuffle(bank.outros);

  const leadInst = spec.persona.sound.instruments?.[0] ?? 'warm Rhodes chords';
  const drumCue = spec.persona.sound.drums?.[0] ?? 'crisp, laid-back drum groove';
  const bassCue = spec.persona.sound.bass?.[0] ?? 'deep controlled bass';

  const isRapVoice = spec.voice.category === 'rap';
  const isPureRap = spec.isRap && spec.flowMode.id !== 'melodic-rap';

  const peakCue = isPureRap
    ? '[Lead rap delivery locks into sharp, emphatic cadence with crisp internal rhymes, no singing]'
    : isRapVoice
      ? '[Melodic rap hook opens vowels on the key phrase with tight rhythmic doubles]'
      : spec.voice.id === 'voc-fem-4'
        ? '[Lead vocal carries full, seamless mixed voice into the upper range with no break, intentional run on the key word]'
        : spec.voice.id === 'voc-fem-2'
          ? '[Lead vocal crowns the hook in a ringing multi-octave head voice with controlled melisma on the payoff word]'
          : spec.voice.id === 'voc-fem-1' || spec.voice.id === 'voc-fem-5'
            ? '[Lead vocal rises into clean, controlled whistle-register peaks with space to breathe]'
            : spec.voice.id === 'voc-fem-3'
              ? '[Lead contralto holds deep, smoky velvet weight across the open vowels of the hook]'
              : '[Lead vocal shifts into a strong, steady falsetto with one purposeful gospel run landing on the title phrase]';

  const lowCue = spec.isRap
    ? spec.flowMode.aceVerse1Cue
    : spec.voice.gender === 'female'
      ? '[Warm, grounded low register inside the pocket, intimate and conversational with space to breathe]'
      : '[Warm, seasoned chest voice inside the pocket, intimate and conversational with space to breathe]';

  const verse2DeliveryCue = spec.isRap
    ? spec.flowMode.aceVerse2Cue
    : '[Restrained background harmonies warm the edges without crowding the lead pocket]';

  const introDirection = isPureRap
    ? `[Cold open: brief ${leadInst} under 10 seconds, dry close-mic ${g} rap entry]`
    : `[Cold open: brief ${leadInst} under 10 seconds with soft, unhurried ${g} vocal hum]`;

  const chorus1Direction = isPureRap
    ? `[Full ${drumCue} hits with ${bassCue}; lead rap hook forward with crisp doubles]`
    : `[Restrained emotional release: ${drumCue} settles into the pocket with ${bassCue}, lead vocal open and clear]`;

  const chorus2Direction = isPureRap
    ? `[Heavy ${drumCue} and tight stacked rap doubles punch back in with higher intensity]`
    : `[Fuller release: ${drumCue} deepens as purposeful background harmonies lift the lead vocal]`;

  const finalChorusDirection = isPureRap
    ? '[Climax: hard-hitting full-energy rap hook with emphatic ad-lib echoes in the pocket]'
    : '[Peak emotional release: exposed chest-to-falsetto replay moment with purposeful harmonies and spontaneous ad-libs in the gaps]';

  const bridgeDirection1 = isPureRap
    ? '[Beat strips back to sparse bass and percussion; stark, focused spoken-rap turn]'
    : '[Music strips back to sparse chords and deep sub bass; raw whisper-to-chest confession, letting the breath show]';

  const bridgeDirection2 = isPureRap
    ? '[Cadence tightens bar by bar, building straight into the final hook drop]'
    : '[Purposeful background harmonies swell behind one sustained open-vowel line]';

  const outroDirection = isPureRap
    ? `[Drums strip back to ${leadInst} and fading bass, mirroring the cold open]`
    : `[Drums and bass fade out, mirroring the intro with warm ${leadInst} and one lingering, honest breath]`;

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
    `Tell me now (${hook.question}?)`,
    'If I finally let it show',
  ];

  const chorus1Block = [chorus1Direction, ...chorusBody];
  const chorus2Block = [chorus2Direction, ...chorusBody];

  const finalChorusBlock = [
    finalChorusDirection,
    `${hook.statement} (${hook.question}?)`,
    `(${hook.echo}) ${hook.followUpStatements[0]}`,
    `${hook.statement} (${hook.echo})`,
    hook.followUpStatements[1],
    peakCue,
    `${hook.followUpStatements[2]} (${hook.echo})`,
    `Yeah, ${hook.statement.toLowerCase()}`,
    'And I do not have to hide no more',
  ];

  const topicLine =
    /\bworth it\b|\bhard years\b|\byounger self\b/i.test(topic)
      ? 'Talking to my younger self, telling him the hard years were worth it'
      : spec.perspective?.id === 'second-person'
        ? `You still carry ${hook.title.toLowerCase()} every time the room goes still`
        : spec.perspective?.id === 'third-person'
          ? `They still carry ${hook.title.toLowerCase()} every time the room goes still`
          : spec.perspective?.id === 'collective-we'
            ? `We still carry ${hook.title.toLowerCase()} everywhere the road takes us`
            : topic.split(/\s+/).length <= 5
              ? `Thinking back on ${topic.toLowerCase()}`
              : `Carrying the whole weight of ${hook.title.toLowerCase()} in my chest`;

  const sections: Section[] = [
    {
      label: tag('Intro'),
      lines: [
        introDirection,
        hook.title,
        isPureRap ? 'Yeah, listen' : 'Mmm',
        `${hook.title} (${hook.echo})`,
      ],
    },
    {
      label: tag('Verse 1'),
      lines: [
        `[${drumCue.charAt(0).toUpperCase() + drumCue.slice(1)} enters with ${bassCue}]`,
        lowCue,
        settings[0],
        topicLine,
        details[0],
        details[1],
        verse1TurnCue,
        settings[1],
        'I kept my head down and my promise tight',
        'Never knew how far a quiet prayer could carry through the night',
      ],
    },
    {
      label: tag('Pre-Chorus'),
      lines: [
        isPureRap
          ? `[Percussion tightens over ${leadInst}, building tension into the hook]`
          : `[Sustained warm pads and gentle ${leadInst} open up an intimate pocket, melody climbing]`,
        'Maybe the hard road was never meant to break me',
        'Maybe every heavy hour was shaping who I had to be',
        'Look back at the mirror and tell the truth out loud [Snare roll build-up]',
      ],
    },
    {
      label: tag('Chorus'),
      lines: chorus1Block,
    },
    {
      label: tag('Verse 2'),
      lines: [
        spec.persona.id === 'soulswitch'
          ? '[Beat switch: tape-stop silence explodes into heavy 808 slides and sharp trap percussion]'
          : `[Instrumentation strips back to tight ${drumCue} and sparse ${leadInst}]`,
        settings[2],
        details[2],
        `If I could sit across from who I was before`,
        details[3],
        verse2DeliveryCue,
        settings[3],
        'I would tell that kid to keep his heart unhardened',
        'Every single scar we earned is turning into gold tonight',
      ],
    },
    {
      label: tag('Pre-Chorus'),
      lines: [
        `[Drums drop out briefly, leaving only ${leadInst} and atmospheric space]`,
        'Maybe the hard road was never meant to break me',
        'Maybe every heavy hour was shaping who I had to be',
        'Take a breath and let the whole room hear it clear [Drum fill build-up]',
      ],
    },
    {
      label: tag('Chorus'),
      lines: chorus2Block,
    },
    {
      label: tag('Bridge'),
      lines: [
        bridgeDirection1,
        hook.bridgeQuestion,
        turns[0],
        'What if the waiting was the gift we did not recognize?',
        bridgeDirection2,
        turns[1] ?? turns[0],
        'I am not asking for permission anymore',
        'I already lived the answer [Full band swell into final chorus]',
      ],
    },
    {
      label: tag('Final Chorus'),
      lines: finalChorusBlock,
    },
    {
      label: tag('Outro'),
      lines: [
        outroDirection,
        hook.title,
        isPureRap ? 'Still here' : 'Mmm',
        `${outros[0]} (${hook.echo})`,
        hook.title,
        '[Final chord resonates and fades to silence]',
      ],
    },
  ];

  // ACE native format uses single newlines between sections (compact like the reference example).
  const lyrics = sections.map((s) => [s.label, ...s.lines].join('\n')).join('\n');
  return { title: hook.title, lyrics };
}
