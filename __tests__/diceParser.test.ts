import { describe, expect, it } from "vitest"
import { NotationError, parseNotation, stringifyNotation } from "@/lib/diceParser"

describe("parseNotation", () => {
  it("parses a simple roll", () => {
    const r = parseNotation("1d20")
    expect(r.groups).toEqual([{ count: 1, type: "d20" }])
    expect(r.modifier).toBe(0)
  })

  it("parses a roll with positive modifier", () => {
    const r = parseNotation("2d6+3")
    expect(r.groups).toHaveLength(1)
    expect(r.groups[0]).toEqual({ count: 2, type: "d6" })
    expect(r.modifier).toBe(3)
  })

  it("parses a roll with negative modifier", () => {
    const r = parseNotation("1d8-2")
    expect(r.modifier).toBe(-2)
  })

  it("parses keep highest", () => {
    const r = parseNotation("4d6kh3")
    expect(r.groups[0]).toEqual({
      count: 4,
      type: "d6",
      keep: { kind: "kh", n: 3 },
    })
  })

  it("parses drop lowest", () => {
    const r = parseNotation("4d6dl1")
    expect(r.groups[0]?.keep).toEqual({ kind: "dl", n: 1 })
  })

  it("parses exploding dice", () => {
    const r = parseNotation("1d6!")
    expect(r.groups[0]?.exploding).toBe(true)
  })

  it("parses reroll on 1", () => {
    const r = parseNotation("1d8r1")
    expect(r.groups[0]?.rerollOnes).toBe(true)
  })

  it("parses combinations", () => {
    const r = parseNotation("2d6+1d8+5")
    expect(r.groups).toHaveLength(2)
    expect(r.modifier).toBe(5)
  })

  it("ignores whitespace and case", () => {
    const r = parseNotation(" 2D6 + 3 ")
    expect(r.groups[0]).toEqual({ count: 2, type: "d6" })
    expect(r.modifier).toBe(3)
  })

  it("rejects unsupported dice faces", () => {
    expect(() => parseNotation("1d7")).toThrow(NotationError)
  })

  it("rejects empty input", () => {
    expect(() => parseNotation("")).toThrow(NotationError)
  })

  it("rejects keep value larger than count", () => {
    expect(() => parseNotation("2d6kh3")).toThrow(NotationError)
  })

  it("stringifies back canonical form", () => {
    const r = parseNotation("4d6kh3+2")
    expect(stringifyNotation(r)).toBe("4d6kh3+2")
  })
})
