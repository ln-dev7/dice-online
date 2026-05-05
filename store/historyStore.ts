import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { RollResult } from "@/types/dice"

const MAX_HISTORY = 100

export interface HistoryState {
  rolls: RollResult[]
  addRoll: (roll: RollResult) => void
  removeRoll: (id: string) => void
  clearAll: () => void
  reset: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      rolls: [],
      addRoll: (roll) =>
        set((state) => ({
          rolls: [roll, ...state.rolls].slice(0, MAX_HISTORY),
        })),
      removeRoll: (id) =>
        set((state) => ({ rolls: state.rolls.filter((r) => r.id !== id) })),
      clearAll: () => set({ rolls: [] }),
      reset: () => set({ rolls: [] }),
    }),
    { name: "dice-online:history" },
  ),
)
