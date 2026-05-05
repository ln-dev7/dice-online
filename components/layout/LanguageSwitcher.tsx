"use client"

import { useLocale } from "next-intl"
import { useParams } from "next/navigation"
import { useTransition } from "react"
import { Check, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LOCALE_META, LOCALES, type Locale } from "@/i18n/routing"
import { usePathname, useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = useLocale() as Locale
  const [isPending, startTransition] = useTransition()

  const switchTo = (next: Locale) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error — params type is Record<string, unknown>, route shape varies
        { pathname, params },
        { locale: next },
      )
    })
  }

  const meta = LOCALE_META[currentLocale]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Change language"
          disabled={isPending}
        >
          <Languages className="size-4" />
          <span className="hidden sm:inline">
            <span aria-hidden>{meta.flag}</span> {currentLocale.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        <ScrollArea className="h-72">
          <div className="p-1">
            {LOCALES.map((l) => {
              const m = LOCALE_META[l]
              const active = l === currentLocale
              return (
                <button
                  key={l}
                  onClick={() => switchTo(l)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                    active && "bg-secondary font-medium",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="text-base">
                      {m.flag}
                    </span>
                    <span>{m.name}</span>
                  </span>
                  {active && <Check className="size-3.5 shrink-0" aria-hidden />}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
