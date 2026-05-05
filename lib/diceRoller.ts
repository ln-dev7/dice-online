import type {
  DieRollDetail,
  DiceGroup,
  DiceType,
  ParsedNotation,
  RollMode,
  RollResult,
} from "@/types/dice"
import { DICE_FACES } from "@/types/dice"
import { parseNotation } from "@/lib/diceParser"

// Random crypto-secure dans [1, faces]. Fallback Math.random côté serveur (SSR).
export function rollDie(faces: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Rejection sampling pour éviter le biais modulo.
    const max = Math.floor(0xffffffff / faces) * faces
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= max)
    return (n % faces) + 1
  }
  return Math.floor(Math.random() * faces) + 1
}

const MAX_EXPLOSIONS = 50

function rollGroup(group: DiceGroup): DieRollDetail[] {
  const faces = DICE_FACES[group.type]
  const details: DieRollDetail[] = []

  for (let i = 0; i < group.count; i++) {
    let value = rollDie(faces)
    let rerolled = false

    // Reroll on 1 (une seule fois)
    if (group.rerollOnes && value === 1) {
      value = rollDie(faces)
      rerolled = true
    }

    details.push({ type: group.type, value, kept: true, rerolled })

    // Exploding dice : on relance tant qu'on tombe sur le max
    if (group.exploding && value === faces) {
      let explosions = 0
      let next = value
      while (next === faces && explosions < MAX_EXPLOSIONS) {
        next = rollDie(faces)
        details.push({
          type: group.type,
          value: next,
          kept: true,
          exploded: true,
        })
        explosions++
      }
    }
  }

  // Application du keep/drop
  if (group.keep) {
    applyKeepDrop(details, group)
  }

  return details
}

function applyKeepDrop(details: DieRollDetail[], group: DiceGroup) {
  if (!group.keep) return

  // On ne touche que les dés non-explosés (les explosions s'ajoutent toujours)
  const nonExploded = details.filter((d) => !d.exploded)
  const sorted = [...nonExploded].sort((a, b) => b.value - a.value)
  const { kind, n } = group.keep

  let toDiscard: DieRollDetail[]
  switch (kind) {
    case "kh":
      toDiscard = sorted.slice(n)
      break
    case "kl":
      toDiscard = sorted.slice(0, sorted.length - n)
      break
    case "dh":
      toDiscard = sorted.slice(0, n)
      break
    case "dl":
      toDiscard = sorted.slice(sorted.length - n)
      break
  }

  for (const die of toDiscard) {
    die.kept = false
  }
}

function detectCriticalFumble(
  groups: DiceGroup[],
  details: DieRollDetail[],
): { isCritical: boolean; isFumble: boolean } {
  // On considère critique/fumble seulement quand un d20 unique est lancé (style D&D 5e)
  const hasD20 = groups.some((g) => g.type === "d20")
  if (!hasD20) return { isCritical: false, isFumble: false }

  const d20s = details.filter((d) => d.type === "d20" && d.kept && !d.exploded)
  // Avantage/désavantage : on regarde le dé "kept" (le seul restant)
  if (d20s.length === 0) return { isCritical: false, isFumble: false }

  const isCritical = d20s.some((d) => d.value === 20)
  const isFumble = d20s.some((d) => d.value === 1)
  return { isCritical, isFumble }
}

export interface RollOptions {
  mode?: RollMode
  player?: string
  label?: string
}

// Lance les dés à partir d'une notation parsée
export function executeRoll(
  parsed: ParsedNotation,
  options: RollOptions = {},
): RollResult {
  const mode = options.mode ?? "normal"
  let workingGroups = parsed.groups

  // Avantage / désavantage : transforme un d20 unique en 2d20kh1 / 2d20kl1
  if (mode === "advantage" || mode === "disadvantage") {
    workingGroups = parsed.groups.map((g) => {
      if (g.type === "d20" && g.count === 1 && !g.keep) {
        return {
          ...g,
          count: 2,
          keep: { kind: mode === "advantage" ? "kh" : "kl", n: 1 } as const,
        }
      }
      return g
    })
  }

  const allDetails: DieRollDetail[] = []
  const groupTotals: number[] = []

  for (const group of workingGroups) {
    const details = rollGroup(group)
    allDetails.push(...details)
    const groupTotal = details
      .filter((d) => d.kept)
      .reduce((sum, d) => sum + d.value, 0)
    groupTotals.push(groupTotal)
  }

  const total =
    groupTotals.reduce((sum, t) => sum + t, 0) + parsed.modifier

  const { isCritical, isFumble } = detectCriticalFumble(
    workingGroups,
    allDetails,
  )

  return {
    id: generateId(),
    notation: parsed.raw,
    details: allDetails,
    groupTotals,
    modifier: parsed.modifier,
    total,
    timestamp: Date.now(),
    mode,
    isCritical,
    isFumble,
    player: options.player,
    label: options.label,
  }
}

// Helper pratique : parse + execute en une fois
export function roll(notation: string, options?: RollOptions): RollResult {
  return executeRoll(parseNotation(notation), options)
}

// Helper : lance un seul dé d'un type donné
export function rollSingle(type: DiceType): number {
  return rollDie(DICE_FACES[type])
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
