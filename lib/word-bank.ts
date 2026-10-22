// Seeded from the user's headshot adjective list, with a few additional
// casting descriptors. Multi-word entries use hyphens to fit one word field.
const sourceWords = [
  "adorable", "adventurous", "affluent", "aggressive", "angry", "athletic",
  "attractive", "authoritative", "beautiful", "blue-collar", "bored", "bossy",
  "calm", "caring", "charactery", "charming", "closed-off", "cold", "combative",
  "competitive", "complicated", "confident", "controlling", "cranky", "crazy",
  "creepy", "damaged", "dangerous", "distinguished", "eager", "educated",
  "energetic", "entitled", "fearful", "forgiving", "fun-loving", "funny",
  "handsome", "high-maintenance", "impatient", "innocent", "intimidating",
  "joyful", "kind", "lazy", "loving", "meek", "mellow", "mischievous",
  "mysterious", "naïve", "no-nonsense", "old-soul", "open", "overbearing",
  "passive", "patient", "pretty", "prudish", "quirky", "rugged", "sad",
  "sarcastic", "sassy", "scared", "scary", "scholarly", "scrappy",
  "self-assured", "self-conscious", "sensitive", "sexy", "sheltered", "shy",
  "sketchy", "slick", "sloppy", "sly", "smart", "soulful", "spoiled",
  "street-wise", "strong", "studious", "sweet", "threatening", "tough",
  "troubled", "trustworthy", "unassuming", "uncomfortable", "uneducated",
  "unstable", "vulnerable", "warm", "white-collar", "wise",
];
const additionalWords = [
  "approachable", "assertive", "awkward", "bold", "calculating", "commanding",
  "deadpan", "dry-witted", "eccentric", "gentle", "goofy", "guarded", "intense",
  "manipulative", "playful", "poised", "rebellious", "reserved", "stern", "witty",
];
export const WORD_BANK = [...sourceWords, ...additionalWords].sort((a, b) => a.localeCompare(b, "en"));

// 22 words from the supplied book, plus the user's stern/goofy/manipulative
// example. Use the same vocabulary for every photo; shuffle only its positions.
export const CORE_WORDS = [
  "warm", "trustworthy", "charming", "confident", "authoritative", "stern",
  "intimidating", "manipulative", "cold", "mysterious", "vulnerable",
  "sensitive", "shy", "innocent", "calm", "energetic", "goofy",
  "mischievous", "sarcastic", "quirky", "scrappy", "rugged", "smart",
  "distinguished", "sad",
];
export const MORE_WORDS = WORD_BANK.filter(word => !CORE_WORDS.includes(word));

export function shuffledWords(words: readonly string[]) {
  const result = [...words];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function normalizeWord(value: string) {
  return value.trim().normalize("NFC").toLocaleLowerCase();
}

export type WordChoice = { id: string; word: string; custom: boolean };

export function choicesFromWords(words: string[]): WordChoice[] {
  return words.map((word, index) => ({ id: `saved:${index}`, word, custom: !WORD_BANK.some(value => normalizeWord(value) === normalizeWord(word)) }));
}

export function toggleBankWord(choices: WordChoice[], word: string): WordChoice[] {
  const normalized = normalizeWord(word);
  if (choices.some(choice => normalizeWord(choice.word) === normalized)) {
    return choices.filter(choice => normalizeWord(choice.word) !== normalized);
  }
  return choices.length >= 5 ? choices : [...choices, { id: `bank:${word}`, word, custom: false }];
}

export function matchingBankWords(query: string, words: readonly string[] = WORD_BANK) {
  // Accent-insensitive lookup lets "naive" find the original "naïve" entry.
  const searchable = (value: string) => normalizeWord(value).normalize("NFD").replace(/\p{M}/gu, "").replaceAll("-", " ");
  const search = searchable(query);
  return words.filter(word => searchable(word).includes(search));
}
