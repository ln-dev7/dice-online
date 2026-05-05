"use client"

import { motion } from "framer-motion"
import type { DiceType } from "@/types/dice"
import { cn } from "@/lib/utils"
import {
  useSettingsStore,
  type DiceColor,
  type DiceMaterial,
} from "@/store/settingsStore"

const COLOR_HEX: Record<DiceColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
  gold: "#f59e0b",
  silver: "#94a3b8",
  black: "#1e1b4b",
  white: "#f8fafc",
  "neon-pink": "#ec4899",
  "neon-cyan": "#06b6d4",
}

// Couleur du texte adaptée pour le contraste
const TEXT_HEX: Record<DiceColor, string> = {
  red: "#fff",
  blue: "#fff",
  green: "#fff",
  purple: "#fff",
  gold: "#1f1300",
  silver: "#0f172a",
  black: "#fff",
  white: "#0f172a",
  "neon-pink": "#fff",
  "neon-cyan": "#0c1e2c",
}

const SHAPE_CLASSES: Record<DiceType, string> = {
  d2: "rounded-full",
  d3: "rounded-md [clip-path:polygon(50%_0,100%_100%,0_100%)]",
  d4: "[clip-path:polygon(50%_0,100%_100%,0_100%)]",
  d6: "rounded-xl",
  d8: "rotate-45 rounded-md",
  d10: "[clip-path:polygon(50%_0,100%_38%,82%_100%,18%_100%,0_38%)]",
  d12: "[clip-path:polygon(50%_0,90%_30%,90%_70%,50%_100%,10%_70%,10%_30%)]",
  d20: "[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]",
  d100: "rounded-full",
}

// Lighten/darken un hex (ratio = -1..1)
function shade(hex: string, ratio: number): string {
  const m = hex.replace("#", "")
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  const t = ratio < 0 ? 0 : 255
  const p = Math.abs(ratio)
  const mix = (c: number) => Math.round(c + (t - c) * p)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

// Calcule le style de fond et les effets en fonction du matériau choisi.
function materialStyle(
  material: DiceMaterial,
  color: DiceColor,
): { background: string; boxShadow?: string; opacity?: number; filter?: string } {
  const base = COLOR_HEX[color]
  const light = shade(base, 0.35)
  const dark = shade(base, -0.45)

  switch (material) {
    case "metal":
      return {
        background: `linear-gradient(135deg, ${light} 0%, ${base} 35%, #ffffff 50%, ${base} 65%, ${dark} 100%)`,
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)",
      }
    case "gem":
      return {
        background: `linear-gradient(135deg, ${light}cc 0%, ${base}aa 50%, ${dark}cc 100%)`,
        boxShadow:
          "inset 0 0 20px rgba(255,255,255,0.3), inset 0 2px 8px rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.3)",
        opacity: 0.85,
      }
    case "wood":
      return {
        background: `repeating-linear-gradient(95deg, #92400e 0px, #78350f 6px, #92400e 12px, #b45309 18px), linear-gradient(135deg, #92400e, #451a03)`,
        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.4)",
      }
    case "marble":
      return {
        background: `radial-gradient(ellipse at 30% 30%, #ffffff 0%, transparent 40%), radial-gradient(ellipse at 70% 70%, ${light} 0%, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #cbd5e1 60%, #94a3b8 100%)`,
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.3)",
      }
    case "holographic":
      return {
        background: `linear-gradient(135deg, #ec4899 0%, #8b5cf6 25%, #06b6d4 50%, #10b981 75%, #f59e0b 100%)`,
        boxShadow:
          "inset 0 0 20px rgba(255,255,255,0.4), 0 4px 16px rgba(139,92,246,0.5)",
      }
    case "neon":
      return {
        background: `radial-gradient(circle at 50% 50%, ${light} 0%, ${base} 50%, ${dark} 100%)`,
        boxShadow: `0 0 20px ${base}, 0 0 40px ${base}aa, inset 0 0 12px ${light}`,
        filter: "saturate(1.4) brightness(1.1)",
      }
    case "plastic":
    default:
      return {
        background: `linear-gradient(135deg, ${light} 0%, ${base} 50%, ${dark} 100%)`,
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.25)",
      }
  }
}

interface Dice2DProps {
  type: DiceType
  spinning: boolean
  value?: number
  className?: string
  size?: number
}

export function Dice2D({ type, spinning, value, className, size = 80 }: Dice2DProps) {
  const color = useSettingsStore((s) => s.diceColor)
  const material = useSettingsStore((s) => s.diceMaterial)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  const display = value !== undefined ? value : type.toUpperCase()
  const fontSize = size * 0.42
  const matStyle = materialStyle(material, color)
  // Pour matériaux sombres on garde le texte clair, et inversement pour les clairs.
  const textColor =
    material === "marble" || material === "holographic"
      ? "#0f172a"
      : TEXT_HEX[color]

  return (
    <motion.div
      animate={
        spinning && !reducedMotion
          ? { rotate: [0, 720, 1080], scale: [1, 1.15, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center ring-1 ring-white/15",
        SHAPE_CLASSES[type],
        className,
      )}
      style={{
        width: size,
        height: size,
        background: matStyle.background,
        boxShadow: matStyle.boxShadow,
        opacity: matStyle.opacity,
        filter: matStyle.filter,
        color: textColor,
      }}
      aria-label={`${type} ${value ?? ""}`}
      role="img"
    >
      {/* Pendant la rotation on cache la face — comme un vrai dé en l'air */}
      {!spinning && (
        <span
          className={cn(
            "pointer-events-none font-mono font-bold tabular-nums leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]",
            // Les triangles (d3, d4) ont leur centre visuel sous le centre
            // géométrique : on descend le texte d'environ un sixième.
            (type === "d3" || type === "d4") && "translate-y-[15%]",
            // Le kite du d10 a sa partie large au-dessus du milieu
            type === "d10" && "translate-y-[-6%]",
            // d8 est rendu en rotate-45, donc on contre-rotate le texte
            type === "d8" && "-rotate-45",
          )}
          style={{ fontSize }}
        >
          {display}
        </span>
      )}
    </motion.div>
  )
}
