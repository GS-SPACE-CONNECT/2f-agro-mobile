// Wrapper TTS (text-to-speech) usando expo-speech. Segue o padrao do haptics.ts:
// silencia falhas no simulador/web e expoe API enxuta pro resto do app.
// Usa motor TTS nativo do sistema — funciona 100% offline.
// TTS wrapper: expo-speech em pt-BR, offline via motor nativo do SO.

import * as Speech from "expo-speech";
import { Platform } from "react-native";

const supported = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Fala o texto em pt-BR. Para qualquer fala anterior antes de iniciar
 * (evita sobreposicao de audios). Rate controlavel via Settings.
 */
export async function speak(text: string, rate = 1.0): Promise<void> {
  if (!supported || !text) return;
  try {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) await Speech.stop();
    Speech.speak(text, {
      language: "pt-BR",
      rate,
      pitch: 1.0,
    });
  } catch {
    // simulador/web pode falhar — silenciado
  }
}

/** Para a fala em andamento. */
export function stop(): void {
  if (!supported) return;
  try {
    void Speech.stop();
  } catch {
    // silenciado
  }
}

/** Verifica se o motor TTS esta falando. */
export async function isSpeaking(): Promise<boolean> {
  if (!supported) return false;
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}
