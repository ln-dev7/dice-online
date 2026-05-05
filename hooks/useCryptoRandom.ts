"use client"

import { useCallback } from "react"
import { rollDie } from "@/lib/diceRoller"

// Wrapper de commodité pour générer des nombres aléatoires crypto-secure côté composant.
export function useCryptoRandom() {
  const random = useCallback((min: number, max: number) => {
    return rollDie(max - min + 1) - 1 + min
  }, [])

  return { random }
}
