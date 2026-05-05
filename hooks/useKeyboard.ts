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

// Les +/- et 1-9 ciblent le PREMIER groupe de dés (le plus courant en JDR :
// un seul groupe). Pour les multi-groupes, l'utilisateur passera par la souris.
export function useKeyboard(options: KeyboardOptions = {}) {
  const groups = useDiceStore((s) => s.groups)
  const updateGroupType = useDiceStore((s) => s.updateGroupType)
  const updateGroupCount = useDiceStore((s) => s.updateGroupCount)
  const reset = useDiceStore((s) => s.reset)
  const { roll } = useDiceRoll()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e.target)) return

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        options.onOpenCommandPalette?.()
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      const firstGroup = groups[0]

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
          if (firstGroup) {
            e.preventDefault()
            updateGroupCount(firstGroup.id, firstGroup.count + 1)
          }
          return
        case "-":
          if (firstGroup) {
            e.preventDefault()
            updateGroupCount(firstGroup.id, firstGroup.count - 1)
          }
          return
        default:
          break
      }

      const num = Number.parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= 9 && firstGroup) {
        const type: DiceType | undefined = DICE_TYPES[num - 1]
        if (type) {
          e.preventDefault()
          updateGroupType(firstGroup.id, type)
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [groups, reset, roll, updateGroupCount, updateGroupType, options])
}
