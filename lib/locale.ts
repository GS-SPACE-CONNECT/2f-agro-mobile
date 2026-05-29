// Lista de locales suportados. Sprint 1: so pt-BR. Sprint 3: re-adicionar
// en se relevante pro relatorio. Type guard isLocale e usado pelo i18n
// bootstrap pra mapear o locale do device.
// Locales: pt-BR only Sprint 1.

export type Locale = "pt-BR";

export const LOCALES: readonly Locale[] = ["pt-BR"] as const;

export const LOCALE_LABEL: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
};

/** Two-letter short code for compact UI (chips, selectors). */
export const LOCALE_SHORT: Record<Locale, string> = {
  "pt-BR": "PT",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "pt-BR";
}
