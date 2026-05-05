import { NotationError } from "@/lib/diceParser"

type Translator = (key: string, values?: Record<string, string | number>) => string

// Convertit une erreur quelconque en message localisé via les clés
// `dice.errors.<code>`. Les fallbacks couvrent le cas où l'erreur n'est pas
// une NotationError (parser ayant changé, runtime exception, etc.).
export function notationErrorMessage(err: unknown, t: Translator): string {
  if (err instanceof NotationError) {
    return t(`errors.${err.code}`, err.context)
  }
  return t("errors.unknown")
}
