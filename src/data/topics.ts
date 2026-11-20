/**
 * Complete Rap & R&B Topic Bible — 10 categories, 92 topics.
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
  /** Optional scene-starter hint based on the Songwriting Formula. */
  hint?: string;
}

export const TOPIC_BIBLE_RULE =
  'Convert every topic into a scene, confession, memory, conversation, or lived experience.';

export const SONGWRITING_FORMULA =
  'Character + Situation + Emotion + Stakes + Specific Scene';

export const TOPIC_CATEGORIES: TopicCategory[] = [
  { id: 'family-legacy', label: 'Family & Legacy (12)' },
  { id: 'love-relationships', label: 'Love & Relationships (10)' },
  { id: 'heartbreak-loss', label: 'Heartbreak & Loss (9)' },
  { id: 'personal-growth', label: 'Personal Growth (9)' },
  { id: 'career-money', label: 'Career & Money (10)' },
  { id: 'sex-temptation', label: 'Sex & Temptation (9)' },
  { id: 'music-industry', label: 'The Music Industry (10)' },
  { id: 'dark-emotional', label: 'Dark & Emotional (8)' },
  { id: 'everyday-people', label: 'Everyday People (7)' },
  { id: 'character-inspired', label: 'Character-Inspired (8)' },
];

const RAW_TOPICS: Record<TopicCategoryId, string[]> = {
  'family-legacy': [
    'Becoming a father',
    'Becoming a mother',
    'Missing your children after divorce',
    'Raising a child with special needs',
    'Caring for aging parents',
    'Family secrets',
    'Sibling rivalry',
    'Adoption story',
    'Grandparents raising grandchildren',
    'Generational trauma',
    'Breaking family curses',
    'Family reunion after tragedy',
  ],
  'love-relationships': [
    'Friends becoming lovers',
    'Long-distance love',
    'Reconnecting years later',
    'Unrequited love',
    'Secret romance',
    'Forbidden love',
    'Online relationship',
    'Love after divorce',
    'First love memories',
    'Growing old together',
  ],
  'heartbreak-loss': [
    'Being ghosted',
    'Being cheated on',
    'Leaving a toxic relationship',
    'Watching an ex move on',
    'Trust issues',
    'Closure never received',
    'Regret years later',
    'One final conversation',
    'Finding peace after loss',
  ],
  'personal-growth': [
    'Reinventing yourself',
    'Recovering from addiction',
    'Escaping self-doubt',
    'Finding purpose',
    'Spiritual awakening',
    'Forgiving yourself',
    'Surviving rock bottom',
    'Building confidence',
    'Healing childhood wounds',
  ],
  'career-money': [
    'Entrepreneur struggles',
    'Dead-end job',
    'Corporate burnout',
    'Lottery winner story',
    'First paycheck',
    'Starting a business',
    'Getting laid off',
    'Working multiple jobs',
    'Financial freedom',
    'Success guilt',
  ],
  'sex-temptation': [
    'First attraction',
    'Forbidden attraction',
    'The text you should not send',
    'Breaking no-contact',
    'One last night together',
    'Casual becoming serious',
    'Choosing passion over peace',
    'Being addicted to somebody',
    'Regret after temptation',
  ],
  'music-industry': [
    'Recording in a bedroom',
    'First viral song',
    'Signing a bad contract',
    'Industry politics',
    'Creative burnout',
    'Touring life',
    'Losing privacy',
    "Writer's block",
    'Ownership battles',
    'Legacy building',
  ],
  'dark-emotional': [
    'Survivor guilt',
    'Fear of mortality',
    'Losing faith',
    'Identity crisis',
    'Feeling invisible',
    'Living with regret',
    'Loneliness in a crowd',
    'Healing after trauma',
  ],
  'everyday-people': [
    'Uber driver',
    'Night shift worker',
    'Single mom',
    'Teacher',
    'Truck driver',
    'Paramedic',
    'Barber hearing community secrets',
  ],
  'character-inspired': [
    'Walter White',
    'Batman',
    'Rocky',
    'John Wick',
    'Spider-Man',
    'Tony Soprano',
    'Don Draper',
    'Jon Snow',
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
    RAW_TOPICS[category].map((label) => ({
      id: `${category}:${slugify(label)}`,
      label,
      category,
    })),
);
