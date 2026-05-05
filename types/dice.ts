export type DiceType = "d2" | "d3" | "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100"

export const DICE_TYPES: DiceType[] = [
  "d2",
  "d3",
  "d4",
  "d6",
  "d8",
  "d10",
  "d12",
  "d20",
  "d100",
]

export const DICE_FACES: Record<DiceType, number> = {
  d2: 2,
  d3: 3,
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
}

export type RollMode =
  | "normal"
  | "advantage"
  | "disadvantage"
  | "exploding"
  | "reroll-ones"

export interface DiceGroup {
  count: number
  type: DiceType
  keep?: { kind: "kh" | "kl" | "dh" | "dl"; n: number }
  exploding?: boolean
  rerollOnes?: boolean
}

export interface ParsedNotation {
  groups: DiceGroup[]
  modifier: number
  raw: string
}

export interface DieRollDetail {
  type: DiceType
  value: number
  kept: boolean
  exploded?: boolean
  rerolled?: boolean
}

export interface RollResult {
  id: string
  notation: string
  details: DieRollDetail[]
  groupTotals: number[]
  modifier: number
  total: number
  timestamp: number
  mode: RollMode
  isCritical?: boolean
  isFumble?: boolean
  player?: string
  label?: string
}
