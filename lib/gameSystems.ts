import type { GameSystem, GameSystemId } from "@/types/gameSystem"

export const GAME_SYSTEMS: Record<GameSystemId, GameSystem> = {
  dnd5e: {
    id: "dnd5e",
    name: "D&D 5e",
    description: "Dungeons & Dragons 5e — d20 system",
    detectsCriticalOn: 20,
    detectsFumbleOn: 1,
    quickRolls: [
      { label: "Attaque", notation: "1d20", description: "Jet d'attaque de base" },
      { label: "Avantage", notation: "2d20kh1", description: "Garde le plus haut" },
      { label: "Désavantage", notation: "2d20kl1", description: "Garde le plus bas" },
      { label: "Sauvegarde", notation: "1d20" },
      { label: "Compétence", notation: "1d20" },
      { label: "Stats (4d6dl1)", notation: "4d6dl1", description: "Génération de stat" },
      { label: "Initiative", notation: "1d20" },
      { label: "Coup critique 1d8", notation: "2d8" },
      { label: "Boule de feu", notation: "8d6" },
    ],
  },
  pathfinder: {
    id: "pathfinder",
    name: "Pathfinder",
    description: "Pathfinder 2e — degrés de succès",
    detectsCriticalOn: 20,
    detectsFumbleOn: 1,
    quickRolls: [
      { label: "Attaque", notation: "1d20" },
      { label: "Sauvegarde", notation: "1d20" },
      { label: "Dégâts d8", notation: "1d8" },
      { label: "Dégâts d10", notation: "1d10" },
    ],
  },
  coc: {
    id: "coc",
    name: "Call of Cthulhu",
    description: "Call of Cthulhu 7e — d100 percentile",
    quickRolls: [
      { label: "Test régulier", notation: "1d100" },
      { label: "Test difficile", notation: "1d100" },
      { label: "Test extrême", notation: "1d100" },
      { label: "Sanity", notation: "1d100" },
      { label: "Dégâts couteau", notation: "1d4" },
      { label: "Dégâts revolver", notation: "1d10" },
    ],
  },
  warhammer: {
    id: "warhammer",
    name: "Warhammer 40k / AoS",
    description: "Pool de d6 avec seuils de réussite",
    quickRolls: [
      { label: "5 attaques", notation: "5d6" },
      { label: "10 attaques", notation: "10d6" },
      { label: "20 attaques", notation: "20d6" },
      { label: "Test commandement 2d6", notation: "2d6" },
    ],
  },
  savage: {
    id: "savage",
    name: "Savage Worlds",
    description: "Exploding dice — Aces!",
    quickRolls: [
      { label: "d4 explosif", notation: "1d4!" },
      { label: "d6 explosif", notation: "1d6!" },
      { label: "d8 explosif", notation: "1d8!" },
      { label: "d10 explosif", notation: "1d10!" },
      { label: "d12 explosif", notation: "1d12!" },
      { label: "Wild die", notation: "1d6!" },
    ],
  },
  custom: {
    id: "custom",
    name: "Custom",
    description: "Notation libre — toutes les combinaisons",
    quickRolls: [
      { label: "1d20", notation: "1d20" },
      { label: "2d6+3", notation: "2d6+3" },
      { label: "4d6kh3", notation: "4d6kh3" },
      { label: "1d100", notation: "1d100" },
    ],
  },
}

// Pathfinder degree-of-success calculation (vs DD)
export type DegreeOfSuccess =
  | "critical-success"
  | "success"
  | "failure"
  | "critical-failure"

export function pathfinderDegree(roll: number, dc: number): DegreeOfSuccess {
  const diff = roll - dc
  if (diff >= 10) return "critical-success"
  if (diff >= 0) return "success"
  if (diff <= -10) return "critical-failure"
  return "failure"
}

// CoC : régulier / difficile / extrême sur d100 vs skill
export type CocResult =
  | "extreme-success"
  | "hard-success"
  | "regular-success"
  | "failure"
  | "fumble"

export function cocResult(roll: number, skill: number): CocResult {
  if (roll === 100 || (skill < 50 && roll >= 96)) return "fumble"
  if (roll <= Math.floor(skill / 5)) return "extreme-success"
  if (roll <= Math.floor(skill / 2)) return "hard-success"
  if (roll <= skill) return "regular-success"
  return "failure"
}
