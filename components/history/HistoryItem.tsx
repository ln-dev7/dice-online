"use client"

import { Repeat, Trash2, Sparkles, Skull } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { RollResult } from "@/types/dice"
import { cn } from "@/lib/utils"

interface HistoryItemProps {
  roll: RollResult
  onReroll: () => void
  onDelete: () => void
}

function bucketAge(timestamp: number): { unit: "now" | "min" | "h" | "d"; value: number } {
  const diff = Date.now() - timestamp
  const m = Math.floor(diff / 60000)
  if (m < 1) return { unit: "now", value: 0 }
  if (m < 60) return { unit: "min", value: m }
  const h = Math.floor(m / 60)
  if (h < 24) return { unit: "h", value: h }
  return { unit: "d", value: Math.floor(h / 24) }
}

export function HistoryItem({ roll, onReroll, onDelete }: HistoryItemProps) {
  const t = useTranslations("history")
  const tDice = useTranslations("dice")

  const age = bucketAge(roll.timestamp)
  let relative = t("timeJustNow")
  if (age.unit === "min") relative = t("timeMinutes", { minutes: age.value })
  else if (age.unit === "h") relative = t("timeHours", { hours: age.value })
  else if (age.unit === "d") relative = t("timeDays", { days: age.value })

  return (
    <div
      className={cn(
        "group hover:bg-accent/50 flex items-center gap-3 rounded-md border p-3 transition-colors",
        roll.isCritical && "border-l-4 border-l-emerald-500",
        roll.isFumble && "border-l-4 border-l-red-500",
      )}
    >
      <div className="font-mono text-2xl font-bold tabular-nums">{roll.total}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <code className="text-muted-foreground truncate font-mono text-xs">
            {roll.notation}
          </code>
          {roll.isCritical && (
            <Badge variant="success" className="h-4 px-1 text-[10px]">
              <Sparkles className="size-2.5" /> {tDice("criticalSuccess")}
            </Badge>
          )}
          {roll.isFumble && (
            <Badge variant="destructive" className="h-4 px-1 text-[10px]">
              <Skull className="size-2.5" /> {tDice("criticalFail")}
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground mt-0.5 truncate text-xs">
          [{roll.details.filter((d) => d.kept).map((d) => d.value).join(", ")}]
          {roll.modifier !== 0 && ` ${roll.modifier > 0 ? "+" : ""}${roll.modifier}`}
          <span className="mx-1">•</span>
          {relative}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          onClick={onReroll}
          aria-label={t("rollAgain")}
          className="size-7"
        >
          <Repeat className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          aria-label={t("remove")}
          className="size-7"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
