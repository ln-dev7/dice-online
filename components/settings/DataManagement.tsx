"use client"

import { RotateCcw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useSettingsStore } from "@/store/settingsStore"
import { useHistoryStore } from "@/store/historyStore"
import { usePresetsStore } from "@/store/presetsStore"
import { useDiceStore } from "@/store/diceStore"

const STORAGE_KEYS = [
  "dice-online:settings",
  "dice-online:history",
  "dice-online:presets",
]

export function DataManagement() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const resetSettings = useSettingsStore((s) => s.reset)
  const resetHistory = useHistoryStore((s) => s.reset)
  const resetPresets = usePresetsStore((s) => s.reset)
  const resetDice = useDiceStore((s) => s.reset)

  const handleResetDefaults = () => {
    resetSettings()
    resetDice()
    toast.success(t("doneToast"))
  }

  const handleClearAll = () => {
    resetSettings()
    resetHistory()
    resetPresets()
    resetDice()
    if (typeof window !== "undefined") {
      for (const key of STORAGE_KEYS) {
        try {
          window.localStorage.removeItem(key)
        } catch {
          /* ignore */
        }
      }
    }
    toast.success(t("doneToast"))
    // Reload pour s'assurer que tout repart sur un état vierge
    if (typeof window !== "undefined") {
      setTimeout(() => window.location.reload(), 400)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("data")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {t("resetDefaultsHint")}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="size-3.5" /> {t("resetDefaults")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("resetDefaultsConfirmTitle")}</DialogTitle>
                <DialogDescription>
                  {t("resetDefaultsConfirmBody")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{tCommon("cancel")}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleResetDefaults}>
                    {t("resetDefaultsConfirmAction")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-muted-foreground text-sm">{t("clearDataHint")}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-3.5" /> {t("clearData")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("clearDataConfirmTitle")}</DialogTitle>
                <DialogDescription>{t("clearDataConfirmBody")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{tCommon("cancel")}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleClearAll}>
                    {t("clearDataConfirmAction")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
