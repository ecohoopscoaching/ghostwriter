/**
 * Complete Rap & R&B Topic Bible — 10 categories, 92 themes, 368 specific scenes.
 * Rule: Convert every topic into a scene, confession, memory, conversation, or lived experience.
 * Formula: Character + Situation + Emotion + Stakes + Specific Scene.
 */

export type TopicCategoryId =
  | 'family-legacy'
  | 'love-relationships'
  | 'heartbreak-loss'
  | 'personal-growth'
  | 'career-money'
  | 'sex-temptation'
  | 'music-industry'
  | 'dark-emotional'
  | 'everyday-people'
  | 'character-inspired';

export interface TopicCategory {
  id: TopicCategoryId;
  label: string;
}

export interface TopicItem {
  id: string;
  label: string;
  category: TopicCategoryId;
  /** Specific, detailed song scenes/angles inside this broader theme. */
  scenes: string[];
}

export const TOPIC_BIBLE_RULE =
  'Convert every topic into a scene, confession, memory, conversation, or lived experience.';

export const SONGWRITING_FORMULA =
  'Character + Situation + Emotion + Stakes + Specific Scene';

export const TOPIC_CATEGORIES: TopicCategory[] = [
  { id: 'family-legacy', label: 'Family & Legacy' },
  { id: 'love-relationships', label: 'Love & Relationships' },
  { id: 'heartbreak-loss', label: 'Heartbreak & Loss' },
  { id: 'personal-growth', label: 'Personal Growth' },
  { id: 'career-money', label: 'Career & Money' },
  { id: 'sex-temptation', label: 'Sex & Temptation' },
  { id: 'music-industry', label: 'The Music Industry' },
  { id: 'dark-emotional', label: 'Dark & Emotional' },
  { id: 'everyday-people', label: 'Everyday People' },
  { id: 'character-inspired', label: 'Character-Inspired' },
];

interface RawTopicEntry {
  label: string;
  scenes: string[];
}

const RAW_TOPICS: Record<TopicCategoryId, RawTopicEntry[]> = {
  'family-legacy': [
    {
      label: 'Becoming a father',
      scenes: [
        'Driving home from the hospital slower than you have ever driven with a car seat in the back',
        'Holding your newborn at 3 AM and promising not to repeat the mistakes your own father made',
        'Feeling terrified you are not ready while everyone in the waiting room calls you strong',
        'Realizing the reckless version of you ended the second you heard their first cry',
      ],
    },
    {
      label: 'Becoming a mother',
      scenes: [
        'Looking in the mirror after delivery and meeting a version of yourself you do not recognize yet',
        'Quietly crying in the nursery at 4 AM while loving somebody harder than you knew was possible',
        'Protecting your peace and your baby from the same chaos you grew up surviving',
        'Hearing your own mother’s voice come out of your mouth for the first time',
      ],
    },
    {
      label: 'Missing your children after divorce',
      scenes: [
        'Sunday night drop-off in a quiet driveway when the house goes silent ten minutes later',
        'Leaving their toothbrush and half-finished drawing untouched until next weekend',
        'Trying not to sound broken on a five-minute FaceTime before bedtime',
        'Missing a school milestone because the calendar said it was not your week',
      ],
    },
    {
      label: 'Raising a child with special needs',
      scenes: [
        'Fighting through doctors, forms, and sideways stares while celebrating a small milestone nobody else noticed',
        'Sitting in the parked car after therapy appointments taking five minutes to breathe before going inside',
        'Learning to hear love in gestures instead of words',
        'Wondering who will protect them with the same patience long after you are gone',
      ],
    },
    {
      label: 'Caring for aging parents',
      scenes: [
        'Realizing the parent who raised you now asks you to hold their hand crossing the parking lot',
        'Answering the same question three times with patience while grieving who they used to be',
        'Cleaning out the family hallway and finding old photographs from before they ever looked tired',
        'Becoming the adult in the room while still feeling like their kid underneath',
      ],
    },
    {
      label: 'Family secrets',
      scenes: [
        'Everyone smiling at Sunday dinner while pretending the loudest truth is not sitting at the table',
        'Finding an old letter in a closet that explains twenty years of quiet tension',
        'Being told to keep quiet to protect the family name while the silence hurts you',
        'The holiday phone call where somebody finally says what nobody was allowed to mention',
      ],
    },
    {
      label: 'Sibling rivalry',
      scenes: [
        'Growing up under the same roof while living through two completely different versions of your parents',
        'Still competing at thirty over praise neither of you got at thirteen',
        'Loving your sibling fiercely while hating how easily they still get under your skin',
        'Sitting side by side at a family dinner acting like strangers who share the same last name',
      ],
    },
    {
      label: 'Adoption story',
      scenes: [
        'Looking at faces in a crowded airport and wondering if you share somebody’s eyes',
        'Loving the parents who chose you while still carrying questions about where you started',
        'Finally holding the unopened file with your birth name written on the tab',
        'Realizing family is built in the midnight fevers and packed lunches, not just blood',
      ],
    },
    {
      label: 'Grandparents raising grandchildren',
      scenes: [
        'Starting over in your sixties with school drop-offs and tired knees because the kids needed a safe home',
        'Remembering your grandmother’s kitchen light as the only steady place in your childhood',
        'Watching your granddad stretch a pension check so you never felt what was missing',
        'Finally being old enough to understand the quiet sacrifices they never complained about',
      ],
    },
    {
      label: 'Generational trauma',
      scenes: [
        'Catching yourself raising your voice in the exact tone you swore you would never use',
        'Tracing an old anger back three generations and deciding it stops with you',
        'Learning how to apologize out loud in a family where nobody ever said I am sorry',
        'Carrying survival habits from a house you moved out of ten years ago',
      ],
    },
    {
      label: 'Breaking family curses',
      scenes: [
        'Being the first one to choose therapy, stability, or quiet over familiar chaos',
        'Feeling guilty for leaving the cycle behind while the people you love are still inside it',
        'Building a calm home that feels strangely unfamiliar at first because peace was never normal',
        'Giving your kids a childhood they will not have to heal from',
      ],
    },
    {
      label: 'Family reunion after tragedy',
      scenes: [
        'Everybody finally in the same living room only because somebody had to pass away first',
        'Passing paper plates and old stories while realizing how many years were wasted on pride',
        'Hugging a cousin you have not spoken to in six years outside the church steps',
        'Promising to stay close this time and wondering if anybody actually will',
      ],
    },
  ],
  'love-relationships': [
    {
      label: 'Friends becoming lovers',
      scenes: [
        'Laughing on the couch at midnight until one glance changes five years of friendship',
        'Being terrified to ruin the best friendship you have by saying what you finally feel',
        'Realizing you already know how they take their coffee and every scar they hide',
        'The morning after crossing the line when everything feels familiar and brand new at once',
      ],
    },
    {
      label: 'Long-distance love',
      scenes: [
        'Falling asleep on FaceTime with a three-hour time difference and a dying phone battery',
        'Counting down boarding passes while hating how short airport goodbyes always feel',
        'Wearing their hoodie on a rainy Tuesday because a text message is not enough',
        'Fighting over small misunderstandings that would have been fixed in five seconds in person',
      ],
    },
    {
      label: 'Reconnecting years later',
      scenes: [
        'Running into each other at a coffee shop and realizing the spark never actually died',
        'Talking for three hours about who you both became since the version of you that broke up',
        'Wondering if timing finally caught up or if you are just nostalgic for who you were',
        'Seeing their name light up your screen after five quiet years',
      ],
    },
    {
      label: 'Unrequited love',
      scenes: [
        'Listening to them talk about somebody else while pretending it does not wreck you',
        'Showing up for every emergency hoping one day they finally look at you differently',
        'Memorizing their favorite songs while knowing you are never the person they call at 2 AM',
        'Deciding to walk away before loving them quietly empties you out',
      ],
    },
    {
      label: 'Secret romance',
      scenes: [
        'Deleting text threads before walking back into a room full of mutual friends',
        'Meeting in parked cars two neighborhoods away where nobody knows your names',
        'Acting polite in public five minutes after being tangled up in private',
        'Getting tired of hiding something that feels like the only real thing in your week',
      ],
    },
    {
      label: 'Forbidden love',
      scenes: [
        'Choosing each other even though both families already wrote the ending off',
        'Every warning from your friends making you hold on tighter in the dark',
        'Knowing the fallout is coming and still refusing to let go of their hand',
        'Standing between loyalty to where you come from and the person who actually sees you',
      ],
    },
    {
      label: 'Online relationship',
      scenes: [
        'Knowing somebody’s whole soul through voice notes before you have ever heard them laugh in the same room',
        'Waiting at baggage claim with shaking hands for the first real hug',
        'Explaining to skeptical friends how somebody across a screen feels closer than anyone in your city',
        'Wondering if the real-life silence will feel as easy as the 2 AM messages',
      ],
    },
    {
      label: 'Love after divorce',
      scenes: [
        'Letting somebody new hold your hand while your guard is still built out of old scars',
        'Flinching at a harmless question because your last marriage trained you for war',
        'Realizing peace in a relationship does not mean the love is boring',
        'Taking off the old armor slowly for someone who never asked you to beg for kindness',
      ],
    },
    {
      label: 'First love memories',
      scenes: [
        'Hearing a song from ten summers ago at a gas station and being right back in that old sedan',
        'Remembering how invincible you felt before either of you knew how heartbreak worked',
        'Driving past the old corner where you used to talk until the streetlights came on',
        'Wishing them well from afar while keeping one small corner of memory untouched',
      ],
    },
    {
      label: 'Growing old together',
      scenes: [
        'Still making each other laugh in the grocery aisle twenty years after the honeymoon phase',
        'Quiet Sunday mornings with gray hair, warm coffee, and no need to fill the silence',
        'Choosing each other through the unglamorous seasons nobody posts pictures of',
        'Holding hands on the porch knowing you built a whole life out of ordinary days',
      ],
    },
  ],
  'heartbreak-loss': [
    {
      label: 'Being ghosted',
      scenes: [
        'Staring at a delivered message from three days ago while watching them post stories like nothing happened',
        'Re-reading the last week of texts trying to find the exact sentence where they changed their mind',
        'Realizing silence was their loudest answer and you have to give yourself closure',
        'Hating that you did not even get an argument—just an empty thread',
      ],
    },
    {
      label: 'Being cheated on',
      scenes: [
        'Seeing one name flash on a face-down phone and watching five years collapse in two seconds',
        'Replaying every late night and excuse now that the puzzle pieces finally click',
        'Still loving the version of them you thought existed while standing in front of a stranger',
        'Packing your bags in complete calm because the screaming already happened inside your head',
      ],
    },
    {
      label: 'Leaving a toxic relationship',
      scenes: [
        'Leaving the spare key on the kitchen counter while they are still asleep so you do not get talked into staying',
        'Missing the highs while refusing to go back to the version of yourself who begged for peace',
        'Breathing deeply on the highway with a trunk full of clothes and no plan yet',
        'Realizing you were shrinking every day just to keep the room from exploding',
      ],
    },
    {
      label: 'Watching an ex move on',
      scenes: [
        'Seeing them give somebody else the exact effort you begged for over three years',
        'Scrolling past a smiling photo and pretending your chest did not just drop',
        'Hearing from a mutual friend that they look happier than ever',
        'Wondering whether they actually changed or just started over with someone who does not know their history',
      ],
    },
    {
      label: 'Trust issues',
      scenes: [
        'Testing somebody good because the last person taught you to expect betrayal',
        'Reading danger into a delayed reply when nothing is actually wrong',
        'Keeping one foot near the door even while saying you want to stay',
        'Asking for patience while you unlearn habits that used to protect you',
      ],
    },
    {
      label: 'Closure never received',
      scenes: [
        'Carrying an unfinished conversation in your head for two years after they vanished',
        'Writing a long message in your notes app that you know you will never send',
        'Accepting that you will never hear the apology you actually deserved',
        'Seeing them across a crowded room and realizing the question no longer hurts the same',
      ],
    },
    {
      label: 'Regret years later',
      scenes: [
        'Finally maturing enough to see how badly you fumbled the best person in your corner',
        'Driving past their old neighborhood wishing you had apologized when it still mattered',
        'Realizing pride kept you from making one phone call that could have changed everything',
        'Living with the lesson even though the person who taught you is long gone',
      ],
    },
    {
      label: 'One final conversation',
      scenes: [
        'Sitting across a diner booth swapping keys and returning a hoodie without raising your voices',
        'Saying the honest truths neither of you could admit while you were still together',
        'Hugging in the parking lot knowing neither of you is going to look back this time',
        'Ending with gratitude instead of war even though your heart is still shaking',
      ],
    },
    {
      label: 'Finding peace after loss',
      scenes: [
        'Waking up one morning and realizing an entire week went by without checking their page',
        'Making coffee for one and finally liking the quiet in the apartment',
        'Keeping the good memories without wishing for the pain that came attached to them',
        'Opening the blinds for the first time in months and feeling like yourself again',
      ],
    },
  ],
  'personal-growth': [
    {
      label: 'Reinventing yourself',
      scenes: [
        'Outgrowing the old friend group and feeling lonely in the gap before the new chapter starts',
        'Throwing out the habits that kept you numb so you can finally meet who you actually are',
        'Returning to your hometown changed while everyone still expects the old version of you',
        'Starting over from scratch at an age people told you was too late',
      ],
    },
    {
      label: 'Recovering from addiction',
      scenes: [
        'Counting quiet sober days one morning at a time while avoiding the streets that used to pull you back',
        'Calling a sponsor at midnight when the urge hits harder than expected',
        'Apologizing to people you hurt without expecting them to trust you overnight',
        'Feeling real emotions without anything to dull the edges for the first time in years',
      ],
    },
    {
      label: 'Escaping self-doubt',
      scenes: [
        'Silencing the voice in your head that sounds like every person who underestimated you',
        'Walking into a room you used to think you did not belong in and taking your seat',
        'Stopping yourself from sabotaging something good right before it works',
        'Looking back at what you survived and realizing you were never weak',
      ],
    },
    {
      label: 'Finding purpose',
      scenes: [
        'Walking away from chasing applause to build something that actually matters at 3 AM',
        'Recognizing the exact detour that wrecked your old plan was pointing you home',
        'Trading noise and busyness for one clear mission you can stand behind',
        'Waking up before the alarm because you finally care about what you are building',
      ],
    },
    {
      label: 'Spiritual awakening',
      scenes: [
        'Sitting alone in a quiet car during a storm and feeling peace you cannot explain',
        'Praying honestly for the first time without polished church words',
        'Letting go of control after trying to force every door open with your bare hands',
        'Seeing grace in the moments you used to call curses',
      ],
    },
    {
      label: 'Forgiving yourself',
      scenes: [
        'Stopping the courtroom replay in your head over mistakes you made when you were only surviving',
        'Talking to your younger self with the compassion nobody gave you back then',
        'Realizing guilt does not pay any debt—changing how you move does',
        'Finally putting down a shame you have carried for a decade',
      ],
    },
    {
      label: 'Surviving rock bottom',
      scenes: [
        'Sleeping on a borrowed couch with six dollars left and deciding this is not where the story ends',
        'Remembering the night nobody answered your call and how you still got up the next morning',
        'Finding out who was real when you had nothing left to offer anyone',
        'Standing in the light today while never forgetting the dark floor that built your spine',
      ],
    },
    {
      label: 'Building confidence',
      scenes: [
        'Moving in quiet certainty instead of explaining yourself to rooms that never listened',
        'Keeping every small promise to yourself until your own word feels solid again',
        'Walking away from one-sided tables without slamming the door',
        'Realizing real confidence never has to shout to be felt',
      ],
    },
    {
      label: 'Healing childhood wounds',
      scenes: [
        'Recognizing why a slammed door still makes your heart race twenty years later',
        'Giving yourself the safety and warmth you waited for as a kid',
        'Stopping the habit of earning love by shrinking your own needs',
        'Sitting on the porch in peace knowing the storm from childhood is finally over',
      ],
    },
  ],
  'career-money': [
    {
      label: 'Entrepreneur struggles',
      scenes: [
        'Paying everybody else on Friday while checking your own bank balance in the dark',
        'Smiling at clients all day while wondering how you will make rent by the first',
        'Building at 2 AM in a quiet apartment while friends ask when you are getting a real job',
        'Refusing to fold during the silent year right before anything starts paying off',
      ],
    },
    {
      label: 'Dead-end job',
      scenes: [
        'Staring at the breakroom clock watching your dreams get traded ten dollars an hour at a time',
        'Sitting in traffic in a uniform that never fit who you knew you were',
        'Writing lyrics on receipt paper behind the register while waiting for your shift to end',
        'Handing in your badge on a Tuesday and feeling ten pounds lighter in the parking lot',
      ],
    },
    {
      label: 'Corporate burnout',
      scenes: [
        'Answering Slack messages at 11 PM while forgetting the last time you felt genuinely excited',
        'Wearing a polite smile on Zoom while quietly falling apart behind the camera',
        'Chasing a promotion only to realize the ladder was leaning against the wrong wall',
        'Closing the laptop on Friday and realizing you have nothing left for the people you love',
      ],
    },
    {
      label: 'Lottery winner story',
      scenes: [
        'Watching old numbers light up your phone the same week your bank account hit zero',
        'Discovering how fast strangers turn into cousins once the money shows up',
        'Paying off your mother’s mortgage in silence before buying anything flashy',
        'Realizing money erased the bills but exposed every crack in your circle',
      ],
    },
    {
      label: 'First paycheck',
      scenes: [
        'Holding that first real direct deposit and buying groceries without calculating every aisle',
        'Treating your mom to dinner and insisting she put her purse away',
        'Remembering the empty fridge that made this modest check feel like a million',
        'Catching yourself smiling at the gas pump because you filled the whole tank',
      ],
    },
    {
      label: 'Starting a business',
      scenes: [
        'Turning a kitchen table and a cracked laptop into your first real office',
        'Making the very first sale to a stranger who actually believed in what you built',
        'Betting your last savings on an idea nobody around you understood yet',
        'Packing orders past midnight with sore hands and a wide-awake smile',
      ],
    },
    {
      label: 'Getting laid off',
      scenes: [
        'A ten-minute HR call erasing six years of loyalty before lunch',
        'Carrying a cardboard box to your car wondering how to tell your partner at dinner',
        'Refreshing job boards at 2 AM while trying not to tie your whole worth to a title',
        'Turning an unexpected pink slip into the push you were too scared to make yourself',
      ],
    },
    {
      label: 'Working multiple jobs',
      scenes: [
        'Changing uniforms in the front seat between the warehouse shift and the night shift',
        'Running on gas-station coffee and pride so the lights never shut off at home',
        'Missing dinners and sleep while telling yourself this season is temporary',
        'Coming home before sunrise just to kiss your sleeping kids on the forehead',
      ],
    },
    {
      label: 'Financial freedom',
      scenes: [
        'Ordering off the menu without checking the right-hand side for the first time',
        'Waking up on a Monday owning your time instead of renting it out',
        'Moving quiet in plain clothes while every bill sits on autopay',
        'Buying back peace of mind rather than flexing for people you do not even like',
      ],
    },
    {
      label: 'Success guilt',
      scenes: [
        'Sitting in a quiet new house while your best friend is still stuck on the same block',
        'Getting calls that only start with favors now that people think you made it',
        'Feeling torn between helping everybody back home and not drowning yourself',
        'Wondering why making it out feels heavier than you imagined when you were broke',
      ],
    },
  ],
  'sex-temptation': [
    {
      label: 'First attraction',
      scenes: [
        'Locking eyes across a dim lounge and forgetting every word you were about to say',
        'Sitting two inches too close on a warm night while the whole room fades out',
        'Trying to play it cool while your pulse gives you away the second they laugh',
        'Knowing within five minutes that tonight is going to be hard to forget',
      ],
    },
    {
      label: 'Forbidden attraction',
      scenes: [
        'Knowing every reason you should walk away while every step pulls you closer',
        'Standing in the hallway after everyone leaves with tension neither of you will name',
        'Fighting the pull toward somebody who belongs to a complication you cannot afford',
        'Trying to stay loyal to your better judgment when their voice drops an octave',
      ],
    },
    {
      label: 'The text you should not send',
      scenes: [
        'Typing three honest lines at 1:47 AM, deleting them, and staring at the blinking cursor',
        'Hovering your thumb over send knowing tomorrow morning you will regret it',
        'Drinking just enough to forget why you blocked their number in the first place',
        'Hitting send anyway and watching the three dots appear five seconds later',
      ],
    },
    {
      label: 'Breaking no-contact',
      scenes: [
        'Throwing away six months of discipline over one late-night "you up?" call',
        'Pulling into their driveway telling yourself you are just stopping by to talk',
        'Feeling the familiar chemistry rush back before remembering why it broke you',
        'Waking up in their sheets knowing you just reset the healing clock to zero',
      ],
    },
    {
      label: 'One last night together',
      scenes: [
        'Agreeing tonight is goodbye while holding on like nobody wants the sun to rise',
        'Slow dancing in an apartment surrounded by half-packed moving boxes',
        'Savoring every detail of somebody you know will be a memory by noon',
        'Leaving before they wake up because one more goodbye would break the promise',
      ],
    },
    {
      label: 'Casual becoming serious',
      scenes: [
        'Swearing there were no strings until you caught yourself getting jealous on a Friday night',
        'Leaving a toothbrush on their sink without either of you admitting what changed',
        'Realizing you do not want to see anybody else even though nobody defined the rules',
        'Breaking the chill-act first to ask if they feel the shift too',
      ],
    },
    {
      label: 'Choosing passion over peace',
      scenes: [
        'Knowing they are a wildfire and still walking straight back into the smoke',
        'Trading calm nights for somebody who wrecks your schedule and owns your mind',
        'Admitting the chaos felt alive even while it drained everything out of you',
        'Standing at the crossroads between safe love and electric danger',
      ],
    },
    {
      label: 'Being addicted to somebody',
      scenes: [
        'Every time you swear you are done, one voice note pulls you right back under',
        'Measuring your whole mood by whether their name shows up on your lock screen',
        'Loving the rush of making up more than the calm of actually being okay',
        'Finally admitting it is attachment, not love, and trying to break the spell',
      ],
    },
    {
      label: 'Regret after temptation',
      scenes: [
        'Driving home at 5 AM with the radio off wishing you could rewind the whole night',
        'Looking in the rearview mirror realizing a ten-minute thrill cost you your peace',
        'Washing off somebody else’s perfume while hating the silence in your own head',
        'Learning the hard way that temporary validation leaves a permanent echo',
      ],
    },
  ],
  'music-industry': [
    {
      label: 'Recording in a bedroom',
      scenes: [
        'Hanging blankets over a closet door with a cheap mic and a dream nobody takes seriously yet',
        'Recording whispered hooks at 2 AM so you do not wake up the whole house',
        'Watching waveforms stack up on an old laptop knowing this song is your ticket out',
        'Playing a rough mix in a beat-up car and feeling goosebumps for the first time',
      ],
    },
    {
      label: 'First viral song',
      scenes: [
        'Waking up to ten thousand notifications from a verse you almost deleted last week',
        'Hearing strangers sing your private pain back to you on a phone screen',
        'Suddenly getting calls from people who ignored your links for three years',
        'Realizing your life just changed overnight while you are still sitting in the same room',
      ],
    },
    {
      label: 'Signing a bad contract',
      scenes: [
        'Celebrating the advance check before realizing you just mortgaged your own masters',
        'Reading fine print two years later when the smiles in the boardroom disappear',
        'Being shelved by executives who never understood why people loved your music',
        'Fighting to buy back the songs you wrote when you were starving',
      ],
    },
    {
      label: 'Industry politics',
      scenes: [
        'Watching fake handshakes at VIP parties where everyone measures you by your numbers',
        'Being told to dumb down your lyrics to chase an algorithm you do not respect',
        'Seeing who disappears the exact week your single drops off the charts',
        'Staying grounded in a room full of people selling smoke and mirrors',
      ],
    },
    {
      label: 'Creative burnout',
      scenes: [
        'Sitting in a million-dollar studio unable to feel the spark you had in a cramped bedroom',
        'Turning the thing that saved your sanity into a deadline you dread',
        'Stepping away from the mic to actually live a real life worth writing about again',
        'Hating every verse you write until you stop trying to impress anyone',
      ],
    },
    {
      label: 'Touring life',
      scenes: [
        'Step off the stage from five thousand screaming fans straight into a silent hotel room',
        'Waking up on a tour bus forgetting which city is outside the curtain',
        'Missing birthdays back home while chasing a spotlight on the highway',
        'Feeling electric for ninety minutes and hollow the second the house lights turn on',
      ],
    },
    {
      label: 'Losing privacy',
      scenes: [
        'Not being able to buy groceries or grieve in peace without a phone camera pointed at you',
        'Reading strangers argue about your life like you are a character on TV',
        'Missing the days nobody knew your face when you walked into a diner',
        'Keeping the people you truly love completely off the internet to protect them',
      ],
    },
    {
      label: "Writer's block",
      scenes: [
        'Staring at a looping beat for four hours with a notebook full of crossed-out first lines',
        'Being afraid your best verses are already behind you',
        'Closing the notebook, going for a midnight drive, and finding one honest sentence',
        'Fighting perfectionism until a raw truth finally cracks the page open',
      ],
    },
    {
      label: 'Ownership battles',
      scenes: [
        'Refusing to sign away your catalog even when the upfront check looks tempting',
        'Building your own lane independently so your kids inherit the masters, not just plaques',
        'Walking out of a label meeting knowing your art is worth more than a quick advance',
        'Turning every "no" into leverage you own one hundred percent',
      ],
    },
    {
      label: 'Legacy building',
      scenes: [
        'Writing timeless songs people will still replay twenty years after the trends die',
        'Choosing depth and honesty over viral gimmicks that fade by Friday',
        'Thinking about what your children will hear when they press play on your catalog',
        'Leaving a blueprint for the next kid recording in a quiet bedroom',
      ],
    },
  ],
  'dark-emotional': [
    {
      label: 'Survivor guilt',
      scenes: [
        'Living a life your childhood friend never got the chance to see',
        'Feeling guilty laughing at dinner when you still carry the names of who did not make it out',
        'Visiting an old neighborhood and feeling like a ghost among the memories',
        'Turning grief into a promise not to waste the breath you still have',
      ],
    },
    {
      label: 'Fear of mortality',
      scenes: [
        'Realizing the clock is moving faster every birthday while half your dreams are still on hold',
        'Sitting in a hospital waiting room suddenly noticing how fragile ordinary days are',
        'Calling the people you love just to hear their voice while you still can',
        'Wondering what actually stays behind after the noise stops',
      ],
    },
    {
      label: 'Losing faith',
      scenes: [
        'Praying into a quiet ceiling and feeling like nobody is listening anymore',
        'Sitting in the back pew remembering when believing used to come easy',
        'Being angry at heaven after doing everything right and still watching things break',
        'Holding onto one tiny spark of hope inside a season full of doubt',
      ],
    },
    {
      label: 'Identity crisis',
      scenes: [
        'Realizing you spent years becoming whoever everyone else needed and forgot who you are',
        'Outgrowing your old name and reputation before knowing what replaces it',
        'Looking at your reflection in a bathroom mirror feeling like a stranger in your own skin',
        'Peeling off every role and expectation just to hear your own real voice',
      ],
    },
    {
      label: 'Feeling invisible',
      scenes: [
        'Checking on everybody else all week while nobody asks if you are actually okay',
        'Being the dependable one people only call when something breaks',
        'Sitting at a crowded table laughing on cue while feeling miles away',
        'Wondering if anybody would notice if you stopped showing up first',
      ],
    },
    {
      label: 'Living with regret',
      scenes: [
        'Replaying one five-second decision from years ago every time the room gets quiet',
        'Carrying words you cannot take back after the person is no longer here to hear sorry',
        'Learning to live beside a mistake you cannot undo without letting it define you',
        'Wishing you had been brave on the one day you chose to stay silent',
      ],
    },
    {
      label: 'Loneliness in a crowd',
      scenes: [
        'Surrounded by music, drinks, and familiar faces while wishing you were home alone',
        'Having hundreds of contacts in your phone and nobody you can call at 3 AM',
        'Smiling through a packed room feeling completely unseen by everyone talking to you',
        'Stepping outside onto the cold sidewalk just to breathe away from the noise',
      ],
    },
    {
      label: 'Healing after trauma',
      scenes: [
        'Too quiet — peace feels dangerous at first because chaos used to be normal',
        'Noticing your shoulders finally drop when you realize nobody is yelling anymore',
        'Stopping yourself from bracing for impact on an ordinary sunny afternoon',
        'Learning that surviving was chapter one, and actually living is chapter two',
      ],
    },
  ],
  'everyday-people': [
    {
      label: 'Uber driver',
      scenes: [
        'Hearing confessions, breakups, and prayers from strangers in the back seat at 2 AM',
        'Watching the whole city glow through the windshield while chasing surge fares to pay rent',
        'Dropping off laughing partygoers while quietly holding your own heavy week together',
        'A five-minute ride with a crying passenger who reminds you everybody is fighting something',
      ],
    },
    {
      label: 'Night shift worker',
      scenes: [
        'Clocking out at 6 AM as the rest of the world wakes up and passes you going the other way',
        'Eating lunch alone under fluorescent lights at 3 AM while the city sleeps',
        'Missing weekends and sunlight just to keep the family steady',
        'Driving home through empty orange streetlights with the windows cracked to stay awake',
      ],
    },
    {
      label: 'Single mom',
      scenes: [
        'Hiding the overdue bills in a drawer before helping with math homework at the kitchen table',
        'Being both the soft landing and the shield without ever getting a day off',
        'Crying quietly in the shower for three minutes, then walking out smiling for dinner',
        'Watching your child shine and knowing every exhausted night was worth it',
      ],
    },
    {
      label: 'Teacher',
      scenes: [
        'Spotting the quiet kid in the back row who just needs one adult to believe in them',
        'Buying pencils out of your own paycheck while carrying thirty kids’ stories home every night',
        'Running into a former student ten years later who still remembers one kind thing you said',
        'Showing up with patience in a broken system because the kids deserve somebody who stays',
      ],
    },
    {
      label: 'Truck driver',
      scenes: [
        'Four hundred miles of empty interstate at midnight with only your thoughts and the radio',
        'Missing family dinners over a crackly phone signal from a rainy rest stop',
        'Knowing every state line by heart while dreaming of your own driveway',
        'Carrying the whole country’s weight in the trailer while nobody sees the miles on your face',
      ],
    },
    {
      label: 'Paramedic',
      scenes: [
        'Trying to eat a cold sandwich ten minutes after holding a stranger’s hand in the ambulance',
        'Washing sirens out of your head on the quiet drive home after a twelve-hour shift',
        'Seeing how fast an ordinary afternoon can turn fragile and loving your family harder because of it',
        'Staying calm in somebody else’s worst minute while carrying the images in silence',
      ],
    },
    {
      label: 'Barber hearing community secrets',
      scenes: [
        'Men who never go to therapy telling the whole truth the second the cape goes on',
        'Watching three generations grow up in the same swivel chair across twenty years',
        'Keeping every neighborhood heartbreak, victory, and confession locked behind the clippers',
        'Turning a corner shop into the heartbeat and sanctuary of the whole block',
      ],
    },
  ],
  'character-inspired': [
    {
      label: 'Walter White',
      scenes: [
        'Telling yourself you crossed the line for your family until you finally admit you liked the power',
        'Watching a quiet, overlooked man wake up into somebody everyone in the room fears',
        'Standing in a pile of money realizing the people you did it for no longer recognize you',
        'Refusing to die invisible even if it burns down everything you built',
      ],
    },
    {
      label: 'Batman',
      scenes: [
        'Turning childhood grief into midnight discipline so nobody else has to walk down that alley',
        'Protecting a whole city from the shadows while never letting anyone close enough to heal you',
        'Wearing armor all night because taking off the mask feels more dangerous than the fight',
        'Wondering if justice actually saves you or just keeps the wound awake',
      ],
    },
    {
      label: 'Rocky',
      scenes: [
        'Nobody expecting you to survive round one while you just refuse to stay on the canvas',
        'Running up cold concrete steps before sunrise with nothing to lose and everything to prove',
        'Taking the heaviest hits life throws and still stepping forward at the bell',
        'Proving to yourself you were never just another forgotten bum from the neighborhood',
      ],
    },
    {
      label: 'John Wick',
      scenes: [
        'Trying to live a quiet, retired life until somebody breaks the one sacred thing left in your house',
        'Digging up a buried past you swore you walked away from for good',
        'Moving in cold, calm focus when grief turns into unstoppable resolve',
        'Paying the price of an old world that never really lets you leave',
      ],
    },
    {
      label: 'Spider-Man',
      scenes: [
        'Saving everybody else on time while constantly showing up late to your own life',
        'Carrying guilt over the one day you looked away when you had the power to help',
        'Doing the right thing even when the city misunderstands you and rent is overdue',
        'Sacrificing the person you love most just to keep them safe from your world',
      ],
    },
    {
      label: 'Tony Soprano',
      scenes: [
        'Running the whole empire by day and sitting in a therapist’s chair having panic attacks by afternoon',
        'Trying to be a loving father at the dinner table while hiding the darkness that pays for the house',
        'Paranoia creeping into every loyalty until you do not know who at the table is smiling for real',
        'Carrying a crown that feels more like a cage with every passing year',
      ],
    },
    {
      label: 'Don Draper',
      scenes: [
        'Selling everybody else the dream of home while running from the kid you used to be',
        'Dressing sharp in a corner office while carrying a secret name nobody knows',
        'Chasing fresh starts every time somebody gets close enough to see the cracks',
        'Realizing reinvention can fool the whole world except the mirror at midnight',
      ],
    },
    {
      label: 'Jon Snow',
      scenes: [
        'Growing up feeling like an outsider at your own family table and still choosing honor',
        'Stepping up to lead when you never wanted the crown—just to keep your people alive',
        'Paying the price for doing what is right in a room full of people playing games',
        'Standing guard in the cold while the people behind the wall forget what is coming',
      ],
    },
  ],
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const TOPICS: TopicItem[] = (Object.keys(RAW_TOPICS) as TopicCategoryId[]).flatMap(
  (category) =>
    RAW_TOPICS[category].map((entry) => ({
      id: `${category}:${slugify(entry.label)}`,
      label: entry.label,
      category,
      scenes: entry.scenes,
    })),
);
