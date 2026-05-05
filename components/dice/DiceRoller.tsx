"use client"

import { Dice5, Repeat, Zap, ZapOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiceTray } from "@/components/dice/DiceTray"
import { DiceSelector } from "@/components/dice/DiceSelector"
import { NotationInput } from "@/components/dice/NotationInput"
import { DiceResult } from "@/components/dice/DiceResult"
import { useDiceStore } from "@/store/diceStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import type { RollMode } from "@/types/dice"

export function DiceRoller() {
  const { roll, isRolling } = useDiceRoll()
  const mode = useDiceStore((s) => s.mode)
  const setMode = useDiceStore((s) => s.setMode)
  const t = useTranslations("dice")
  const tCommon = useTranslations("common")

  const rollLabel = isRolling ? tCommon("rolling") : t("rollWithShortcut")
  const rollLabelMobile = isRolling ? tCommon("rolling") : tCommon("roll")

  return (
    <>
      <div className="grid gap-6 pb-24 md:pb-0 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <DiceTray />
          <DiceResult />
        </div>

        <div className="space-y-4">
          <DiceSelector />
          <NotationInput />

          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-medium">
              {t("mode")}
            </label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as RollMode)}>
              <TabsList className="w-full">
                <TabsTrigger value="normal" className="flex-1">
                  {t("modeNormal")}
                </TabsTrigger>
                <TabsTrigger value="advantage" className="flex-1">
                  <Zap className="size-3" /> {t("advantage")}
                </TabsTrigger>
                <TabsTrigger value="disadvantage" className="flex-1">
                  <ZapOff className="size-3" /> {t("disadvantage")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="hidden gap-2 md:flex">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => roll()}
              disabled={isRolling}
              aria-label={t("rollWithShortcut")}
            >
              <Dice5 className="size-4" />
              {rollLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => roll()}
              disabled={isRolling}
              aria-label={t("rollAgain")}
            >
              <Repeat className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* FAB mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <Button
            size="lg"
            className="h-12 flex-1 text-base shadow-lg"
            onClick={() => roll()}
            disabled={isRolling}
            aria-label={t("rollDice")}
          >
            <Dice5 className="size-5" />
            {rollLabelMobile}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12"
            onClick={() => roll()}
            disabled={isRolling}
            aria-label={t("rollAgain")}
          >
            <Repeat className="size-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
