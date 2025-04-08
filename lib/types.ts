export interface WatchStats {
  nightglow: number
  waterproof: number
  tech: number
  style: number
  durability: number
}

export interface Watch {
  id: string
  name: string
  value: number
  stats: WatchStats
  unlockCondition: string
}

export interface LevelReward {
  money: number
  watch?: string
}

export interface LevelRecommendedStats {
  [key: string]: number
}

export interface Level {
  id: string
  name: string
  description: string
  hint: string
  unlockCondition: string
  recommendedStats: LevelRecommendedStats
  reward: LevelReward
}

export interface CompletionDetails {
  watchId: string
  timeCompleted: string
  timeTaken: number
}

export interface GameState {
  started: boolean
  money: number
  time: number
  ownedWatches: Watch[]
  selectedWatch: Watch | null
  completedLevels: string[]
  completionDetails: { [levelId: string]: CompletionDetails }
  currentLevel: Level | null
  starterWatchId?: string 
}

