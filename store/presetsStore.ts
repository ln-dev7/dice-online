import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Preset } from "@/types/preset"

export interface PresetsState {
  presets: Preset[]
  addPreset: (preset: Omit<Preset, "id" | "createdAt" | "order">) => void
  updatePreset: (id: string, patch: Partial<Preset>) => void
  removePreset: (id: string) => void
  reorderPresets: (ids: string[]) => void
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const usePresetsStore = create<PresetsState>()(
  persist(
    (set) => ({
      presets: [],
      addPreset: (preset) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              ...preset,
              id: generateId(),
              createdAt: Date.now(),
              order: state.presets.length,
            },
          ],
        })),
      updatePreset: (id, patch) =>
        set((state) => ({
          presets: state.presets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePreset: (id) =>
        set((state) => ({ presets: state.presets.filter((p) => p.id !== id) })),
      reorderPresets: (ids) =>
        set((state) => ({
          presets: ids
            .map((id, i) => {
              const preset = state.presets.find((p) => p.id === id)
              return preset ? { ...preset, order: i } : null
            })
            .filter((p): p is Preset => p !== null),
        })),
    }),
    { name: "dice-online:presets" },
  ),
)
