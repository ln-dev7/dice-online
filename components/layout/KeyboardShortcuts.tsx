"use client"

import { useKeyboard } from "@/hooks/useKeyboard"

// Composant invisible qui active les raccourcis clavier de la page principale.
export function KeyboardShortcuts() {
  useKeyboard()
  return null
}
