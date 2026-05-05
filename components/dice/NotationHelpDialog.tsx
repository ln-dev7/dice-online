"use client"

import { HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
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

function Example({ code, description }: { code: string; description: string }) {
  return (
    <li className="flex items-baseline gap-3">
      <code className="bg-muted shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
        {code}
      </code>
      <span className="text-muted-foreground text-sm">{description}</span>
    </li>
  )
}

// Parse "1d20 — explication" en { code, description }
function splitLine(line: string): { code: string; description: string } {
  const match = line.match(/^(\S.*?)\s*[—-]\s*(.+)$/)
  if (match) return { code: match[1]!, description: match[2]! }
  return { code: line, description: "" }
}

export function NotationHelpDialog() {
  const t = useTranslations("dice")

  const basics = [t("helpBasic1"), t("helpBasic2"), t("helpBasic3"), t("helpBasic4"), t("helpBasic5")]
  const advanced = [
    t("helpAdv1"),
    t("helpAdv2"),
    t("helpAdv3"),
    t("helpAdv4"),
    t("helpAdv5"),
    t("helpAdv6"),
  ]
  const examples = [
    t("helpEx1"),
    t("helpEx2"),
    t("helpEx3"),
    t("helpEx4"),
    t("helpEx5"),
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          aria-label={t("helpHint")}
        >
          <HelpCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("helpTitle")}</DialogTitle>
          <DialogDescription>{t("helpIntro")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-sm font-semibold">{t("helpBasicTitle")}</h3>
            <ul className="space-y-2">
              {basics.map((line) => {
                const { code, description } = splitLine(line)
                return <Example key={code} code={code} description={description} />
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">
              {t("helpAdvancedTitle")}
            </h3>
            <ul className="space-y-2">
              {advanced.map((line) => {
                const { code, description } = splitLine(line)
                return <Example key={code} code={code} description={description} />
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">
              {t("helpExamplesTitle")}
            </h3>
            <ul className="space-y-2">
              {examples.map((line) => {
                const { code, description } = splitLine(line)
                return <Example key={line} code={code} description={description} />
              })}
            </ul>
          </section>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>{t("helpClose")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
