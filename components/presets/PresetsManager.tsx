"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Play, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { parseNotation, NotationError } from "@/lib/diceParser"
import { usePresetsStore } from "@/store/presetsStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"

export function PresetsManager() {
  const presets = usePresetsStore((s) => s.presets)
  const addPreset = usePresetsStore((s) => s.addPreset)
  const removePreset = usePresetsStore((s) => s.removePreset)
  const { roll } = useDiceRoll()
  const t = useTranslations("presets")
  const tCommon = useTranslations("common")

  const [name, setName] = useState("")
  const [notation, setNotation] = useState("")
  const [tags, setTags] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !notation.trim()) {
      setError(t("nameRequired"))
      return
    }
    try {
      parseNotation(notation)
    } catch (err) {
      setError(err instanceof NotationError ? err.message : tCommon("error"))
      return
    }
    addPreset({
      name: name.trim(),
      notation: notation.trim(),
      tags: tags
        .split(",")
        .map((tg) => tg.trim())
        .filter(Boolean),
    })
    setName("")
    setNotation("")
    setTags("")
    setError(null)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t("create")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">{t("name")}</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-notation">{t("notation")}</Label>
              <Input
                id="p-notation"
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                placeholder={t("notationPlaceholder")}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-tags">{t("tags")}</Label>
              <Input
                id="p-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("tagsPlaceholder")}
              />
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> {t("add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {presets.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center text-sm">
              {t("noPresets")}
            </CardContent>
          </Card>
        ) : (
          presets
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <code className="font-mono">{p.notation}</code>
                      {p.tags.map((tg) => (
                        <Badge key={tg} variant="outline" className="text-[10px]">
                          <Tag className="size-2.5" />
                          {tg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => roll({ notation: p.notation, label: p.name })}
                  >
                    <Play className="size-3.5" /> {t("play")}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removePreset(p.id)}
                    aria-label={tCommon("delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
