import { describe, expect, it } from "vitest"
import { executeRoll, roll, rollDie } from "@/lib/diceRoller"
import { parseNotation } from "@/lib/diceParser"

describe("rollDie", () => {
  it("returns values within [1, faces]", () => {
    for (let i = 0; i < 200; i++) {
      const v = rollDie(20)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(20)
    }
  })
})

describe("executeRoll", () => {
  it("rolls 1d20 and produces a valid result", () => {
    const r = executeRoll(parseNotation("1d20"))
    expect(r.details).toHaveLength(1)
    expect(r.total).toBeGreaterThanOrEqual(1)
    expect(r.total).toBeLessThanOrEqual(20)
  })

  it("applies modifier", () => {
    const r = executeRoll(parseNotation("1d6+10"))
    expect(r.total).toBeGreaterThanOrEqual(11)
    expect(r.total).toBeLessThanOrEqual(16)
  })

  it("keeps only the requested dice on kh", () => {
    const r = executeRoll(parseNotation("4d6kh3"))
    expect(r.details).toHaveLength(4)
    const kept = r.details.filter((d) => d.kept)
    expect(kept).toHaveLength(3)
    const dropped = r.details.filter((d) => !d.kept)
    expect(dropped).toHaveLength(1)
    // Le total ne doit jamais inclure le dé droppé
    const keptSum = kept.reduce((s, d) => s + d.value, 0)
    expect(r.total).toBe(keptSum)
  })

  it("drops the lowest on dl1", () => {
    const r = executeRoll(parseNotation("4d6dl1"))
    expect(r.details.filter((d) => d.kept)).toHaveLength(3)
  })

  it("advantage rolls 2d20 and keeps highest", () => {
    const r = executeRoll(parseNotation("1d20"), { mode: "advantage" })
    expect(r.details).toHaveLength(2)
    expect(r.details.filter((d) => d.kept)).toHaveLength(1)
    const kept = r.details.find((d) => d.kept)!
    const dropped = r.details.find((d) => !d.kept)!
    expect(kept.value).toBeGreaterThanOrEqual(dropped.value)
  })

  it("disadvantage keeps the lowest", () => {
    const r = executeRoll(parseNotation("1d20"), { mode: "disadvantage" })
    const kept = r.details.find((d) => d.kept)!
    const dropped = r.details.find((d) => !d.kept)!
    expect(kept.value).toBeLessThanOrEqual(dropped.value)
  })

  it("detects critical on a natural 20", () => {
    // On force un cas en lançant beaucoup de fois jusqu'à voir un crit
    let sawCrit = false
    for (let i = 0; i < 500; i++) {
      const r = executeRoll(parseNotation("1d20"))
      if (r.isCritical) {
        sawCrit = true
        const d = r.details.find((d) => d.kept)!
        expect(d.value).toBe(20)
        break
      }
    }
    expect(sawCrit).toBe(true)
  })

  it("roll() helper accepts string", () => {
    const r = roll("2d6+1")
    expect(r.notation).toBe("2d6+1")
    expect(r.total).toBeGreaterThanOrEqual(3)
    expect(r.total).toBeLessThanOrEqual(13)
  })
})
