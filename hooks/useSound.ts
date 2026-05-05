"use client"

import { useCallback, useEffect, useRef } from "react"
import { playSound, type SoundName } from "@/lib/sounds"
import { useSettingsStore } from "@/store/settingsStore"

export function useSound() {
  const enabled = useSettingsStore((s) => s.soundEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const tabVisibleRef = useRef(true)

  // Mute auto si l'onglet est en arrière-plan
  useEffect(() => {
    if (typeof document === "undefined") return
    function onVisibility() {
      tabVisibleRef.current = !document.hidden
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return
      if (!tabVisibleRef.current) return
      playSound(name, volume)
    },
    [enabled, volume],
  )

  return { play }
}

export type { SoundName }
