export type GameSystemId =
  | "dnd5e"
  | "pathfinder"
  | "coc"
  | "warhammer"
  | "savage"
  | "custom"

export interface QuickRoll {
  label: string
  notation: string
  description?: string
}

export interface GameSystem {
  id: GameSystemId
  name: string
  description: string
  quickRolls: QuickRoll[]
  detectsCriticalOn?: number
  detectsFumbleOn?: number
}
