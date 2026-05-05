"use client"

import { motion } from "framer-motion"
import type { DiceType } from "@/types/dice"
import { cn } from "@/lib/utils"
import { useSettingsStore, type DiceColor } from "@/store/settingsStore"

const COLOR_CLASSES: Record<DiceColor, string> = {
  red: "from-red-400 to-red-700",
  blue: "from-blue-400 to-blue-700",
  green: "from-emerald-400 to-emerald-700",
  purple: "from-violet-400 to-violet-800",
  gold: "from-amber-300 to-amber-600",
  silver: "from-slate-200 to-slate-500",
  black: "from-slate-700 to-slate-950",
  white: "from-slate-50 to-slate-200 text-slate-800",
  "neon-pink": "from-pink-300 to-fuchsia-600",
  "neon-cyan": "from-cyan-300 to-sky-600",
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

interface Dice2DProps {
  type: DiceType
  spinning: boolean
  value?: number
  className?: string
  size?: number
}

// Affichage 2D d'un dé avec son numéro sur la face visible.
// Utilisé pour la preview (avec valeur = max face) et pour l'affichage des résultats.
export function Dice2D({ type, spinning, value, className, size = 80 }: Dice2DProps) {
  const color = useSettingsStore((s) => s.diceColor)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  const display = value !== undefined ? value : type.toUpperCase()
  const fontSize = size * 0.42

  return (
    <motion.div
      animate={
        spinning && !reducedMotion
          ? { rotate: [0, 720, 1080], scale: [1, 1.15, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center bg-gradient-to-br text-white shadow-xl",
        "ring-1 ring-white/20",
        SHAPE_CLASSES[type],
        COLOR_CLASSES[color],
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={`${type} ${value ?? ""}`}
      role="img"
    >
      <span
        className={cn(
          "pointer-events-none font-mono font-bold tabular-nums leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
          // Le texte d'un d4 doit être rapproché de la base du triangle
          type === "d4" && "translate-y-[15%]",
          // Pour le d8 (qui est en rotate-45) on contre-rotate le texte
          type === "d8" && "-rotate-45",
        )}
        style={{ fontSize }}
      >
        {display}
      </span>
    </motion.div>
  )
}
