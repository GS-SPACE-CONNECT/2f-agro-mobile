// i18n bootstrap. Sprint 1: somente pt-BR. Re-adicionar en em Sprint 3
// se relevante (estrutura ja preparada).
// Bootstrap i18n: pt-BR only.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import type { Locale } from "@/lib/locale";

import ptBR from "./pt-BR.json";

/**
 * Sprint 1: forca pt-BR sempre. Sprint 3 vai re-introduzir detecção via
 * device locale (Platform.OS + NativeModules) quando reativarmos `en`.
 */
export function detectDeviceLocale(): Locale {
  return "pt-BR";
}

void i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
  },
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

export default i18n;
