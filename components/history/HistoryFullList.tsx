"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Trash, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoryItem } from "@/components/history/HistoryItem"
import { useHistoryStore } from "@/store/historyStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { exportRollsToCSV, downloadFile, buildFullExport } from "@/lib/storage"
import { filterRolls, type HistoryFilter } from "@/lib/historyFilter"

export function HistoryFullList() {
  const rolls = useHistoryStore((s) => s.rolls)
  const removeRoll = useHistoryStore((s) => s.removeRoll)
  const clearAll = useHistoryStore((s) => s.clearAll)
  const { roll } = useDiceRoll()
  const [filter, setFilter] = useState<HistoryFilter>("all")
  const t = useTranslations("history")

  const filtered = useMemo(() => filterRolls(rolls, filter), [rolls, filter])

  const handleExportCsv = () => {
    downloadFile("dice-history.csv", exportRollsToCSV(rolls), "text/csv")
  }
  const handleExportJson = () => {
    downloadFile(
      "dice-online-export.json",
      JSON.stringify(buildFullExport(rolls), null, 2),
      "application/json",
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as HistoryFilter)}>
          <TabsList>
            <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
            <TabsTrigger value="today">{t("filterToday")}</TabsTrigger>
            <TabsTrigger value="week">{t("filterWeek")}</TabsTrigger>
            <TabsTrigger value="crits">{t("filterCrits")}</TabsTrigger>
            <TabsTrigger value="fumbles">{t("filterFumbles")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            disabled={rolls.length === 0}
          >
            <Download className="size-3.5" /> {t("exportCSV")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJson}
            disabled={rolls.length === 0}
          >
            <Download className="size-3.5" /> {t("exportJSON")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
            disabled={rolls.length === 0}
          >
            <Trash className="size-3.5" /> {t("clearAll")}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <HistoryItem
              key={r.id}
              roll={r}
              onReroll={() => roll({ notation: r.notation, mode: r.mode })}
              onDelete={() => removeRoll(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
