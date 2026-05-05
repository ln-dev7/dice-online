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

const TRAY_BG: Record<DiceTrayBackground, string> = {
  felt: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-700 via-emerald-800 to-emerald-950",
  wood: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-700 via-amber-800 to-amber-950",
  stone:
    "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-500 via-slate-700 to-slate-900",
  space:
    "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-950 to-black",
  transparent: "bg-transparent",
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
  selectedType: DiceType,
  count: number,
): DieView[] {
  if (result && !isRolling) {
    return result.details.map((d) => ({
      type: d.type,
      value: d.value,
      kept: d.kept,
    }))
  }
  const previewValue = DICE_FACES[selectedType]
  return Array.from({ length: count }, () => ({
    type: selectedType,
    value: previewValue,
    kept: true,
  }))
}

interface DiceTrayProps {
  className?: string
}

export function DiceTray({ className }: DiceTrayProps) {
  const isRolling = useDiceStore((s) => s.isRolling)
  const result = useDiceStore((s) => s.currentResult)
  const selectedType = useDiceStore((s) => s.selectedType)
  const count = useDiceStore((s) => s.count)
  const trayBg = useSettingsStore((s) => s.trayBackground)
  const use3D = useSettingsStore((s) => s.use3D)
  const t = useTranslations("dice")

  const dice = buildDiceView(isRolling, result, selectedType, count)
  const visible = dice.slice(0, MAX_VISIBLE_DICE)
  const overflow = Math.max(0, dice.length - MAX_VISIBLE_DICE)

  // Seul le d6 (cube avec textures peintes par face) bénéficie d'un rendu 3D
  // satisfaisant. Tous les autres dés retombent en 2D pour garantir des numéros
  // lisibles sur chaque face.
  const SUPPORTS_3D: Record<DiceType, boolean> = {
    d2: false,
    d3: false,
    d4: false,
    d6: true,
    d8: false,
    d10: false,
    d12: false,
    d20: false,
    d100: false,
  }
  const showSingle3D =
    use3D && visible.length === 1 && SUPPORTS_3D[visible[0]!.type]
  const dieSize = visible.length <= 1 ? 220 : visible.length <= 4 ? 100 : 72

  return (
    <div
      className={cn(
        "relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden rounded-2xl border shadow-inner",
        TRAY_BG[trayBg],
        className,
      )}
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

      {showSingle3D ? (
        <div className="relative size-full p-6">
          <Dice3D
            type={visible[0]!.type}
            spinning={isRolling}
            value={visible[0]!.value}
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
