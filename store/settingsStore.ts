import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DiceMaterial =
  | "plastic"
  | "metal"
  | "gem"
  | "wood"
  | "marble"
  | "holographic"
  | "neon"

export type DiceTrayBackground = "felt" | "wood" | "stone" | "space" | "transparent"

export type DiceColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "gold"
  | "silver"
  | "black"
  | "white"
  | "neon-pink"
  | "neon-cyan"

export interface SettingsState {
  soundEnabled: boolean
  volume: number
  vibrationEnabled: boolean
  use3D: boolean
  reducedMotion: boolean
  diceColor: DiceColor
  diceMaterial: DiceMaterial
  trayBackground: DiceTrayBackground
  cryptoSecure: boolean
  showDetailedResults: boolean
  setSoundEnabled: (v: boolean) => void
  setVolume: (v: number) => void
  setVibrationEnabled: (v: boolean) => void
  setUse3D: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setDiceColor: (v: DiceColor) => void
  setDiceMaterial: (v: DiceMaterial) => void
  setTrayBackground: (v: DiceTrayBackground) => void
  setShowDetailedResults: (v: boolean) => void
  reset: () => void
}

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  volume: 0.6,
  vibrationEnabled: true,
  use3D: true,
  reducedMotion: false,
  diceColor: "purple" as DiceColor,
  diceMaterial: "plastic" as DiceMaterial,
  trayBackground: "felt" as DiceTrayBackground,
  cryptoSecure: true,
  showDetailedResults: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVolume: (volume) => set({ volume }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      setUse3D: (use3D) => set({ use3D }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setDiceColor: (diceColor) => set({ diceColor }),
      setDiceMaterial: (diceMaterial) => set({ diceMaterial }),
      setTrayBackground: (trayBackground) => set({ trayBackground }),
      setShowDetailedResults: (showDetailedResults) =>
        set({ showDetailedResults }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: "dice-online:settings" },
  ),
)
