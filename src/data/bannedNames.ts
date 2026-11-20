/**
 * Real producer and artist names that must NEVER appear in a sound prompt.
 * Covers every internal lane label and every "Foundation (internal)" name in
 * the producer persona library. Used by the validator and the sanitizer, and
 * cross-checked against the library by tests.
 */
export const BANNED_NAMES: string[] = [
  'Dr. Dre', 'Dr Dre', 'Dre',
  'DJ Premier', 'Premier',
  'DJ U-Neek', 'U-Neek',
  'Timbaland',
  'D’Mile', "D'Mile", 'DMile',
  'Noah “40” Shebib', 'Noah "40" Shebib', 'Shebib', 'Noah 40',
  'Frank Dukes',
  'J Dilla', 'Dilla',
  'Raphael Saadiq', 'Saadiq',
  'DJ Mustard', 'Mustard',
  'Metro Boomin', 'Metro Boomin’',
  'Mike Dean',
  'Stargate',
  'WondaGurl',
  'Pharrell',
  'Kanye West', 'Kanye', 'Ye',
  'Carter Lang',
  'Dijon',
  'Jermaine Dupri',
  'Hit-Boy', 'Hitboy',
  'Quincy Jones', 'Quincy',
  '9th Wonder',
  'London on da Track',
  'Alan Menken', 'Menken',
  'Lin-Manuel Miranda', 'Lin-Manuel',
  'Robert Lopez',
  'Emilio Estefan', 'Estefan',
  'Juan Formell', 'Formell',
  'Sergio George',
  'Willie Colón', 'Willie Colon',
  'DJ Quik', 'Quik',
  'Just Blaze',
  'Mike Will Made-It', 'Mike WiLL Made-It', 'Mike Will Made It', 'Mike Will',
  'Boi-1da', 'Boi1da',
  'Scott Storch',
  'The Alchemist', 'Alchemist',
  'Cool & Dre', 'Cool and Dre',
  'Infamous',
  'Scoop DeVille', 'Scoop Deville',
  '1500 or Nothin’', "1500 or Nothin'", '1500 or Nothin',
  'Bryan-Michael Cox', 'Bryan Michael Cox',
  'Kaytranada',
  'Drumma Boy',
  'Dan Auerbach', 'Auerbach',
  'Southside',
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longest first so "Dr. Dre" wins over "Dre".
const SORTED = [...BANNED_NAMES].sort((a, b) => b.length - a.length);

const BANNED_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${SORTED.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`,
  'giu',
);

/** Returns every banned name found in the text (deduplicated). */
export function findBannedNames(text: string): string[] {
  const hits = new Set<string>();
  for (const m of text.matchAll(BANNED_RE)) hits.add(m[0]);
  return [...hits];
}

/** Removes banned names and tidies the punctuation they leave behind. */
export function stripBannedNames(text: string): string {
  return text
    .replace(BANNED_RE, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/:\s*,\s*/g, ': ');
}
