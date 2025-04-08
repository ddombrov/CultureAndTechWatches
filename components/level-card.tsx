"use client"

import type { Level, Watch, CompletionDetails } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Lock, WatchIcon } from "lucide-react"
import { useState } from "react"

interface LevelCardProps {
  level: Level
  isCompleted: boolean
  isAvailable: boolean
  onSelect: () => void
  selectedWatch: Watch | null
  watches: Watch[]
  onSwitchWatch: () => void
  completionDetails: CompletionDetails | null
  allWatches: Watch[]
  onWatchSelect: (watch: Watch) => void
}

export default function LevelCard({
  level,
  isCompleted,
  isAvailable,
  onSelect,
  selectedWatch,
  watches,
  onSwitchWatch,
  completionDetails,
  allWatches,
  onWatchSelect,
}: LevelCardProps) {
  const [showLockInfo, setShowLockInfo] = useState(false)
  const [showWatchSelector, setShowWatchSelector] = useState(false)

  // Find the watch used to complete this level
  const getCompletionWatch = () => {
    if (!completionDetails) return null
    return allWatches.find((w) => w.id === completionDetails.watchId) || null
  }

  const completionWatch = getCompletionWatch()

  return (
    <div
      className={`bg-blue-800 rounded-lg p-4 h-full flex flex-col relative ${
        isCompleted
          ? "border-2 border-green-500 opacity-70 hover:shadow-lg"
          : !isAvailable
            ? "opacity-60 hover:shadow-lg"
            : "hover:shadow-lg"
      } transition-all duration-300`}
      onMouseEnter={() => !isAvailable && setShowLockInfo(true)}
      onMouseLeave={() => setShowLockInfo(false)}
    >
      {/* Lock overlay for unavailable missions */}
      {!isAvailable && showLockInfo && (
        <div className="absolute inset-0 bg-blue-950 bg-opacity-90 rounded-lg flex flex-col items-center justify-center p-4 z-10">
          <Lock className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Mission Locked</h3>
          <p className="text-center text-blue-200 text-sm">{getReadableUnlockCondition(level.unlockCondition)}</p>
        </div>
      )}

      {/* Watch selector overlay */}
      {showWatchSelector && (
        <div className="absolute inset-0 bg-blue-950 bg-opacity-95 rounded-lg flex flex-col p-4 z-10 overflow-auto">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Select Watch for Mission</h3>
          <div className="grid grid-cols-1 gap-3 mb-4 flex-grow overflow-auto">
            {watches.map((watch) => (
              <div
                key={watch.id}
                className={`bg-blue-800 p-2 rounded flex items-center justify-between cursor-pointer hover:bg-blue-700 ${
                  selectedWatch?.id === watch.id ? "border border-yellow-400" : ""
                }`}
                onClick={() => {
                  onWatchSelect(watch)
                  setShowWatchSelector(false)
                }}
              >
                <div className="flex items-center">
                  <WatchIcon className="h-4 w-4 mr-2 text-yellow-400" />
                  <span className="font-medium">{watch.name}</span>
                </div>
                <div className="text-xs bg-blue-700 px-2 py-1 rounded">${watch.value}</div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-auto border-blue-700 text-blue-300 hover:bg-blue-800"
            onClick={() => setShowWatchSelector(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-yellow-400">{level.name}</h3>
        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
      </div>

      <p className="text-sm text-blue-200 mb-4 flex-grow">{level.description}</p>

      <div className="mb-4">
        <div className="text-xs uppercase text-blue-300 mb-1">Hint</div>
        <div className="italic text-sm text-blue-100">"{level.hint}"</div>
      </div>

      <div className="mb-4">
        <div className="text-xs uppercase text-blue-300 mb-1">Reward</div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">${level.reward.money}</span>
          {level.reward.watch && (
            <div className="flex items-center text-sm bg-blue-700 px-2 py-1 rounded">
              <WatchIcon className="h-3 w-3 mr-1 text-yellow-400" />
              <span>+ {getWatchName(level.reward.watch)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Show completion details for completed levels */}
      {isCompleted && completionDetails && (
        <div className="mb-4 bg-blue-900 p-2 rounded">
          <div className="text-xs uppercase text-blue-300 mb-1">Completed With</div>
          <div className="flex items-center gap-2 text-sm">
            <WatchIcon className="h-3 w-3 text-yellow-400" />
            <span>{completionWatch ? completionWatch.name : "Unknown Watch"}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <Clock className="h-3 w-3 text-yellow-400" />
            <span>Time: {formatTime(completionDetails.timeTaken)}</span>
          </div>
        </div>
      )}

      {!isAvailable && !showLockInfo && (
        <div className="mb-4">
          <div className="text-xs uppercase text-blue-300 mb-1">Unlock Requirement</div>
          <div className="text-sm text-blue-100">{getReadableUnlockCondition(level.unlockCondition)}</div>
        </div>
      )}

      {/* Show buttons based on level state */}
      {isAvailable ? (
        <div className="flex gap-2 mt-auto">
          <Button
            className="flex-1 bg-blue-700 hover:bg-blue-600 text-white"
            onClick={() => setShowWatchSelector(true)}
          >
            Switch Watch
          </Button>
          <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold" onClick={onSelect}>
            {isCompleted ? "Replay Mission" : "Start Mission"}
          </Button>
        </div>
      ) : (
        <Button className="w-full bg-blue-700 cursor-not-allowed text-blue-950 font-bold mt-auto" disabled>
          Locked
        </Button>
      )}
    </div>
  )
}

// Helper function to make unlock conditions readable
function getReadableUnlockCondition(condition: string): string {
  if (condition === "always") return "Always available"

  if (condition.startsWith("watch:")) {
    const watchId = condition.split(":")[1]
    return `Requires ${watchId.replace(/-/g, " ")} watch`
  }

  if (condition.startsWith("complete:")) {
    const levelId = condition.split(":")[1]
    return `Complete ${levelId.replace(/-/g, " ")} mission first`
  }

  if (condition.startsWith("watches:")) {
    const count = condition.split(":")[1]
    return `Own ${count} or more watches`
  }

  if (condition.includes(">")) {
    const [stat, value] = condition.split(">")
    return `Requires ${stat.trim()} stat > ${value.trim()}`
  }

  return condition
}

// Helper function to get watch name from ID
function getWatchName(watchId: string): string {
  const watchNames: { [key: string]: string } = {
    "glow-o-matic": "Glow-O-Matic",
    "velvet-tick": "Velvet Tick",
    "shadow-tick": "ShadowTick",
    nightrider: "NightRider V2",
    aquacore: "AquaCore 3000",
    codebreaker: "CodeBreaker",
    "junkyard-beater": "Junkyard Beater",
    rolex: "Rolex Prestige",
    smartcore: "SmartCore X",
    relic: "Timeless Relic",
    basic: "Basic Wristwatch",
  }

  return watchNames[watchId] || watchId
}

// Format time in minutes to MM:SS format
function formatTime(minutes: number): string {
  const mins = Math.floor(minutes)
  const secs = Math.floor((minutes - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

