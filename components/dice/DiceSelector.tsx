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
  const setGroups = useDiceStore((s) => s.setGroups)
  const setModifier = useDiceStore((s) => s.setModifier)
  const t = useTranslations("dice")

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

  // Supprime TOUS les groupes d'un type donné. Garantit qu'il reste au moins
  // un dé : si on retire le dernier groupe, on retombe sur 1d6 par défaut.
  const removeAllOfType = (type: DiceType) => {
    const remaining = groups.filter((g) => g.type !== type)
    if (remaining.length === 0) {
      setGroups([{ id: "default", type: "d6", count: 1 }])
    } else {
      setGroups(remaining)
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
              <div key={type} className="relative">
                <button
                  type="button"
                  onClick={() => incrementType(type)}
                  aria-label={`${type} +1`}
                  className={cn(
                    "relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border font-mono transition-all",
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
                      className="bg-primary text-primary-foreground absolute -bottom-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold"
                      aria-label={`${count} ${type}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
                {active && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAllOfType(type)
                    }}
                    aria-label={`${t("removeAll")} ${type}`}
                    className={cn(
                      "absolute -left-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full",
                      "bg-destructive text-white shadow",
                      "hover:scale-110 focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
                    )}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chips de la sélection actuelle */}
      {groups.length > 0 && (
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-medium">
            {t("pool")}
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
                  aria-label={t("removeAll")}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modificateur global */}
      <div className="space-y-1.5">
        <label
          htmlFor="modifier"
          className="text-muted-foreground block text-xs font-medium"
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
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("modifierHint")}
        </p>
      </div>
    </div>
  )
}
