// Seeded Random Number Generation - AI Native Foundation
// Deterministic RNG for consistent story generation across sessions

/**
 * Mulberry32 PRNG - Fast, simple, and deterministic
 * @param seed - 32-bit integer seed
 * @returns Function that generates numbers between 0 and 1
 */
export function mulberry32(seed: number): () => number {
  return function(): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert string to deterministic seed
 * @param str - Input string to hash
 * @returns 32-bit unsigned integer seed
 */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pick random element from array using seeded RNG
 * @param rng - Random number generator function
 * @param arr - Array to pick from
 * @returns Random element from array
 */
export function pick<T>(rng: () => number, arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  const index = Math.floor(rng() * arr.length);
  const result = arr[index];
  if (result === undefined) {
    throw new Error('Array access returned undefined');
  }
  return result;
}

/**
 * Generate world state from seed
 * @param seedStr - String seed for world generation
 * @returns Generated world object
 */
export function generateWorld(seedStr: string) {
  const rng = mulberry32(hashStringToSeed(seedStr));
  
  const roles = [
    "Hero (Pending)",
    "Suspicious Stranger", 
    "Background Character, L3",
    "Plot Device — Handle With Care",
  ];
  
  const cities = [
    "Checkpoint City",
    "Undesignated Territory 7", 
    "Harbor of Revisions",
    "The Stray Road",
  ];
  
  const genres = [
    "liminal realism",
    "administrative horror", 
    "transit mystery",
    "bureaucratic surrealism",
  ];
  
  const agents = [
    { name: "Narrator", role: "primary storyteller", mood: "neutral" },
    { name: "WorldBuilder", role: "context generator", mood: "observant" },
    { name: "NPC Actor", role: "character voice", mood: "adaptive" },
  ];

  return {
    seed: seedStr,
    rng,
    playerRole: pick(rng, roles),
    destination: pick(rng, cities),
    genre: pick(rng, genres),
    continuity: 3,
    foreshadow: 0,
    agents,
  };
}

/**
 * Generate offline story beat
 * @param world - Generated world state
 * @param lastChoice - Previous player choice ("Y" or "N")
 * @returns Story text with choice prompt
 */
export function offlineBeat(world: ReturnType<typeof generateWorld>, lastChoice?: string): string {
  const { rng } = world;
  
  const senses = [
    "neon", 
    "dust", 
    "sea-wet air", 
    "library quiet", 
    "violet dusk"
  ];
  
  const beatsY = [
    "A guard wavers; the clipboard dims.",
    "A side door clicks open, unmarked.", 
    "Someone nods as if they expected you."
  ];
  
  const beatsN = [
    "The line of passengers rustles like paper.",
    "A siren purrs but never rises.",
    "Footsteps multiply in the hall."
  ];
  
  const hooks = [
    "Follow the whispering lawyer?",
    "Trust the teen with the notebook?", 
    "Take the unlit stair?",
    "Ask the driver what he knows?"
  ];
  
  const enders = [
    "The room exhales. Your story opens elsewhere.",
    "The road bends and forgets you were chased."
  ];

  // Small chance of story ending
  const chanceEnd = rng() < 0.06;
  if (chanceEnd) {
    return `${pick(rng, enders)} (Restart?)`;
  }

  const sense = pick(rng, senses);
  const beat = lastChoice === "Y" ? pick(rng, beatsY) : pick(rng, beatsN);
  const hook = pick(rng, hooks);
  
  return `${beat} The air tastes of ${sense}. ${hook} (Y/N)`;
}