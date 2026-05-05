"use client"

import { useCallback, useEffect, useRef } from "react"
import { useSettingsStore } from "@/store/settingsStore"

// Catalogue d'effets sonores. Pour un projet réel, télécharger les fichiers
// depuis https://www.soundcn.xyz/ et les placer dans /public/sounds.
export type SoundName =
  | "roll-start"
  | "dice-impact"
  | "critical"
  | "fumble"
  | "hover"
  | "toggle"

const SOUND_PATHS: Record<SoundName, string> = {
  "roll-start": "/sounds/roll-start.mp3",
  "dice-impact": "/sounds/dice-impact.mp3",
  critical: "/sounds/critical.mp3",
  fumble: "/sounds/fumble.mp3",
  hover: "/sounds/hover.mp3",
  toggle: "/sounds/toggle.mp3",
}

export function useSound() {
  const enabled = useSettingsStore((s) => s.soundEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const cacheRef = useRef<Map<SoundName, HTMLAudioElement>>(new Map())
  const tabVisibleRef = useRef(true)

  // Mute auto si onglet pas focus
  useEffect(() => {
    function onVisibility() {
      tabVisibleRef.current = !document.hidden
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return
      if (typeof window === "undefined") return
      if (!tabVisibleRef.current) return

      let audio = cacheRef.current.get(name)
      if (!audio) {
        audio = new Audio(SOUND_PATHS[name])
        audio.preload = "auto"
        cacheRef.current.set(name, audio)
      }
      audio.volume = volume
      // Fail silencieusement si le son n'existe pas
      audio.currentTime = 0
      audio.play().catch(() => {
        /* sons optionnels */
      })
    },
    [enabled, volume],
  )

  return { play }
}
