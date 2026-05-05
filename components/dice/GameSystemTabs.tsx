"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GAME_SYSTEMS } from "@/lib/gameSystems"
import { parseNotation } from "@/lib/diceParser"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { useDiceStore } from "@/store/diceStore"
import { usePresetsStore } from "@/store/presetsStore"
import type { GameSystemId } from "@/types/gameSystem"

const SYSTEM_LABEL_KEY: Record<GameSystemId, string> = {
  dnd5e: "dnd5e",
  pathfinder: "pathfinder",
  coc: "callOfCthulhu",
  warhammer: "warhammer",
  savage: "savageWorlds",
  custom: "custom",
}

const PRESETS_TAB = "__presets__"

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function GameSystemTabs() {
  const presets = usePresetsStore((s) => s.presets)
  const hasPresets = presets.length > 0
  const [activeTab, setActiveTab] = useState<string>(
    hasPresets ? PRESETS_TAB : "dnd5e",
  )
  const { roll } = useDiceRoll()
  const setGroups = useDiceStore((s) => s.setGroups)
  const setModifier = useDiceStore((s) => s.setModifier)
  const t = useTranslations("gameSystems")

  const quickRoll = (notation: string, label: string) => {
    try {
      const parsed = parseNotation(notation)
      const newGroups = parsed.groups.map((g) => ({
        id: generateId(),
        type: g.type,
        count: g.count,
      }))
      if (newGroups.length > 0) {
        setGroups(newGroups)
        setModifier(parsed.modifier)
      }
    } catch {
      /* notation non-standard — laisse roll() faire son travail */
    }
    void roll({ notation, label, mode: "normal" })
  }

  return (
    <section aria-labelledby="game-systems">
      <h2 id="game-systems" className="mb-3 text-lg font-semibold">
        {t("title")}
      </h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto">
          {hasPresets && (
            <TabsTrigger value={PRESETS_TAB} className="flex-1 whitespace-nowrap">
              <Sparkles className="size-3" />
              {t("myPresets")}
            </TabsTrigger>
          )}
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

        {hasPresets && (
          <TabsContent value={PRESETS_TAB}>
            <Card>
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-2">
                  {presets
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((p) => (
                      <Button
                        key={p.id}
                        size="sm"
                        variant="secondary"
                        onClick={() => quickRoll(p.notation, p.name)}
                        title={p.notation}
                      >
                        <span>{p.name}</span>
                        <code className="text-muted-foreground font-mono text-xs">
                          {p.notation}
                        </code>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
