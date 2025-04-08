import type { Watch, Level } from "./types"

export const initialWatches: Watch[] = [
  {
    id: "basic",
    name: "Basic Wristwatch",
    value: 100,
    stats: {
      nightglow: 1,
      waterproof: 1,
      tech: 1,
      style: 1,
      durability: 1,
    },
    unlockCondition: "always",
  },
  {
    id: "rolex",
    name: "Rolex Prestige",
    value: 5000,
    stats: {
      nightglow: 1,
      waterproof: 2,
      tech: 2,
      style: 10,
      durability: 4,
    },
    unlockCondition: "starter",
  },
  {
    id: "smartcore",
    name: "SmartCore X",
    value: 3000,
    stats: {
      nightglow: 3,
      waterproof: 4,
      tech: 9,
      style: 3,
      durability: 6,
    },
    unlockCondition: "starter",
  },
  {
    id: "relic",
    name: "Timeless Relic",
    value: 4000,
    stats: {
      nightglow: 6,
      waterproof: 1,
      tech: 3,
      style: 7,
      durability: 8,
    },
    unlockCondition: "starter",
  },
  {
    id: "glow-o-matic",
    name: "Glow-O-Matic",
    value: 1500,
    stats: {
      nightglow: 10,
      waterproof: 2,
      tech: 1,
      style: 2,
      durability: 3,
    },
    unlockCondition: "reward:subway",
  },
  {
    id: "aquacore",
    name: "AquaCore 3000",
    value: 3000,
    stats: {
      nightglow: 2,
      waterproof: 9,
      tech: 1,
      style: 5,
      durability: 8,
    },
    unlockCondition: "buy",
  },
  {
    id: "codebreaker",
    name: "CodeBreaker",
    value: 5000,
    stats: {
      nightglow: 2,
      waterproof: 3,
      tech: 10,
      style: 3,
      durability: 4,
    },
    unlockCondition: "buy",
  },
  {
    id: "velvet-tick",
    name: "Velvet Tick",
    value: 2000,
    stats: {
      nightglow: 4,
      waterproof: 3,
      tech: 2,
      style: 9,
      durability: 5,
    },
    unlockCondition: "reward:gala",
  },
  {
    id: "shadow-tick",
    name: "ShadowTick",
    value: 4500,
    stats: {
      nightglow: 7,
      waterproof: 5,
      tech: 6,
      style: 8,
      durability: 7,
    },
    unlockCondition: "reward:heist",
  },
  {
    id: "junkyard-beater",
    name: "Junkyard Beater",
    value: 500,
    stats: {
      nightglow: 1,
      waterproof: 6,
      tech: 1,
      style: 1,
      durability: 9,
    },
    unlockCondition: "buy",
  },
  {
    id: "nightrider",
    name: "NightRider V2",
    value: 2500,
    stats: {
      nightglow: 9,
      waterproof: 4,
      tech: 3,
      style: 4,
      durability: 6,
    },
    unlockCondition: "reward:mountain",
  },
]

export const initialLevels: Level[] = [
  {
    id: "subway",
    name: "Subway Escape",
    description: "Navigate through the dark subway tunnels to escape pursuers.",
    hint: "Something to light your way...",
    unlockCondition: "always",
    recommendedStats: {
      nightglow: 5,
    },
    reward: {
      money: 500,
      watch: "glow-o-matic",
    },
  },
  {
    id: "gala",
    name: "Gala Night",
    description: "Infiltrate a high-society gala to gather intelligence.",
    hint: "Blend in or stand out—in style.",
    unlockCondition: "style>8",
    recommendedStats: {
      style: 8,
    },
    reward: {
      money: 1500,
      watch: "velvet-tick",
    },
  },
  {
    id: "sewer",
    name: "Sewer Dive",
    description: "Retrieve a valuable item lost in the city's sewer system.",
    hint: "Wet, dark, and nasty.",
    unlockCondition: "complete:subway",
    recommendedStats: {
      waterproof: 7,
      nightglow: 5,
    },
    reward: {
      money: 800,
    },
  },
  {
    id: "hacker",
    name: "Hacker Den",
    description: "Break into a secure server room to extract critical data.",
    hint: "Plug in. Tune out. Break in.",
    unlockCondition: "tech>8",
    recommendedStats: {
      tech: 8,
    },
    reward: {
      money: 1200,
    },
  },
  {
    id: "heist",
    name: "Art Heist",
    description: "Steal a priceless painting from a heavily guarded museum.",
    hint: "Style meets stealth.",
    unlockCondition: "watches:3",
    recommendedStats: {
      style: 6,
      nightglow: 6,
    },
    reward: {
      money: 2000,
      watch: "shadow-tick",
    },
  },
  {
    id: "mountain",
    name: "Mountain Rescue",
    description: "Brave harsh conditions to rescue stranded climbers.",
    hint: "Harsh terrain. Unforgiving weather.",
    unlockCondition: "watches:5",
    recommendedStats: {
      durability: 7,
    },
    reward: {
      money: 1000,
      watch: "nightrider",
    },
  },
  {
    id: "junkyard",
    name: "Junkyard Clash",
    description: "Survive a confrontation in a dangerous scrapyard.",
    hint: "Who needs elegance when you have grit?",
    unlockCondition: "always",
    recommendedStats: {
      durability: 6,
    },
    reward: {
      money: 700,
    },
  },
  {
    id: "yacht",
    name: "Yacht Party",
    description: "Infiltrate a luxury yacht to gather intelligence on a target.",
    hint: "Don't fall in… or do.",
    unlockCondition: "watch:aquacore",
    recommendedStats: {
      waterproof: 8,
      style: 5,
    },
    reward: {
      money: 1500,
    },
  },
  {
    id: "final",
    name: "Final Showdown",
    description: "Face your ultimate challenge and prove your mastery.",
    hint: "Your last test. Hope you're ready.",
    unlockCondition: "watches:7",
    recommendedStats: {
      nightglow: 6,
      waterproof: 6,
      tech: 6,
      style: 6,
      durability: 6,
    },
    reward: {
      money: 5000,
    },
  },
]

