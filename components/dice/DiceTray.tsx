"use client"

import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Dice2D } from "@/components/dice/Dice2D"
import { useDiceStore } from "@/store/diceStore"
import { useSettingsStore, type DiceTrayBackground } from "@/store/settingsStore"
import { cn } from "@/lib/utils"
import { DICE_FACES, type DiceType } from "@/types/dice"

// Three.js bundle est lourd → lazy-load côté client
const Dice3D = dynamic(
  () => import("@/components/dice/Dice3D").then((m) => m.Dice3D),
  { ssr: false, loading: () => <div className="size-full" /> },
)

// On garde le 3D activé jusqu'à 9 d6 (3×3 grille). Au-delà, la lecture des
// numéros devient pénible et le rendu plus coûteux → on retombe en 2D.
const MAX_3D_DICE = 9

// Backgrounds en CSS direct (Tailwind v4 ne combine pas toujours bien
// `bg-[radial-gradient(...)]` avec les utilitaires `from-*/via-*/to-*`).
const TRAY_BG_STYLE: Record<DiceTrayBackground, React.CSSProperties> = {
  felt: {
    background:
      "radial-gradient(ellipse at center, #047857 0%, #064e3b 60%, #022c22 100%)",
  },
  wood: {
    background:
      "radial-gradient(ellipse at center, #b45309 0%, #78350f 55%, #451a03 100%), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 8px, transparent 8px 16px)",
    backgroundBlendMode: "multiply",
  },
  stone: {
    background:
      "radial-gradient(ellipse at center, #64748b 0%, #334155 60%, #0f172a 100%)",
  },
  space: {
    background:
      "radial-gradient(ellipse at 30% 30%, #6366f1 0%, transparent 40%), radial-gradient(ellipse at 70% 60%, #c026d3 0%, transparent 40%), radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)",
  },
  transparent: { background: "transparent" },
}

const MAX_VISIBLE_DICE = 12

interface DieView {
  type: DiceType
  value: number
  kept: boolean
}

function buildDiceView(
  isRolling: boolean,
  result: ReturnType<typeof useDiceStore.getState>["currentResult"],
  groups: ReturnType<typeof useDiceStore.getState>["groups"],
): DieView[] {
  if (result && !isRolling) {
    return result.details.map((d) => ({
      type: d.type,
      value: d.value,
      kept: d.kept,
    }))
  }
  // Aplati les groupes de la preview en une liste de dés (un par dé à lancer)
  return groups.flatMap((g) =>
    Array.from({ length: g.count }, () => ({
      type: g.type,
      value: DICE_FACES[g.type],
      kept: true,
    })),
  )
}

interface DiceTrayProps {
  className?: string
}

export function DiceTray({ className }: DiceTrayProps) {
  const isRolling = useDiceStore((s) => s.isRolling)
  const result = useDiceStore((s) => s.currentResult)
  const groups = useDiceStore((s) => s.groups)
  const trayBg = useSettingsStore((s) => s.trayBackground)
  const use3D = useSettingsStore((s) => s.use3D)
  const t = useTranslations("dice")

  const dice = buildDiceView(isRolling, result, groups)
  const visible = dice.slice(0, MAX_VISIBLE_DICE)
  const overflow = Math.max(0, dice.length - MAX_VISIBLE_DICE)

  // 3D activé uniquement si tous les dés visibles sont des d6 (le seul
  // type avec un rendu 3D satisfaisant : cube + textures de face).
  // Plafonné à MAX_3D_DICE pour la lisibilité.
  const all3D =
    use3D &&
    visible.length > 0 &&
    visible.length <= MAX_3D_DICE &&
    visible.every((d) => d.type === "d6")
  const dieSize = visible.length <= 1 ? 220 : visible.length <= 4 ? 100 : 72

  return (
    <div
      className={cn(
        "relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden rounded-2xl border shadow-inner",
        className,
      )}
      style={TRAY_BG_STYLE[trayBg]}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          result?.isCritical &&
            "bg-emerald-400/20 shadow-[inset_0_0_120px_rgba(16,185,129,0.4)]",
          result?.isFumble &&
            "bg-red-500/20 shadow-[inset_0_0_120px_rgba(239,68,68,0.4)]",
        )}
      />

      {all3D ? (
        <div className="relative size-full p-6">
          <Dice3D
            dice={visible.map((d) => ({
              type: d.type,
              value: result && !isRolling ? d.value : undefined,
            }))}
            spinning={isRolling}
          />
        </div>
      ) : (
        <div className="relative flex flex-wrap items-center justify-center gap-3 px-6 py-6">
          <AnimatePresence mode="popLayout">
            {visible.map((d, i) => (
              <motion.div
                key={`${d.type}-${i}-${result?.id ?? "preview"}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: d.kept ? 1 : 0.35, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Dice2D
                  type={d.type}
                  value={d.value}
                  spinning={isRolling}
                  size={dieSize}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {overflow > 0 && (
            <div
              className="flex items-center justify-center rounded-md border border-white/30 bg-black/30 px-3 py-2 font-mono text-sm font-medium text-white backdrop-blur"
              style={{ height: dieSize, minWidth: dieSize / 2 }}
            >
              +{overflow} more
            </div>
          )}
        </div>
      )}

      {/* Total flottant + valeurs détaillées en haut quand multi-dés */}
      <AnimatePresence>
        {result && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-3 right-3 max-w-[60%] rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 text-right backdrop-blur"
          >
            {result.details.length > 1 && (
              <div className="font-mono text-[10px] uppercase tracking-wide text-white/60">
                {result.details
                  .filter((d) => d.kept)
                  .map((d) => d.value)
                  .join(" + ")}
                {result.modifier !== 0 &&
                  ` ${result.modifier > 0 ? "+" : ""}${result.modifier}`}
              </div>
            )}
            <div className="flex items-baseline justify-end gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-white/60">
                {t("total")}
              </span>
              <span className="font-mono text-2xl font-bold text-white tabular-nums">
                {result.total}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
