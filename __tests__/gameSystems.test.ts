import { describe, expect, it } from "vitest"
import { pathfinderDegree, cocResult, GAME_SYSTEMS } from "@/lib/gameSystems"

describe("pathfinderDegree", () => {
  it("gives critical success at +10 over DC", () => {
    expect(pathfinderDegree(25, 15)).toBe("critical-success")
  })
  it("gives success when meeting DC", () => {
    expect(pathfinderDegree(15, 15)).toBe("success")
  })
  it("gives failure when below DC", () => {
    expect(pathfinderDegree(14, 15)).toBe("failure")
  })
  it("gives critical failure at -10 under DC", () => {
    expect(pathfinderDegree(5, 15)).toBe("critical-failure")
  })
})

describe("cocResult", () => {
  it("regular success when roll <= skill", () => {
    expect(cocResult(40, 50)).toBe("regular-success")
  })
  it("hard success when roll <= skill/2", () => {
    expect(cocResult(20, 50)).toBe("hard-success")
  })
  it("extreme success when roll <= skill/5", () => {
    expect(cocResult(5, 50)).toBe("extreme-success")
  })
  it("fumble on 100", () => {
    expect(cocResult(100, 50)).toBe("fumble")
  })
})

describe("GAME_SYSTEMS", () => {
  it("contains the expected systems", () => {
    expect(Object.keys(GAME_SYSTEMS).sort()).toEqual([
      "coc",
      "custom",
      "dnd5e",
      "pathfinder",
      "savage",
      "warhammer",
    ])
  })
  it("each system has at least one quick roll", () => {
    for (const s of Object.values(GAME_SYSTEMS)) {
      expect(s.quickRolls.length).toBeGreaterThan(0)
    }
  })
})
