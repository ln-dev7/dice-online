import type { RollResult } from "@/types/dice"

export type HistoryFilter = "all" | "today" | "week" | "crits" | "fumbles"

const ONE_DAY = 86400000

// Filtre l'historique des lancers selon une catégorie.
// Pure : encapsule l'appel à Date.now() hors du rendu React (lint-friendly).
export function filterRolls(rolls: RollResult[], filter: HistoryFilter): RollResult[] {
  const now = Date.now()
  return rolls.filter((r) => {
    if (filter === "today") return now - r.timestamp < ONE_DAY
    if (filter === "week") return now - r.timestamp < ONE_DAY * 7
    if (filter === "crits") return r.isCritical === true
    if (filter === "fumbles") return r.isFumble === true
    return true
  })
}
