"use client"

import { useEffect } from "react"
import { DICE_TYPES, type DiceType } from "@/types/dice"
import { useDiceStore } from "@/store/diceStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

interface KeyboardOptions {
  onOpenHistory?: () => void
  onOpenSettings?: () => void
  onOpenHelp?: () => void
  onOpenCommandPalette?: () => void
}

export function useKeyboard(options: KeyboardOptions = {}) {
  const setSelectedType = useDiceStore((s) => s.setSelectedType)
  const setCount = useDiceStore((s) => s.setCount)
  const count = useDiceStore((s) => s.count)
  const reset = useDiceStore((s) => s.reset)
  const { roll } = useDiceRoll()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e.target)) return

      // Cmd/Ctrl + K — palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        options.onOpenCommandPalette?.()
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          void roll()
          return
        case "r":
        case "R":
          e.preventDefault()
          reset()
          return
        case "h":
        case "H":
          e.preventDefault()
          options.onOpenHistory?.()
          return
        case "s":
        case "S":
          e.preventDefault()
          options.onOpenSettings?.()
          return
        case "?":
          e.preventDefault()
          options.onOpenHelp?.()
          return
        case "+":
          e.preventDefault()
          setCount(count + 1)
          return
        case "-":
          e.preventDefault()
          setCount(count - 1)
          return
        default:
          break
      }

      // Touches 1-9 = sélection rapide d'un type de dé
      const num = Number.parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= 9) {
        const type: DiceType | undefined = DICE_TYPES[num - 1]
        if (type) {
          e.preventDefault()
          setSelectedType(type)
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [count, reset, roll, setCount, setSelectedType, options])
}
