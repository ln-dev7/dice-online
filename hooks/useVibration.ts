"use client"

import { useCallback } from "react"
import { useSettingsStore } from "@/store/settingsStore"

export function useVibration() {
  const enabled = useSettingsStore((s) => s.vibrationEnabled)

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!enabled) return
      if (typeof navigator === "undefined") return
      if (typeof navigator.vibrate !== "function") return
      navigator.vibrate(pattern)
    },
    [enabled],
  )

  return { vibrate }
}
