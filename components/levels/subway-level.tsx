"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { Watch } from "@/lib/types"
import { ArrowRight, Check } from "lucide-react"

interface SubwayLevelProps {
  watch: Watch
  onComplete: () => void
  onCancel: () => void
  isReplay?: boolean
}

export default function SubwayLevel({ watch, onComplete, onCancel, isReplay = false }: SubwayLevelProps) {
  
  // Game state
  const [stage, setStage] = useState<"start" | "middle" | "end" | "complete">("start")
  const [seconds, setSeconds] = useState(0)
  const [isCorrectChoice, setIsCorrectChoice] = useState<boolean | null>(null)
  const [message, setMessage] = useState("")
  const [path, setPath] = useState<string[]>([])
  const [choice, setChoice] = useState<string | null>(null)
  const [frozenIsEven, setFrozenIsEven] = useState<boolean | null>(null)

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate visibility based on nightglow
  const visibility = Math.min(100, watch.stats.nightglow * 10)
  const opacity = visibility / 100

  // Start the timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Check if the current second is even or odd
  const isEven = seconds % 2 === 0

  // Handle subway choice
  const handleSubwayChoice = (choice: "A" | "B") => {

    // Freeze the current even/odd state when choice is made
    const currentIsEven = isEven
    setFrozenIsEven(currentIsEven)

    setChoice(choice)
    const correctChoice = currentIsEven ? "A" : "B"
    const isCorrect = choice === correctChoice

    setIsCorrectChoice(isCorrect)

    if (isCorrect) {
      setMessage("Good choice! You've arrived at Station C.")
      setPath([...path, choice])
      setTimeout(() => {
        setStage("middle")
        setIsCorrectChoice(null)
        setChoice(null)
        setFrozenIsEven(null)
      }, 1500)
    } else {
      setMessage("Wrong subway line! Try again.")
      setTimeout(() => {
        setIsCorrectChoice(null)
        setChoice(null)
        setFrozenIsEven(null)
      }, 1500)
    }
  }

  // Handle final station choice
  const handleStationChoice = (choice: "D" | "E") => {

    // Freeze the current even/odd state when choice is made
    const currentIsEven = isEven
    setFrozenIsEven(currentIsEven)

    setChoice(choice)
    const correctChoice = currentIsEven ? "D" : "E"
    const isCorrect = choice === correctChoice

    setIsCorrectChoice(isCorrect)

    if (isCorrect) {
      setMessage("You've successfully navigated the subway system!")
      setPath([...path, choice])
      setTimeout(() => {
        setStage("complete")
      }, 1500)
    } else {
      setMessage("Wrong station! Try again.")
      setTimeout(() => {
        setIsCorrectChoice(null)
        setChoice(null)
        setFrozenIsEven(null)
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 text-white p-6">
      <div className="max-w-2xl mx-auto bg-blue-900 rounded-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">Subway Escape</h1>

          {/* Watch display */}
          <div
            className="relative w-16 h-16 rounded-full border-4 border-yellow-400 flex items-center justify-center"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${1 - opacity})`,
              boxShadow: `0 0 ${watch.stats.nightglow * 3}px rgba(255, 215, 0, ${opacity})`,
            }}
          >
            <span className="font-mono text-lg font-bold" style={{ opacity: opacity }}>
              {seconds}
            </span>
          </div>
        </div>

        <div className="mb-6 bg-blue-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Mission Status</h2>
          <p className="text-blue-200">
            {stage === "start" &&
              "You need to escape through the subway system. Choose the correct subway line based on the time."}
            {stage === "middle" && "You've arrived at Station C. Now choose the correct next station."}
            {stage === "complete" && "Mission complete! You've successfully navigated the subway system."}
          </p>

          {message && (
            <div
              className={`mt-3 p-2 rounded ${isCorrectChoice ? "bg-green-800" : isCorrectChoice === false ? "bg-red-800" : ""}`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Path visualization */}
        {path.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-blue-300 mb-2">Your Path</h3>
            <div className="flex items-center">
              <div className="bg-blue-800 px-3 py-1 rounded">Start</div>
              {path.map((station, index) => (
                <div key={index} className="flex items-center">
                  <ArrowRight className="mx-2 text-yellow-400" />
                  <div className="bg-blue-800 px-3 py-1 rounded">Station {station}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game interface based on stage */}
        <div className="mb-8">
          {stage === "start" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Choose a Subway Line</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className={`h-24 text-xl ${
                    isCorrectChoice !== null && frozenIsEven
                      ? "bg-green-600"
                      : isCorrectChoice === false && choice === "A"
                        ? "bg-red-700"
                        : "bg-blue-700"
                  }`}
                  onClick={() => handleSubwayChoice("A")}
                  disabled={isCorrectChoice !== null}
                >
                  Subway Line A<div className="text-xs mt-1 opacity-70">For even seconds</div>
                </Button>
                <Button
                  className={`h-24 text-xl ${
                    isCorrectChoice !== null && !frozenIsEven
                      ? "bg-green-600"
                      : isCorrectChoice === false && choice === "B"
                        ? "bg-red-700"
                        : "bg-blue-700"
                  }`}
                  onClick={() => handleSubwayChoice("B")}
                  disabled={isCorrectChoice !== null}
                >
                  Subway Line B<div className="text-xs mt-1 opacity-70">For odd seconds</div>
                </Button>
              </div>
              <div className="text-center mt-4 text-blue-200">
                <p>Choose Line A if the time shows an even number of seconds.</p>
                <p>Choose Line B if the time shows an odd number of seconds.</p>
              </div>
            </div>
          )}

          {stage === "middle" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Choose Next Station</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className={`h-24 text-xl ${
                    isCorrectChoice !== null && frozenIsEven
                      ? "bg-green-600"
                      : isCorrectChoice === false && choice === "D"
                        ? "bg-red-700"
                        : "bg-blue-700"
                  }`}
                  onClick={() => handleStationChoice("D")}
                  disabled={isCorrectChoice !== null}
                >
                  Station D<div className="text-xs mt-1 opacity-70">For even seconds</div>
                </Button>
                <Button
                  className={`h-24 text-xl ${
                    isCorrectChoice !== null && !frozenIsEven
                      ? "bg-green-600"
                      : isCorrectChoice === false && choice === "E"
                        ? "bg-red-700"
                        : "bg-blue-700"
                  }`}
                  onClick={() => handleStationChoice("E")}
                  disabled={isCorrectChoice !== null}
                >
                  Station E<div className="text-xs mt-1 opacity-70">For odd seconds</div>
                </Button>
              </div>
              <div className="text-center mt-4 text-blue-200">
                <p>Choose Station D if the time shows an even number of seconds.</p>
                <p>Choose Station E if the time shows an odd number of seconds.</p>
              </div>
            </div>
          )}

          {stage === "complete" && (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-green-700 rounded-full p-4">
                  <Check className="h-16 w-16 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Mission Complete!</h3>
              <p className="text-blue-200 mb-6">
                You've successfully navigated the subway system and escaped your pursuers. Your watch's nightglow rating
                of {watch.stats.nightglow}/10 helped you see in the dark tunnels.
                {isReplay && " This was a replay, so no additional rewards were given."}
              </p>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold text-lg px-8 py-3"
                onClick={onComplete}
              >
                {isReplay ? "Return to Map" : "Claim Reward"}
              </Button>
            </div>
          )}
        </div>

        {stage !== "complete" && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-blue-700 text-blue-300 hover:bg-blue-800"
              onClick={onCancel}
            >
              Abort Mission
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

