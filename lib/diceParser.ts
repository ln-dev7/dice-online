import type { DiceGroup, DiceType, ParsedNotation } from "@/types/dice"
import { DICE_FACES } from "@/types/dice"

const VALID_FACES = new Set(Object.values(DICE_FACES))

export type NotationErrorCode =
  | "empty"
  | "invalidToken"
  | "noDice"
  | "invalidGroup"
  | "countOutOfRange"
  | "unsupportedFaces"
  | "keepOutOfRange"
  | "negativeGroup"

export class NotationError extends Error {
  readonly code: NotationErrorCode
  readonly context: Record<string, string | number>

  constructor(
    code: NotationErrorCode,
    message: string,
    context: Record<string, string | number> = {},
  ) {
    super(message)
    this.name = "NotationError"
    this.code = code
    this.context = context
  }
}

const VALID_FACES_LIST = [...VALID_FACES].sort((a, b) => a - b).join(", ")

export function parseNotation(input: string): ParsedNotation {
  const raw = input.trim()
  if (!raw) {
    throw new NotationError("empty", "Empty notation")
  }

  const cleaned = raw.replace(/\s+/g, "").toLowerCase()
  const tokens = cleaned.split(/(?=[+-])/g)
  const groups: DiceGroup[] = []
  let modifier = 0

  for (const token of tokens) {
    const sign = token.startsWith("-") ? -1 : 1
    const body = token.replace(/^[+-]/, "")
    if (!body) continue

    if (body.includes("d")) {
      if (sign === -1) {
        throw new NotationError(
          "negativeGroup",
          `Negative dice group not supported: ${token}`,
          { token },
        )
      }
      const group = parseDiceGroup(body)
      groups.push(group)
    } else {
      const num = Number.parseInt(body, 10)
      if (Number.isNaN(num)) {
        throw new NotationError(
          "invalidToken",
          `Invalid token: ${token}`,
          { token },
        )
      }
      modifier += sign * num
    }
  }

  if (groups.length === 0) {
    throw new NotationError("noDice", "No dice group found")
  }

  return { groups, modifier, raw }
}

function parseDiceGroup(body: string): DiceGroup {
  const match = body.match(/^(\d*)d(\d+)(kh|kl|dh|dl)?(\d+)?(!)?(r1)?$/i)
  if (!match) {
    throw new NotationError(
      "invalidGroup",
      `Invalid dice group: ${body}`,
      { body },
    )
  }

  const [, countStr, facesStr, keepKind, keepNStr, bang, rOne] = match
  const count = countStr ? Number.parseInt(countStr, 10) : 1
  const faces = Number.parseInt(facesStr, 10)

  if (count <= 0 || count > 100) {
    throw new NotationError(
      "countOutOfRange",
      "Dice count must be between 1 and 100",
      { count, max: 100 },
    )
  }
  if (!VALID_FACES.has(faces)) {
    throw new NotationError(
      "unsupportedFaces",
      `Unsupported dice type: d${faces}. Valid faces: ${VALID_FACES_LIST}`,
      { faces, valid: VALID_FACES_LIST },
    )
  }

  const type = `d${faces}` as DiceType
  const group: DiceGroup = { count, type }

  if (keepKind && keepNStr) {
    const n = Number.parseInt(keepNStr, 10)
    if (n <= 0 || n > count) {
      throw new NotationError(
        "keepOutOfRange",
        `Keep/drop count (${n}) must be between 1 and ${count}`,
        { n, max: count },
      )
    }
    group.keep = { kind: keepKind.toLowerCase() as "kh" | "kl" | "dh" | "dl", n }
  }

  if (bang) group.exploding = true
  if (rOne) group.rerollOnes = true

  return group
}

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
