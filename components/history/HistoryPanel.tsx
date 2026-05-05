"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Trash, Download, History as HistoryIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { HistoryItem } from "@/components/history/HistoryItem"
import { useHistoryStore } from "@/store/historyStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { exportRollsToCSV, downloadFile } from "@/lib/storage"
import { filterRolls, type HistoryFilter } from "@/lib/historyFilter"

export function HistoryPanel() {
  const rolls = useHistoryStore((s) => s.rolls)
  const removeRoll = useHistoryStore((s) => s.removeRoll)
  const clearAll = useHistoryStore((s) => s.clearAll)
  const { roll } = useDiceRoll()
  const [filter, setFilter] = useState<HistoryFilter>("all")
  const t = useTranslations("history")

  const filtered = useMemo(() => filterRolls(rolls, filter), [rolls, filter])

  const handleExport = () => {
    const csv = exportRollsToCSV(rolls)
    downloadFile("dice-history.csv", csv, "text/csv")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t("open")}>
          <HistoryIcon className="size-4" /> {t("open")}
          <span className="text-muted-foreground ml-1 text-xs">
            ({rolls.length})
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 px-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={rolls.length === 0}
          >
            <Download className="size-3.5" /> {t("exportCSV")}
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

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as HistoryFilter)}
          className="px-4"
        >
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              {t("filterAll")}
            </TabsTrigger>
            <TabsTrigger value="today" className="flex-1">
              {t("filterToday")}
            </TabsTrigger>
            <TabsTrigger value="crits" className="flex-1">
              {t("filterCrits")}
            </TabsTrigger>
            <TabsTrigger value="fumbles" className="flex-1">
              {t("filterFumbles")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            <Separator className="my-2" />
            <ScrollArea className="h-[calc(100vh-260px)]">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  {t("empty")}
                </p>
              ) : (
                <div className="space-y-2 pb-4">
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
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
