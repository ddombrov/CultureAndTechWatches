"use client";

import { useState, useEffect, useRef } from "react";
import type { Watch, Level, GameState } from "@/lib/types";
import { initialWatches, initialLevels } from "@/lib/game-data";
import WatchCard from "@/components/watch-card";
import LevelCard from "@/components/level-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, LogOut, RotateCcw, Save } from "lucide-react";
import SubwayLevel from "@/components/levels/subway-level";

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    money: 5000,
    time: 0,
    ownedWatches: [],
    selectedWatch: null,
    completedLevels: [],
    completionDetails: {},
    currentLevel: null,
    starterWatchId: undefined,
  });

  const [availableWatches, setAvailableWatches] =
    useState<Watch[]>(initialWatches);
  const [availableLevels, setAvailableLevels] =
    useState<Level[]>(initialLevels);

  // States for mission timer
  const [missionStartTime, setMissionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State for save game notification
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {

    // Load game from localStorage
    const savedGame = localStorage.getItem("watchcraft-game");
    if (savedGame) {
      setGameState(JSON.parse(savedGame));
    }
  }, []);

  // useEffect for saving to localStorage
  useEffect(() => {

    // Save if the game has started
    if (gameState.started) {
      localStorage.setItem("watchcraft-game", JSON.stringify(gameState));
    }
  }, [gameState]);

  // Timer effect for mission
  useEffect(() => {
    if (gameState.currentLevel && missionStartTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - missionStartTime) / 1000 / 60;
        setElapsedTime(elapsed);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState.currentLevel, missionStartTime]);

  const selectStarterWatch = (watch: Watch) => {

    // Find the basic watch
    const basicWatch = initialWatches.find((w) => w.id === "basic");

    setGameState({
      ...gameState,

      // Include both the selected starter watch and the basic watch
      ownedWatches: basicWatch ? [watch, basicWatch] : [watch],
      selectedWatch: watch,
      started: true,
      starterWatchId: watch.id,
    });
  };

  const selectWatch = (watch: Watch) => {
    setGameState({
      ...gameState,
      selectedWatch: watch,
    });
  };

  const selectLevel = (level: Level) => {

    // Start the timer when selecting a level
    setMissionStartTime(Date.now());
    setElapsedTime(0);

    setGameState({
      ...gameState,
      currentLevel: level,
    });
  };

  const updateTotalGameTime = (missionTime: number) => {
    setGameState((prev) => ({
      ...prev,
      time: prev.time + missionTime,
    }));
  };

  const completeLevel = () => {
    if (!gameState.currentLevel || !gameState.selectedWatch) return;

    const level = gameState.currentLevel;

    // Check if this is a first-time completion or a replay
    const isFirstTimeCompletion = !gameState.completedLevels.includes(level.id);

    // Add level to completed levels
    const updatedCompletedLevels = isFirstTimeCompletion
      ? [...gameState.completedLevels, level.id]
      : gameState.completedLevels;

    // Add reward money
    const updatedMoney = isFirstTimeCompletion
      ? gameState.money + level.reward.money
      : gameState.money;

    // Add reward watch if there is one
    const updatedOwnedWatches = [...gameState.ownedWatches];
    if (isFirstTimeCompletion && level.reward.watch) {
      const rewardWatch = availableWatches.find(
        (w) => w.id === level.reward.watch
      );
      if (
        rewardWatch &&
        !updatedOwnedWatches.some((w) => w.id === rewardWatch.id)
      ) {
        updatedOwnedWatches.push(rewardWatch);
      }
    }

    // Stop the timer and record the time
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Track completion details with actual time taken
    // Update time for replays if best time
    const updatedCompletionDetails = { ...gameState.completionDetails };

    if (
      isFirstTimeCompletion ||
      !updatedCompletionDetails[level.id] ||
      elapsedTime < updatedCompletionDetails[level.id].timeTaken
    ) {
      updatedCompletionDetails[level.id] = {
        watchId: gameState.selectedWatch.id,
        timeCompleted: new Date().toISOString(),
        timeTaken: elapsedTime,
      };
    }

    // Update total game time
    const newTotalTime = gameState.time + elapsedTime;

    setGameState({
      ...gameState,
      money: updatedMoney,
      ownedWatches: updatedOwnedWatches,
      completedLevels: updatedCompletedLevels,
      completionDetails: updatedCompletionDetails,
      currentLevel: null,
      time: newTotalTime,
    });

    // Reset timer state
    setMissionStartTime(null);
    setElapsedTime(0);
  };

  const sellWatch = (watch: Watch) => {
    if (!gameState.ownedWatches.find((w) => w.id === watch.id)) return;

    // Can't sell if it's the only watch
    if (gameState.ownedWatches.length <= 1) return;

    // Can't sell the basic watch
    if (watch.id === "basic") return;

    // Can't sell the currently equipped watch
    if (gameState.selectedWatch?.id === watch.id) return;

    // Remove from owned watches
    const updatedOwnedWatches = gameState.ownedWatches.filter(
      (w) => w.id !== watch.id
    );

    setGameState({
      ...gameState,
      money: gameState.money + Math.floor(watch.value / 2),
      ownedWatches: updatedOwnedWatches,
    });
  };

  const getShopWatches = () => {

    // Show all watches purchasable (have buy condition) that aren't owned
    const buyWatches = availableWatches.filter(
      (watch) =>
        watch.unlockCondition === "buy" &&
        !gameState.ownedWatches.some((w) => w.id === watch.id)
    );

    // Add starter watches if at least one level is completed
    const starterWatches = availableWatches.filter(
      (watch) =>
        watch.unlockCondition === "starter" &&
        !gameState.ownedWatches.some((w) => w.id === watch.id) &&

        // Always include the user's original starter watch
        (watch.id === gameState.starterWatchId ||
            
          // For other starter watches, require at least one completed level
          gameState.completedLevels.length > 0)
    );

    return [...buyWatches, ...starterWatches];
  };

  const getWatchesByStatus = () => {
    const owned = gameState.ownedWatches;
    const ownedIds = owned.map((w) => w.id);

    const locked = availableWatches.filter((w) => !ownedIds.includes(w.id));

    const equipable = [...owned];

    const unlocked = getShopWatches();

    return {
      owned,
      equipable,
      unlocked,
      locked: locked.filter((w) => !unlocked.some((u) => u.id === w.id)),
    };
  };

  const endGame = () => {

    // Reset to initial state
    localStorage.removeItem("watchcraft-game");
    window.location.href = "/";
  };

  const resetGame = () => {
    localStorage.removeItem("watchcraft-game");
    setGameState({
      started: false,
      money: 5000,
      time: 0,
      ownedWatches: [],
      selectedWatch: null,
      completedLevels: [],
      completionDetails: {},
      currentLevel: null,
      starterWatchId: undefined,
    });
    setShowGameComplete(false);
    setShowResetConfirmation(false);
  };

  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const [showGameOptions, setShowGameOptions] = useState(false);

  // saveGame is "not ready" 
  const saveGame = () => {
    localStorage.setItem("watchcraft-game", JSON.stringify(gameState));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  const getAvailableLevels = () => {
    return availableLevels.filter((level) => {

      if (level.unlockCondition === "always") return true;

      if (level.unlockCondition.startsWith("watch:")) {
        const requiredWatchId = level.unlockCondition.split(":")[1];
        return gameState.ownedWatches.some((w) => w.id === requiredWatchId);
      }

      if (level.unlockCondition.startsWith("complete:")) {
        const requiredLevelId = level.unlockCondition.split(":")[1];
        return gameState.completedLevels.includes(requiredLevelId);
      }

      if (level.unlockCondition.startsWith("watches:")) {
        const requiredCount = Number.parseInt(
          level.unlockCondition.split(":")[1]
        );
        return gameState.ownedWatches.length >= requiredCount;
      }

      if (level.unlockCondition.includes(">")) {
        const [stat, value] = level.unlockCondition.split(">");
        const requiredValue = Number.parseInt(value);
        return gameState.ownedWatches.some(
          (w) => w.stats[stat.trim() as keyof typeof w.stats] >= requiredValue
        );
      }

      return false;
    });
  };

  const [showInfo, setShowInfo] = useState(false);

  const formatTime = (timeInMinutes: number) => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.floor(timeInMinutes % 60);
    const seconds = Math.floor((timeInMinutes * 60) % 60);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const sortLevelsByCompletion = (levels: Level[]) => {
    return [...levels].sort((a, b) => {
      const aAvailable = getAvailableLevels().some((l) => l.id === a.id);
      const bAvailable = getAvailableLevels().some((l) => l.id === b.id);
      const aCompleted = gameState.completedLevels.includes(a.id);
      const bCompleted = gameState.completedLevels.includes(b.id);

      // First sort by completion status (incomplete first)
      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && !bCompleted) return 1;

      // Then sort by availability
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;

      return 0;
    });
  };

  const [showGameComplete, setShowGameComplete] = useState(false);

  useEffect(() => {
    if (
      gameState.started &&
      gameState.completedLevels.length === availableLevels.length &&
      !showGameComplete
    ) {
      setShowGameComplete(true);
    }
  }, [
    gameState.completedLevels.length,
    availableLevels.length,
    gameState.started,
    showGameComplete,
  ]);

  // Sort levels so unlocked ones appear first
  const sortLevels = (levels: Level[]) => {
    return [...levels].sort((a, b) => {
      const aAvailable = getAvailableLevels().some((l) => l.id === a.id);
      const bAvailable = getAvailableLevels().some((l) => l.id === b.id);

      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      return 0;
    });
  };

  const buyWatch = (watch: Watch) => {
    if (!availableWatches.find((w) => w.id === watch.id)) return;

    if (gameState.money < watch.value) return;

    const updatedOwnedWatches = [...gameState.ownedWatches, watch];

    setGameState({
      ...gameState,
      money: gameState.money - watch.value,
      ownedWatches: updatedOwnedWatches,
    });
  };

  if (!gameState.started || gameState.ownedWatches.length === 0) {
    return (
      <div className="min-h-screen bg-blue-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Choose Your Starting Watch
          </h1>
          <p className="text-blue-200 mb-8 text-center">
            Your first watch will determine your initial strategy. Choose
            wisely!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialWatches
              .filter((watch) => watch.unlockCondition === "starter")
              .map((watch) => (
                <div key={watch.id}>
                  <WatchCard
                    watch={watch}
                    isStarter={true}
                    actionButton={
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950"
                        onClick={() => selectStarterWatch(watch)}
                      >
                        Select {watch.name}
                      </Button>
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState.currentLevel) {
    const level = gameState.currentLevel;
    const watch = gameState.selectedWatch;

    if (!watch) return <div>Error: No watch selected</div>;

    if (level.id === "subway") {
      const isReplay = gameState.completedLevels.includes(level.id);
      return (
        <SubwayLevel
          watch={watch}
          onComplete={completeLevel}
          onCancel={() => {

            // Reset timer when canceling
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setMissionStartTime(null);
            setElapsedTime(0);
            setGameState({ ...gameState, currentLevel: null });
          }}
          isReplay={isReplay}
        />
      );
    }

    // Calculate success chance based on watch stats and level requirements
    const calculateSuccessChance = () => {
      let chance = 50;

      // Check each recommended stat
      for (const [stat, value] of Object.entries(level.recommendedStats)) {
        const watchStat = watch.stats[stat as keyof typeof watch.stats];
        if (watchStat >= value) {
          chance += 20;
        } else {
          chance -= (10 * (value - watchStat)) / value;
        }
      }

      // Would eventually want to give suggestions for improving stats

      // Cap between 10 and 100
      return Math.min(100, Math.max(10, chance));
    };

    const successChance = calculateSuccessChance();

    return (
      <div className="min-h-screen bg-blue-950 text-white p-6">
        <div className="max-w-2xl mx-auto bg-blue-900 rounded-lg p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-yellow-400">{level.name}</h1>
            <div className="text-yellow-400 font-mono">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <p className="text-blue-200 mb-6">{level.description}</p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              Mission Hint
            </h2>
            <p className="italic text-blue-200">"{level.hint}"</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              Your Watch
            </h2>
            <div className="bg-blue-800 rounded p-4">
              <h3 className="font-bold text-yellow-400">{watch.name}</h3>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.entries(watch.stats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className="text-xs uppercase text-blue-300">
                      {stat}
                    </div>
                    <div className="font-bold text-yellow-400">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              Success Chance
            </h2>
            <Progress value={successChance} className="h-4 bg-blue-800" />
            <div className="text-right mt-1 text-sm text-blue-200">
              {Math.round(successChance)}%
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-3"
              onClick={completeLevel}
            >
              Complete Mission
            </Button>
            <Button
              variant="outline"
              className="border-blue-700 text-blue-300 hover:bg-blue-800"
              onClick={() => {

                // Reset timer when canceling
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                setMissionStartTime(null);
                setElapsedTime(0);
                setGameState({ ...gameState, currentLevel: null });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game completion screen
  if (showGameComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="max-w-3xl mx-auto bg-blue-900 rounded-lg p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">
              Congratulations!
            </h1>
            <p className="text-2xl text-blue-200 mb-6">
              You've completed all missions in WatchCraft!
            </p>

            <div className="flex justify-center mb-8">
              <div className="bg-yellow-500 rounded-full p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-blue-950"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                Final Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Total Money:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    ${gameState.money}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Total Time:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {formatTime(gameState.time)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Watches Collected:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {gameState.ownedWatches.length}/{availableWatches.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Missions Completed:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {gameState.completedLevels.length}/{availableLevels.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">
                Your Collection
              </h2>
              <div className="space-y-2">
                {gameState.ownedWatches.map((watch) => (
                  <div
                    key={watch.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-blue-200">{watch.name}</span>
                    <span className="text-yellow-400">${watch.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-3 px-8 text-lg"
              onClick={resetGame}
            >
              Start New Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-wrap items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-yellow-400 mr-auto">
            ⌚️ WatchCraft
          </h1>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-700 text-blue-300 hover:bg-blue-800"
              onClick={() => setShowGameOptions(!showGameOptions)}
            >
              Game Options
            </Button>

            {showGameOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-blue-900 rounded-md shadow-lg z-10 py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:bg-blue-800 flex items-center gap-2"
                  onClick={() => {
                    setShowInfo(true);
                    setShowGameOptions(false);
                  }}
                >
                  <Info className="h-4 w-4" />
                  <span>Info</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:bg-blue-800 flex items-center gap-2"
                  onClick={() => {
                    saveGame();
                    setShowGameOptions(false);
                  }}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Game (Not Ready)</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:bg-blue-800 flex items-center gap-2"
                  onClick={() => {
                    setShowResetConfirmation(true);
                    setShowGameOptions(false);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restart Game</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:bg-blue-800 flex items-center gap-2"
                  onClick={() => {
                    endGame();
                    setShowGameOptions(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>End Game</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex justify-between items-center mb-6 bg-blue-900 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-blue-300 text-sm">Money</span>
              <div className="text-yellow-400 font-bold text-xl">
                ${gameState.money}
              </div>
            </div>
            <div>
              <span className="text-blue-300 text-sm">Time</span>
              <div className="text-yellow-400 font-bold text-xl">
                {formatTime(gameState.time)}
              </div>
            </div>
          </div>
          <div>
            <span className="text-blue-300 text-sm">Completed Missions</span>
            <div className="text-yellow-400 font-bold text-xl">
              {gameState.completedLevels.length}/{availableLevels.length}
            </div>
          </div>
        </div>

        <Tabs defaultValue="missions" className="w-full">
          <TabsList className="w-full mb-8 bg-transparent border-b border-blue-800 p-0">
            <TabsTrigger
              value="missions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-2"
            >
              Missions
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-2"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="store"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-2"
            >
              Watch Store
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missions" className="mt-0">
            <div className="bg-blue-900 p-6 rounded-lg mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Missions
              </h2>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-6 bg-transparent border-b border-blue-800 p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    All Missions
                  </TabsTrigger>
                  <TabsTrigger
                    value="uncompleted"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Uncompleted
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortLevelsByCompletion(availableLevels).map((level) => {
                      const isAvailable = getAvailableLevels().some(
                        (l) => l.id === level.id
                      );
                      const isCompleted = gameState.completedLevels.includes(
                        level.id
                      );

                      return (
                        <LevelCard
                          key={level.id}
                          level={level}
                          isCompleted={isCompleted}
                          isAvailable={isAvailable}
                          onSelect={() => {
                            if (isAvailable) {
                              selectLevel(level);
                            }
                          }}
                          selectedWatch={gameState.selectedWatch}
                          watches={gameState.ownedWatches}
                          onSwitchWatch={() => {}}
                          completionDetails={
                            isCompleted
                              ? gameState.completionDetails[level.id]
                              : null
                          }
                          allWatches={availableWatches}
                          onWatchSelect={selectWatch}
                        />
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="uncompleted" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortLevelsByCompletion(availableLevels)
                      .filter(
                        (level) => !gameState.completedLevels.includes(level.id)
                      )
                      .map((level) => {
                        const isAvailable = getAvailableLevels().some(
                          (l) => l.id === level.id
                        );

                        return (
                          <LevelCard
                            key={level.id}
                            level={level}
                            isCompleted={false}
                            isAvailable={isAvailable}
                            onSelect={() =>
                              isAvailable ? selectLevel(level) : null
                            }
                            selectedWatch={gameState.selectedWatch}
                            watches={gameState.ownedWatches}
                            onSwitchWatch={() => {}}
                            completionDetails={null}
                            allWatches={availableWatches}
                            onWatchSelect={selectWatch}
                          />
                        );
                      })}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortLevelsByCompletion(availableLevels)
                      .filter((level) =>
                        gameState.completedLevels.includes(level.id)
                      )
                      .filter((level) =>
                        gameState.completedLevels.includes(level.id)
                      )
                      .map((level) => (
                        <LevelCard
                          key={level.id}
                          level={level}
                          isCompleted={true}
                          isAvailable={true}
                          onSelect={() => selectLevel(level)} 
                          selectedWatch={gameState.selectedWatch}
                          watches={gameState.ownedWatches}
                          onSwitchWatch={() => {}}
                          completionDetails={
                            gameState.completionDetails[level.id]
                          }
                          allWatches={availableWatches}
                          onWatchSelect={selectWatch}
                        />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Your Watches
              </h2>
              <p className="text-blue-200 mb-6">
                Select a watch to use on missions.
              </p>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-6 bg-transparent border-b border-blue-800 p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    All Watches
                  </TabsTrigger>
                  <TabsTrigger
                    value="equipable"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Equipable
                  </TabsTrigger>
                  <TabsTrigger
                    value="unlocked"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Unlocked
                  </TabsTrigger>
                  <TabsTrigger
                    value="locked"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Locked
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             
                    {gameState.ownedWatches.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className={`w-full ${
                              gameState.selectedWatch?.id === watch.id
                                ? "bg-yellow-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            } text-blue-950 font-bold`}
                            onClick={() => selectWatch(watch)}
                            disabled={gameState.selectedWatch?.id === watch.id}
                          >
                            {gameState.selectedWatch?.id === watch.id
                              ? "Equipped"
                              : "Equip"}
                          </Button>
                        }
                      />
                    ))}

            
                    {getWatchesByStatus().unlocked.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => buyWatch(watch)}
                            disabled={gameState.money < watch.value}
                          >
                            Buy for ${watch.value}
                          </Button>
                        }
                      />
                    ))}

           
                    {getWatchesByStatus().locked.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className="w-full bg-blue-700 hover:bg-blue-800 text-blue-300 cursor-not-allowed opacity-70"
                            disabled
                          >
                            Locked
                          </Button>
                        }
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="equipable" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getWatchesByStatus().equipable.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className={`w-full ${
                              gameState.selectedWatch?.id === watch.id
                                ? "bg-yellow-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            } text-blue-950 font-bold`}
                            onClick={() => selectWatch(watch)}
                            disabled={gameState.selectedWatch?.id === watch.id}
                          >
                            {gameState.selectedWatch?.id === watch.id
                              ? "Equipped"
                              : "Equip"}
                          </Button>
                        }
                      />
                    ))}

                    {getWatchesByStatus().equipable.length === 0 && (
                      <div className="col-span-full text-center py-8 text-blue-400">
                        You don't have any watches to equip yet.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="unlocked" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getWatchesByStatus().unlocked.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => buyWatch(watch)}
                            disabled={gameState.money < watch.value}
                          >
                            Buy for ${watch.value}
                          </Button>
                        }
                      />
                    ))}

                    {getWatchesByStatus().unlocked.length === 0 && (
                      <div className="col-span-full text-center py-8 text-blue-400">
                        No watches available for purchase at this time. Complete
                        more missions to unlock new watches!
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="locked" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getWatchesByStatus().locked.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className="w-full bg-blue-700 hover:bg-blue-800 text-blue-300 cursor-not-allowed opacity-70"
                            disabled
                          >
                            Locked
                          </Button>
                        }
                      />
                    ))}

                    {getWatchesByStatus().locked.length === 0 && (
                      <div className="col-span-full text-center py-8 text-blue-400">
                        You've unlocked all available watches. Congratulations!
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

   

          <TabsContent value="store" className="mt-0">
            <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Watch Store
              </h2>

              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="w-full mb-6 bg-transparent border-b border-blue-800 p-0">
                  <TabsTrigger
                    value="buy"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Buy Watches
                  </TabsTrigger>
                  <TabsTrigger
                    value="sell"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-1 text-sm"
                  >
                    Sell Watches
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="mt-0">
                  <p className="text-blue-200 mb-6">
                    Buy new watches to expand your collection and unlock new
                    missions.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getShopWatches().map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold"
                            onClick={() => buyWatch(watch)}
                            disabled={gameState.money < watch.value}
                          >
                            Buy for ${watch.value}
                          </Button>
                        }
                      />
                    ))}

                    {availableWatches
                      .filter(
                        (watch) =>
                          (watch.unlockCondition === "buy" ||
                            watch.unlockCondition === "starter") &&
                          !gameState.ownedWatches.some(
                            (w) => w.id === watch.id
                          ) &&
                          !getShopWatches().some((w) => w.id === watch.id)
                      )
                      .map((watch) => (
                        <WatchCard
                          key={watch.id}
                          watch={watch}
                          actionButton={
                            <Button
                              className="w-full bg-blue-700 text-blue-300 cursor-not-allowed opacity-70"
                              disabled
                            >
                              {watch.unlockCondition === "starter" &&
                              gameState.completedLevels.length === 0
                                ? "Complete 1 mission to unlock"
                                : "Locked"}
                            </Button>
                          }
                        />
                      ))}

                    {getShopWatches().length === 0 &&
                      availableWatches.filter(
                        (w) =>
                          w.unlockCondition === "buy" ||
                          w.unlockCondition === "starter"
                      ).length === 0 && (
                        <div className="col-span-full text-center py-8 text-blue-400">
                          No watches available for purchase at this time.
                          Complete more missions to unlock new watches!
                        </div>
                      )}
                  </div>
                </TabsContent>

                <TabsContent value="sell" className="mt-0">
                  <p className="text-blue-200 mb-6">
                    Sell watches you no longer need for half their value.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gameState.ownedWatches.map((watch) => (
                      <WatchCard
                        key={watch.id}
                        watch={watch}
                        actionButton={
                          <Button
                            variant="outline"
                            className={`w-full border-blue-600 text-blue-200 hover:bg-blue-700 ${
                              watch.id === "basic"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => sellWatch(watch)}
                            disabled={
                              gameState.ownedWatches.length <= 1 ||
                              watch.id === "basic" ||
                              gameState.selectedWatch?.id === watch.id
                            }
                          >
                            {watch.id === "basic"
                              ? "Cannot Sell Basic Watch"
                              : gameState.selectedWatch?.id === watch.id
                              ? "Equip another watch first"
                              : `Sell for $${Math.floor(watch.value / 2)}`}
                          </Button>
                        }
                      />
                    ))}

                    {gameState.ownedWatches.length === 0 && (
                      <div className="col-span-full text-center py-8 text-blue-400">
                        You don't have any watches to sell.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-950 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              WatchCraft: The Time Is Yours
            </h2>
            <div className="text-blue-100 space-y-4">
              <p>
                A strategy-focused game where watches aren't just for telling
                time—they're tools, keys, weapons, and the difference between
                success and failure.
              </p>
              <h3 className="text-xl font-bold text-yellow-400">How To Play</h3>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  You are a freelance agent navigating a variety of missions.
                </li>
                <li>
                  Each watch has stats from 1 to 10 in various properties:
                  NightGlow, Waterproof, Tech, Style, and Durability.
                </li>
                <li>
                  Choose the right watch for each mission based on the mission's
                  requirements.
                </li>
                <li>Complete missions to earn money and new watches.</li>
                <li>Buy new watches from the store to unlock more missions.</li>
                <li>
                  Your goal is to complete all missions and finish with the
                  highest possible score.
                </li>
              </ul>
            </div>
            <Button
              className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold"
              onClick={() => setShowInfo(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-950 rounded-lg p-6 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Restart Game?
            </h2>
            <p className="text-blue-100 mb-6">
              Are you sure you want to restart the game? All progress will be
              lost.
            </p>
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  resetGame();
                  setShowResetConfirmation(false);
                }}
              >
                Yes, Restart Game
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-blue-700 text-blue-300 hover:bg-blue-800"
                onClick={() => setShowResetConfirmation(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSaveNotification && (
        <div className="fixed top-4 right-4 bg-blue-800 text-white text-sm px-4 py-2 rounded shadow-lg z-50">
          This feature is not available yet
        </div>
      )}

    </div>
  );
}
