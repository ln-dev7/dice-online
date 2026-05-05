import type { RollResult } from "@/types/dice"

export function exportRollsToCSV(rolls: RollResult[]): string {
  const header = ["timestamp", "notation", "mode", "details", "modifier", "total", "critical", "fumble"]
  const rows = rolls.map((r) => [
    new Date(r.timestamp).toISOString(),
    r.notation,
    r.mode,
    r.details.filter((d) => d.kept).map((d) => d.value).join("|"),
    r.modifier.toString(),
    r.total.toString(),
    r.isCritical ? "1" : "0",
    r.isFumble ? "1" : "0",
  ])
  return [header.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n")
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function downloadFile(filename: string, content: string, mime: string) {
  if (typeof document === "undefined") return
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface FullExport {
  history: RollResult[]
  exportedAt: number
  version: number
}

export function buildFullExport(history: RollResult[]): FullExport {
  return { history, exportedAt: Date.now(), version: 1 }
}
