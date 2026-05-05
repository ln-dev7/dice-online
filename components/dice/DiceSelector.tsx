"use client"

import { Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useDiceStore } from "@/store/diceStore"
import { DICE_TYPES, type DiceType } from "@/types/dice"
import { cn } from "@/lib/utils"

const DICE_ICONS: Record<DiceType, string> = {
  d2: "◐",
  d3: "▲",
  d4: "◮",
  d6: "■",
  d8: "◆",
  d10: "⬟",
  d12: "⬢",
  d20: "⬣",
  d100: "%",
}

export function DiceSelector() {
  const selectedType = useDiceStore((s) => s.selectedType)
  const setSelectedType = useDiceStore((s) => s.setSelectedType)
  const count = useDiceStore((s) => s.count)
  const setCount = useDiceStore((s) => s.setCount)
  const setNotation = useDiceStore((s) => s.setNotation)
  const modifier = useDiceStore((s) => s.modifier)
  const t = useTranslations("dice")

  const updateNotation = (type: DiceType, c: number, mod: number) => {
    let notation = `${c}${type}`
    if (mod > 0) notation += `+${mod}`
    if (mod < 0) notation += `${mod}`
    setNotation(notation)
  }

  const handleType = (type: DiceType) => {
    setSelectedType(type)
    updateNotation(type, count, modifier)
  }

  const handleCount = (delta: number) => {
    const next = Math.max(1, Math.min(100, count + delta))
    setCount(next)
    updateNotation(selectedType, next, modifier)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">
          {t("diceType")}
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleType(type)}
              aria-label={type}
              aria-pressed={selectedType === type}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border font-mono transition-all",
                "hover:border-primary hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
                "active:scale-95",
                selectedType === type
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-input bg-card",
              )}
            >
              <span className="text-3xl leading-none" aria-hidden>
                {DICE_ICONS[type]}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">
          {t("numberOfDice")}
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => handleCount(-1)}
            disabled={count <= 1}
            aria-label={t("decrease")}
          >
            <Minus className="size-4" />
          </Button>
          <div className="border-input flex h-9 flex-1 items-center justify-center rounded-md border font-mono text-lg">
            {count}
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => handleCount(1)}
            disabled={count >= 100}
            aria-label={t("increase")}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
