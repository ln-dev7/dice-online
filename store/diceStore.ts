import { create } from "zustand"
import type { DiceType, RollMode, RollResult } from "@/types/dice"

export interface DiceGroupUI {
  id: string
  type: DiceType
  count: number
}

export interface DiceState {
  groups: DiceGroupUI[]
  modifier: number
  notation: string
  mode: RollMode
  isRolling: boolean
  currentResult: RollResult | null

  setGroups: (g: DiceGroupUI[]) => void
  addGroup: (type?: DiceType) => void
  removeGroup: (id: string) => void
  updateGroupType: (id: string, type: DiceType) => void
  updateGroupCount: (id: string, count: number) => void

  setModifier: (n: number) => void
  setNotation: (s: string) => void
  setMode: (m: RollMode) => void
  setIsRolling: (b: boolean) => void
  setCurrentResult: (r: RollResult | null) => void
  reset: () => void
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function computeNotation(
  groups: DiceGroupUI[],
  modifier: number,
): string {
  if (groups.length === 0) return "1d6"
  const parts = groups.map((g) => `${g.count}${g.type}`)
  let s = parts.join("+")
  if (modifier > 0) s += `+${modifier}`
  else if (modifier < 0) s += `${modifier}`
  return s
}

const DEFAULT_GROUPS: DiceGroupUI[] = [
  { id: "default", type: "d6", count: 1 },
]

const clampCount = (n: number) => Math.max(1, Math.min(100, n))

export const useDiceStore = create<DiceState>((set, get) => ({
  groups: DEFAULT_GROUPS,
  modifier: 0,
  notation: "1d6",
  mode: "normal",
  isRolling: false,
  currentResult: null,

  setGroups: (groups) =>
    set({
      groups,
      notation: computeNotation(groups, get().modifier),
      currentResult: null,
    }),

  addGroup: (type = "d6") =>
    set((state) => {
      const groups = [...state.groups, { id: generateId(), type, count: 1 }]
      return {
        groups,
        notation: computeNotation(groups, state.modifier),
        currentResult: null,
      }
    }),

  removeGroup: (id) =>
    set((state) => {
      const groups = state.groups.filter((g) => g.id !== id)
      const safe = groups.length > 0 ? groups : DEFAULT_GROUPS
      return {
        groups: safe,
        notation: computeNotation(safe, state.modifier),
        currentResult: null,
      }
    }),

  updateGroupType: (id, type) =>
    set((state) => {
      const groups = state.groups.map((g) => (g.id === id ? { ...g, type } : g))
      return {
        groups,
        notation: computeNotation(groups, state.modifier),
        currentResult: null,
      }
    }),

  updateGroupCount: (id, count) =>
    set((state) => {
      const groups = state.groups.map((g) =>
        g.id === id ? { ...g, count: clampCount(count) } : g,
      )
      return {
        groups,
        notation: computeNotation(groups, state.modifier),
        currentResult: null,
      }
    }),

  setModifier: (modifier) =>
    set((state) => ({
      modifier,
      notation: computeNotation(state.groups, modifier),
      currentResult: null,
    })),

  setNotation: (notation) => set({ notation }),
  setMode: (mode) => set({ mode, currentResult: null }),
  setIsRolling: (isRolling) => set({ isRolling }),
  setCurrentResult: (currentResult) => set({ currentResult }),
  reset: () =>
    set({
      groups: DEFAULT_GROUPS,
      modifier: 0,
      notation: "1d6",
      mode: "normal",
      isRolling: false,
      currentResult: null,
    }),
}))
