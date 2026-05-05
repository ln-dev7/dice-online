"use client"

import { Minus, Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const groups = useDiceStore((s) => s.groups)
  const modifier = useDiceStore((s) => s.modifier)
  const addGroup = useDiceStore((s) => s.addGroup)
  const removeGroup = useDiceStore((s) => s.removeGroup)
  const updateGroupCount = useDiceStore((s) => s.updateGroupCount)
  const setModifier = useDiceStore((s) => s.setModifier)
  const t = useTranslations("dice")

  // Compte total par type (un type peut avoir plusieurs groupes si l'utilisateur
  // a édité la notation directement, donc on agrège)
  const totalByType = (type: DiceType) =>
    groups
      .filter((g) => g.type === type)
      .reduce((sum, g) => sum + g.count, 0)

  const incrementType = (type: DiceType) => {
    const existing = groups.find((g) => g.type === type)
    if (existing) {
      updateGroupCount(existing.id, existing.count + 1)
    } else {
      addGroup(type)
    }
  }

  return (
    <div className="space-y-3">
      {/* Palette de dés : tap pour ajouter */}
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-medium">
          {t("diceType")}
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DICE_TYPES.map((type) => {
            const count = totalByType(type)
            const active = count > 0
            return (
              <button
                key={type}
                type="button"
                onClick={() => incrementType(type)}
                aria-label={`${type} +1`}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border font-mono transition-all",
                  "hover:border-primary hover:bg-accent active:scale-95",
                  "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-input bg-card",
                )}
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {DICE_ICONS[type]}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {type}
                </span>
                {count > 0 && (
                  <span
                    className="bg-primary text-primary-foreground absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold"
                    aria-label={`${count} ${type}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chips de la sélection actuelle */}
      {groups.length > 0 && (
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-medium">
            Pool
          </label>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <div
                key={g.id}
                className="bg-secondary text-secondary-foreground flex items-center gap-0.5 rounded-full pl-2 pr-0.5 py-0.5"
              >
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-6 rounded-full"
                  onClick={() => updateGroupCount(g.id, g.count - 1)}
                  disabled={g.count <= 1}
                  aria-label={t("decrease")}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="px-1 font-mono text-sm font-semibold tabular-nums">
                  {g.count}
                  {g.type}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-6 rounded-full"
                  onClick={() => updateGroupCount(g.id, g.count + 1)}
                  disabled={g.count >= 100}
                  aria-label={t("increase")}
                >
                  <Plus className="size-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-6 rounded-full"
                  onClick={() => removeGroup(g.id)}
                  disabled={groups.length <= 1}
                  aria-label="Remove"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modificateur global */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="modifier"
          className="text-muted-foreground text-xs font-medium"
        >
          {t("modifier")}
        </label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => setModifier(modifier - 1)}
            aria-label={t("decrease")}
          >
            <Minus className="size-3" />
          </Button>
          <Input
            id="modifier"
            type="number"
            value={modifier}
            onChange={(e) =>
              setModifier(Number.parseInt(e.target.value, 10) || 0)
            }
            className="h-8 w-16 text-center font-mono"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => setModifier(modifier + 1)}
            aria-label={t("increase")}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
