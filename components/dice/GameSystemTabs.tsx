"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GAME_SYSTEMS } from "@/lib/gameSystems"
import { parseNotation } from "@/lib/diceParser"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { useDiceStore } from "@/store/diceStore"
import type { GameSystemId } from "@/types/gameSystem"

const SYSTEM_LABEL_KEY: Record<GameSystemId, string> = {
  dnd5e: "dnd5e",
  pathfinder: "pathfinder",
  coc: "callOfCthulhu",
  warhammer: "warhammer",
  savage: "savageWorlds",
  custom: "custom",
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function GameSystemTabs() {
  const [system, setSystem] = useState<GameSystemId>("dnd5e")
  const { roll } = useDiceRoll()
  const setGroups = useDiceStore((s) => s.setGroups)
  const setModifier = useDiceStore((s) => s.setModifier)
  const t = useTranslations("gameSystems")

  // Sync la preview avec la notation cliquée AVANT de lancer.
  // L'utilisateur voit donc immédiatement le bon nombre/type de dés dans le tray.
  const quickRoll = (notation: string, label: string) => {
    try {
      const parsed = parseNotation(notation)
      const groups = parsed.groups.map((g) => ({
        id: generateId(),
        type: g.type,
        count: g.count,
      }))
      if (groups.length > 0) {
        setGroups(groups)
        setModifier(parsed.modifier)
      }
    } catch {
      // Si la notation est non-standard (kh/dl/!), on laisse roll faire son travail
      // sans toucher à la preview — c'est mieux que de planter.
    }
    void roll({ notation, label, mode: "normal" })
  }

  return (
    <section aria-labelledby="game-systems">
      <h2 id="game-systems" className="mb-3 text-lg font-semibold">
        {t("title")}
      </h2>
      <Tabs value={system} onValueChange={(v) => setSystem(v as GameSystemId)}>
        <TabsList className="w-full overflow-x-auto">
          {Object.values(GAME_SYSTEMS).map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="flex-1 whitespace-nowrap"
            >
              {t(SYSTEM_LABEL_KEY[s.id])}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.values(GAME_SYSTEMS).map((s) => (
          <TabsContent key={s.id} value={s.id}>
            <Card>
              <CardContent className="space-y-3 py-3">
                <p className="text-muted-foreground text-sm">{s.description}</p>
                <div className="flex flex-wrap gap-2">
                  {s.quickRolls.map((q) => (
                    <Button
                      key={q.label}
                      size="sm"
                      variant="secondary"
                      onClick={() => quickRoll(q.notation, q.label)}
                      title={q.description}
                    >
                      <span>{q.label}</span>
                      <code className="text-muted-foreground font-mono text-xs">
                        {q.notation}
                      </code>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
