"use client"

import { Minus, Plus, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  const updateGroupType = useDiceStore((s) => s.updateGroupType)
  const updateGroupCount = useDiceStore((s) => s.updateGroupCount)
  const setModifier = useDiceStore((s) => s.setModifier)
  const t = useTranslations("dice")

  return (
    <div className="space-y-3">
      <label className="text-muted-foreground block text-xs font-medium">
        {t("diceType")}
      </label>

      <div className="space-y-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="bg-card flex items-center gap-2 rounded-lg border p-2"
          >
            {/* Count buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-7"
                onClick={() => updateGroupCount(g.id, g.count - 1)}
                disabled={g.count <= 1}
                aria-label={t("decrease")}
              >
                <Minus className="size-3" />
              </Button>
              <span className="w-7 text-center font-mono text-sm font-semibold tabular-nums">
                {g.count}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-7"
                onClick={() => updateGroupCount(g.id, g.count + 1)}
                disabled={g.count >= 100}
                aria-label={t("increase")}
              >
                <Plus className="size-3" />
              </Button>
            </div>

            <span className="text-muted-foreground font-mono text-xs">×</span>

            {/* Type picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 justify-start gap-2"
                >
                  <span className="text-base leading-none" aria-hidden>
                    {DICE_ICONS[g.type]}
                  </span>
                  <span className="font-mono uppercase">{g.type}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="grid grid-cols-3 gap-1.5">
                  {DICE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateGroupType(g.id, type)}
                      aria-label={type}
                      aria-pressed={g.type === type}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border font-mono text-xs transition-colors",
                        "hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
                        g.type === type
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      <span className="text-2xl leading-none" aria-hidden>
                        {DICE_ICONS[type]}
                      </span>
                      <span className="font-semibold uppercase">{type}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => removeGroup(g.id)}
              disabled={groups.length <= 1}
              aria-label={t("dropped")}
            >
              {groups.length > 1 ? (
                <Trash2 className="size-3.5" />
              ) : (
                <X className="size-3.5 opacity-30" />
              )}
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => addGroup("d6")}
        >
          <Plus className="size-3.5" />
          {t("diceType")} +
        </Button>
      </div>

      {/* Modificateur global */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="modifier"
          className="text-muted-foreground text-xs font-medium"
        >
          {t("modifier")}
        </label>
        <Input
          id="modifier"
          type="number"
          value={modifier}
          onChange={(e) => setModifier(Number.parseInt(e.target.value, 10) || 0)}
          className="h-8 w-20 font-mono"
        />
      </div>
    </div>
  )
}
