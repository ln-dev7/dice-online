import { describe, expect, it } from "vitest"
import { summarize, distributionByType, averagesByType } from "@/lib/statistics"
import type { RollResult } from "@/types/dice"

function mockRoll(total: number, options: Partial<RollResult> = {}): RollResult {
  return {
    id: Math.random().toString(36).slice(2),
    notation: "1d20",
    details: [{ type: "d20", value: total, kept: true }],
    groupTotals: [total],
    modifier: 0,
    total,
    timestamp: Date.now(),
    mode: "normal",
    isCritical: total === 20,
    isFumble: total === 1,
    ...options,
  }
}

describe("summarize", () => {
  it("returns zeros for empty history", () => {
    const s = summarize([])
    expect(s.totalRolls).toBe(0)
    expect(s.averageTotal).toBe(0)
  })

  it("computes basic averages", () => {
    const rolls = [mockRoll(5), mockRoll(10), mockRoll(15)]
    const s = summarize(rolls)
    expect(s.totalRolls).toBe(3)
    expect(s.averageTotal).toBe(10)
    expect(s.highestRoll).toBe(15)
    expect(s.lowestRoll).toBe(5)
  })

  it("counts critical and fumble rates", () => {
    const rolls = [mockRoll(20), mockRoll(20), mockRoll(1), mockRoll(10)]
    const s = summarize(rolls)
    expect(s.criticalCount).toBe(2)
    expect(s.fumbleCount).toBe(1)
    expect(s.criticalRate).toBeCloseTo(0.5, 5)
  })
})

describe("distributionByType", () => {
  it("counts kept values per face", () => {
    const rolls = [mockRoll(5), mockRoll(5), mockRoll(20)]
    const dist = distributionByType(rolls, "d20")
    expect(dist).toHaveLength(20)
    expect(dist[4]).toEqual({ value: 5, count: 2 })
    expect(dist[19]).toEqual({ value: 20, count: 1 })
  })
})

describe("averagesByType", () => {
  it("returns theoretical average for d20 = 10.5", () => {
    const data = averagesByType([])
    const d20 = data.find((d) => d.type === "d20")!
    expect(d20.theoretical).toBe(10.5)
  })
})
