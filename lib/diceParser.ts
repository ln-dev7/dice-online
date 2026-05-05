import type { DiceGroup, DiceType, ParsedNotation } from "@/types/dice"
import { DICE_FACES } from "@/types/dice"

const VALID_FACES = new Set(Object.values(DICE_FACES))

export class NotationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotationError"
  }
}

// Parse une notation type "2d6+3", "4d6kh3", "1d20!", "4d6dl1+2"
// Format général : <count>d<faces>[k(h|l)N|d(h|l)N][!] (+|-) <count>d<faces>... (+|-) <modifier>
export function parseNotation(input: string): ParsedNotation {
  const raw = input.trim()
  if (!raw) {
    throw new NotationError("Notation vide")
  }

  // Normalisation : enlève les espaces internes
  const cleaned = raw.replace(/\s+/g, "").toLowerCase()

  // Découpe en tokens en gardant les opérateurs +/-
  const tokens = cleaned.split(/(?=[+-])/g)
  const groups: DiceGroup[] = []
  let modifier = 0

  for (const token of tokens) {
    const sign = token.startsWith("-") ? -1 : 1
    const body = token.replace(/^[+-]/, "")
    if (!body) continue

    if (body.includes("d")) {
      const group = parseDiceGroup(body)
      if (sign === -1) {
        // Un groupe négatif n'a pas de sens en notation classique — on traite comme erreur
        throw new NotationError(`Groupe de dés négatif non supporté : ${token}`)
      }
      groups.push(group)
    } else {
      const num = Number.parseInt(body, 10)
      if (Number.isNaN(num)) {
        throw new NotationError(`Token invalide : ${token}`)
      }
      modifier += sign * num
    }
  }

  if (groups.length === 0) {
    throw new NotationError("Aucun groupe de dés trouvé")
  }

  return { groups, modifier, raw }
}

function parseDiceGroup(body: string): DiceGroup {
  // Patterns acceptés :
  //   <count>d<faces>
  //   <count>d<faces>kh<n> | kl<n> | dh<n> | dl<n>
  //   <count>d<faces>! (exploding)
  //   <count>d<faces>r1 (reroll on 1)
  const match = body.match(
    /^(\d*)d(\d+)(kh|kl|dh|dl)?(\d+)?(!)?(r1)?$/i,
  )
  if (!match) {
    throw new NotationError(`Groupe de dés invalide : ${body}`)
  }

  const [, countStr, facesStr, keepKind, keepNStr, bang, rOne] = match
  const count = countStr ? Number.parseInt(countStr, 10) : 1
  const faces = Number.parseInt(facesStr, 10)

  if (count <= 0 || count > 100) {
    throw new NotationError("Le nombre de dés doit être entre 1 et 100")
  }
  if (!VALID_FACES.has(faces)) {
    throw new NotationError(
      `Type de dé non supporté : d${faces}. Faces valides : ${[...VALID_FACES].join(", ")}`,
    )
  }

  const type = `d${faces}` as DiceType

  const group: DiceGroup = { count, type }

  if (keepKind && keepNStr) {
    const n = Number.parseInt(keepNStr, 10)
    if (n <= 0 || n > count) {
      throw new NotationError(
        `Le nombre à garder/retirer (${n}) doit être entre 1 et ${count}`,
      )
    }
    group.keep = { kind: keepKind.toLowerCase() as "kh" | "kl" | "dh" | "dl", n }
  }

  if (bang) group.exploding = true
  if (rOne) group.rerollOnes = true

  return group
}

// Reformate une notation parsée en string canonique
export function stringifyNotation(parsed: ParsedNotation): string {
  const parts: string[] = []
  for (const g of parsed.groups) {
    let s = `${g.count}${g.type}`
    if (g.keep) s += `${g.keep.kind}${g.keep.n}`
    if (g.exploding) s += "!"
    if (g.rerollOnes) s += "r1"
    parts.push(s)
  }
  let result = parts.join("+")
  if (parsed.modifier > 0) result += `+${parsed.modifier}`
  if (parsed.modifier < 0) result += `${parsed.modifier}`
  return result
}
