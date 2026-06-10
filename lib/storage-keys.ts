// Centralised storage keys for AsyncStorage. Never use string literals in
// callers — keep the namespace in one place so a rename or audit is safe.
// Chaves de storage centralizadas; proibido usar string literal nos consumers.

export const STORAGE_KEYS = {
  THEME: "@2f-agro/theme_v1",
  LOCALE: "@2f-agro/locale",
  ONBOARDED: "@2f-agro/onboarded",
  SESSION: "@2f-agro/session",
  PROPRIEDADE: "@2f-agro/propriedade_v1",
  // JWT vive no SecureStore, que só aceita [A-Za-z0-9._-] — sem "@" nem "/".
  JWT: "2f-agro.jwt",
  QUERY_CACHE: "@2f-agro/react-query-cache",
  OFFLINE_QUEUE: "@2f-agro/offline-queue",
  TTS_SPEED: "@2f-agro/tts_speed",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
