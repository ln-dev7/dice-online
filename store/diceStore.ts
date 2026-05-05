import { create } from "zustand"
import type { DiceType, RollMode, RollResult } from "@/types/dice"

// État volatile du lancer en cours (pas persisté)
export interface DiceState {
  selectedType: DiceType
  count: number
  modifier: number
  notation: string
  mode: RollMode
  isRolling: boolean
  currentResult: RollResult | null
  setSelectedType: (t: DiceType) => void
  setCount: (n: number) => void
  setModifier: (n: number) => void
  setNotation: (s: string) => void
  setMode: (m: RollMode) => void
  setIsRolling: (b: boolean) => void
  setCurrentResult: (r: RollResult | null) => void
  reset: () => void
}

// Quand l'utilisateur change le type ou le nombre de dés, l'ancien résultat
// devient obsolète : on le purge pour que la preview reflète la nouvelle config.
export const useDiceStore = create<DiceState>((set) => ({
  selectedType: "d6",
  count: 1,
  modifier: 0,
  notation: "1d6",
  mode: "normal",
  isRolling: false,
  currentResult: null,
  setSelectedType: (selectedType) =>
    set({ selectedType, currentResult: null }),
  setCount: (count) =>
    set({ count: Math.max(1, Math.min(100, count)), currentResult: null }),
  setModifier: (modifier) => set({ modifier }),
  setNotation: (notation) => set({ notation }),
  setMode: (mode) => set({ mode, currentResult: null }),
  setIsRolling: (isRolling) => set({ isRolling }),
  setCurrentResult: (currentResult) => set({ currentResult }),
  reset: () =>
    set({
      selectedType: "d6",
      count: 1,
      modifier: 0,
      notation: "1d6",
      mode: "normal",
      isRolling: false,
      currentResult: null,
    }),
}))
