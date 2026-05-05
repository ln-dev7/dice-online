"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  useSettingsStore,
  type DiceColor,
  type DiceMaterial,
  type DiceTrayBackground,
} from "@/store/settingsStore"
import { cn } from "@/lib/utils"

const COLORS: { value: DiceColor; key: string; swatch: string }[] = [
  { value: "red", key: "red", swatch: "bg-red-500" },
  { value: "blue", key: "blue", swatch: "bg-blue-500" },
  { value: "green", key: "green", swatch: "bg-emerald-500" },
  { value: "purple", key: "purple", swatch: "bg-violet-600" },
  { value: "gold", key: "gold", swatch: "bg-amber-500" },
  { value: "silver", key: "silver", swatch: "bg-slate-400" },
  { value: "black", key: "black", swatch: "bg-slate-900" },
  { value: "white", key: "white", swatch: "bg-slate-100 border" },
  { value: "neon-pink", key: "neonPink", swatch: "bg-pink-500" },
  { value: "neon-cyan", key: "neonCyan", swatch: "bg-cyan-400" },
]

const MATERIALS: { value: DiceMaterial; key: string }[] = [
  { value: "plastic", key: "plastic" },
  { value: "metal", key: "metal" },
  { value: "gem", key: "gem" },
  { value: "wood", key: "wood" },
  { value: "marble", key: "marble" },
  { value: "holographic", key: "holographic" },
  { value: "neon", key: "neon" },
]

const TRAYS: { value: DiceTrayBackground; key: string }[] = [
  { value: "felt", key: "felt" },
  { value: "wood", key: "wood" },
  { value: "stone", key: "stone" },
  { value: "space", key: "space" },
  { value: "transparent", key: "transparent" },
]

export function DiceCustomizer() {
  const diceColor = useSettingsStore((s) => s.diceColor)
  const diceMaterial = useSettingsStore((s) => s.diceMaterial)
  const trayBackground = useSettingsStore((s) => s.trayBackground)
  const use3D = useSettingsStore((s) => s.use3D)
  const showDetailedResults = useSettingsStore((s) => s.showDetailedResults)
  const setDiceColor = useSettingsStore((s) => s.setDiceColor)
  const setDiceMaterial = useSettingsStore((s) => s.setDiceMaterial)
  const setTrayBackground = useSettingsStore((s) => s.setTrayBackground)
  const setUse3D = useSettingsStore((s) => s.setUse3D)
  const setShowDetailedResults = useSettingsStore((s) => s.setShowDetailedResults)
  const t = useTranslations("settings")
  const tColors = useTranslations("colors")
  const tMaterials = useTranslations("materials")
  const tTrays = useTranslations("trays")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appearance")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">{t("color")}</Label>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setDiceColor(c.value)}
                aria-label={tColors(c.key)}
                aria-pressed={diceColor === c.value}
                className={cn(
                  "relative size-10 rounded-full transition-all hover:scale-110 focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
                  c.swatch,
                  diceColor === c.value && "ring-primary ring-2 ring-offset-2",
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">{t("material")}</Label>
          <Select
            value={diceMaterial}
            onValueChange={(v) => setDiceMaterial(v as DiceMaterial)}
          >
            <SelectTrigger id="material" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATERIALS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {tMaterials(m.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tray">{t("tableSurface")}</Label>
          <Select
            value={trayBackground}
            onValueChange={(v) => setTrayBackground(v as DiceTrayBackground)}
          >
            <SelectTrigger id="tray" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRAYS.map((tr) => (
                <SelectItem key={tr.value} value={tr.value}>
                  {tTrays(tr.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="use3d" className="cursor-pointer">
              {t("rendering3D")}
            </Label>
            <Switch id="use3d" checked={use3D} onCheckedChange={setUse3D} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="details" className="cursor-pointer">
              {t("showDetails")}
            </Label>
            <Switch
              id="details"
              checked={showDetailedResults}
              onCheckedChange={setShowDetailedResults}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
