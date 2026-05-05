import type { DiceType, RollResult } from "@/types/dice"
import { DICE_FACES, DICE_TYPES } from "@/types/dice"

export interface StatsSummary {
  totalRolls: number
  totalDice: number
  averageTotal: number
  criticalCount: number
  criticalRate: number
  fumbleCount: number
  fumbleRate: number
  highestRoll: number
  lowestRoll: number
  longestCritStreak: number
}

export function summarize(rolls: RollResult[]): StatsSummary {
  if (rolls.length === 0) {
    return {
      totalRolls: 0,
      totalDice: 0,
      averageTotal: 0,
      criticalCount: 0,
      criticalRate: 0,
      fumbleCount: 0,
      fumbleRate: 0,
      highestRoll: 0,
      lowestRoll: 0,
      longestCritStreak: 0,
    }
  }

  const totalDice = rolls.reduce((sum, r) => sum + r.details.length, 0)
  const sum = rolls.reduce((s, r) => s + r.total, 0)
  const criticalCount = rolls.filter((r) => r.isCritical).length
  const fumbleCount = rolls.filter((r) => r.isFumble).length

  let highest = -Infinity
  let lowest = Infinity
  for (const r of rolls) {
    if (r.total > highest) highest = r.total
    if (r.total < lowest) lowest = r.total
  }

  // Plus longue série de critiques consécutifs (chronologique)
  const sorted = [...rolls].sort((a, b) => a.timestamp - b.timestamp)
  let streak = 0
  let longest = 0
  for (const r of sorted) {
    if (r.isCritical) {
      streak++
      if (streak > longest) longest = streak
    } else {
      streak = 0
    }
  }

  return {
    totalRolls: rolls.length,
    totalDice,
    averageTotal: sum / rolls.length,
    criticalCount,
    criticalRate: criticalCount / rolls.length,
    fumbleCount,
    fumbleRate: fumbleCount / rolls.length,
    highestRoll: highest,
    lowestRoll: lowest,
    longestCritStreak: longest,
  }
}

// Distribution des valeurs par type de dé (pour graphiques)
export function distributionByType(
  rolls: RollResult[],
  type: DiceType,
): { value: number; count: number }[] {
  const faces = DICE_FACES[type]
  const counts = new Array<number>(faces).fill(0)

  for (const r of rolls) {
    for (const d of r.details) {
      if (d.type === type && d.kept) {
        counts[d.value - 1] = (counts[d.value - 1] ?? 0) + 1
      }
    }
  }

  return counts.map((count, i) => ({ value: i + 1, count }))
}

export interface TypeAverage {
  type: DiceType
  observed: number
  theoretical: number
  count: number
}

export function averagesByType(rolls: RollResult[]): TypeAverage[] {
  return DICE_TYPES.map((type) => {
    const faces = DICE_FACES[type]
    const values: number[] = []
    for (const r of rolls) {
      for (const d of r.details) {
        if (d.type === type && d.kept) values.push(d.value)
      }
    }
    const observed =
      values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length
    const theoretical = (faces + 1) / 2
    return { type, observed, theoretical, count: values.length }
  })
}

// Activité par heure et par jour (heatmap)
export function activityHeatmap(
  rolls: RollResult[],
): { day: number; hour: number; count: number }[] {
  const map = new Map<string, number>()
  for (const r of rolls) {
    const d = new Date(r.timestamp)
    const key = `${d.getDay()}-${d.getHours()}`
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  const out: { day: number; hour: number; count: number }[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`
      out.push({ day, hour, count: map.get(key) ?? 0 })
    }
  }
  return out
}
