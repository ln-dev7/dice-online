"use client"

import { Volume2, VolumeX, Vibrate } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useSettingsStore } from "@/store/settingsStore"

export function SoundSettings() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled)
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled)
  const setVolume = useSettingsStore((s) => s.setVolume)
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled)
  const t = useTranslations("settings")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("audio")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound" className="cursor-pointer">
            {soundEnabled ? (
              <Volume2 className="size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
            {t("soundEffects")}
          </Label>
          <Switch
            id="sound"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t("volume")}</Label>
            <span className="text-muted-foreground font-mono text-xs tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setVolume((v[0] ?? 0) / 100)}
            disabled={!soundEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="vibration" className="cursor-pointer">
            <Vibrate className="size-4" />
            {t("vibration")}
          </Label>
          <Switch
            id="vibration"
            checked={vibrationEnabled}
            onCheckedChange={setVibrationEnabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
