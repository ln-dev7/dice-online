"use client"

import { useCallback } from "react"
import confetti from "canvas-confetti"
import { executeRoll } from "@/lib/diceRoller"
import { parseNotation } from "@/lib/diceParser"
import type { RollMode, RollResult } from "@/types/dice"
import { useDiceStore } from "@/store/diceStore"
import { useHistoryStore } from "@/store/historyStore"
import { useSettingsStore } from "@/store/settingsStore"
import { useSound } from "@/hooks/useSound"
import { useVibration } from "@/hooks/useVibration"

interface RollArgs {
  notation?: string
  mode?: RollMode
  player?: string
  label?: string
}

const ROLL_DURATION_MS = 1500

// Hook principal pour déclencher un lancer (gère animation, sons, vibration, history).
export function useDiceRoll() {
  const setIsRolling = useDiceStore((s) => s.setIsRolling)
  const setCurrentResult = useDiceStore((s) => s.setCurrentResult)
  const isRolling = useDiceStore((s) => s.isRolling)
  const storeNotation = useDiceStore((s) => s.notation)
  const storeMode = useDiceStore((s) => s.mode)
  const addRoll = useHistoryStore((s) => s.addRoll)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const { play } = useSound()
  const { vibrate } = useVibration()

  const performRoll = useCallback(
    async (args: RollArgs = {}): Promise<RollResult | null> => {
      if (isRolling) return null

      const notation = args.notation ?? storeNotation
      const mode = args.mode ?? storeMode

      let result: RollResult
      try {
        result = executeRoll(parseNotation(notation), {
          mode,
          player: args.player,
          label: args.label,
        })
      } catch {
        return null
      }

      play("roll-start")
      setIsRolling(true)
      setCurrentResult(null)

      const delay = reducedMotion ? 0 : ROLL_DURATION_MS

      await new Promise((resolve) => setTimeout(resolve, delay))

      play("dice-impact")
      vibrate([100, 50, 100])
      setCurrentResult(result)
      addRoll(result)

      if (result.isCritical) {
        play("critical")
        if (!reducedMotion) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#facc15", "#fde68a", "#f59e0b"],
          })
        }
      } else if (result.isFumble) {
        play("fumble")
      }

      setIsRolling(false)
      return result
    },
    [
      isRolling,
      storeNotation,
      storeMode,
      reducedMotion,
      addRoll,
      play,
      vibrate,
      setIsRolling,
      setCurrentResult,
    ],
  )

  return { roll: performRoll, isRolling }
}
