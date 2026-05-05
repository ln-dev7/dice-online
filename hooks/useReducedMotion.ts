"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/store/settingsStore"

// Sync l'état Zustand avec la media query prefers-reduced-motion du système.
export function useReducedMotionSync() {
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    function onChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [setReducedMotion])
}
