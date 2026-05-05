"use client"

import { motion } from "framer-motion"
import { Sparkles, Skull, Equal } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDiceStore } from "@/store/diceStore"
import { useSettingsStore } from "@/store/settingsStore"
import { cn } from "@/lib/utils"

export function DiceResult() {
  const result = useDiceStore((s) => s.currentResult)
  const isRolling = useDiceStore((s) => s.isRolling)
  const showDetails = useSettingsStore((s) => s.showDetailedResults)
  const t = useTranslations("dice")

  if (!result || isRolling) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-muted-foreground py-8 text-center text-sm">
          {t("emptyResult")}
        </CardContent>
      </Card>
    )
  }

  const keptDetails = result.details.filter((d) => d.kept)

  return (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "transition-shadow",
          result.isCritical &&
            "border-emerald-500 shadow-emerald-500/30 shadow-lg",
          result.isFumble && "border-red-500 shadow-red-500/30 shadow-lg",
        )}
      >
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <code className="text-muted-foreground font-mono text-sm">
              {result.notation}
            </code>
            <div className="flex items-center gap-1.5">
              {result.isCritical && (
                <Badge variant="success">
                  <Sparkles className="size-3" /> {t("criticalSuccess")}
                </Badge>
              )}
              {result.isFumble && (
                <Badge variant="destructive">
                  <Skull className="size-3" /> {t("criticalFail")}
                </Badge>
              )}
              {result.mode !== "normal" && (
                <Badge variant="secondary">{result.mode}</Badge>
              )}
            </div>
          </div>

          {/* Résultat principal : chaque dé visible + total */}
          <div className="flex flex-wrap items-center gap-2">
            {keptDetails.map((d, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex h-12 min-w-12 items-center justify-center rounded-lg border-2 px-2 font-mono text-2xl font-bold tabular-nums",
                  "border-input bg-card",
                  d.exploded && "border-amber-500 text-amber-600",
                  d.rerolled && "border-blue-500 text-blue-600",
                )}
                title={`${d.type}${d.exploded ? " (explosé)" : ""}${
                  d.rerolled ? " (relancé)" : ""
                }`}
              >
                {d.value}
              </span>
            ))}
            {result.modifier !== 0 && (
              <span className="text-muted-foreground inline-flex h-12 items-center px-1 font-mono text-2xl">
                {result.modifier > 0 ? `+${result.modifier}` : result.modifier}
              </span>
            )}
            {keptDetails.length > 0 && (
              <>
                <Equal className="text-muted-foreground size-5" aria-hidden />
                <span
                  className={cn(
                    "inline-flex h-12 items-center justify-center rounded-lg px-3 font-mono text-3xl font-bold tabular-nums",
                    "bg-primary text-primary-foreground",
                    result.isCritical && "bg-emerald-500",
                    result.isFumble && "bg-red-500",
                  )}
                >
                  {result.total}
                </span>
              </>
            )}
          </div>

          {/* Détails secondaires : dés droppés (kh/dl) */}
          {showDetails && result.details.length > keptDetails.length && (
            <div className="space-y-2 border-t pt-3">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                {t("dropped")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.details
                  .filter((d) => !d.kept)
                  .map((d, i) => (
                    <span
                      key={i}
                      className="border-input/50 text-muted-foreground inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 font-mono text-sm line-through"
                      title={d.type}
                    >
                      {d.value}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
