// TTSContext: velocidade do TTS persistida em AsyncStorage. Segue o mesmo
// padrao do ThemeContext — hydrate ao boot, setSpeed persiste imediatamente.
// Velocidades pre-definidas: devagar (0.75), normal (1.0), rapida (1.25).
// Contexto TTS: velocidade persistida, 3 opcoes, padrao normal.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS } from "@/lib/storage-keys";

export const TTS_SPEEDS = [0.75, 1.0, 1.25] as const;
export type TTSSpeed = (typeof TTS_SPEEDS)[number];

const DEFAULT_SPEED: TTSSpeed = 1.0;

type TTSContextValue = {
  speed: TTSSpeed;
  /** Cicla pra proxima velocidade (devagar -> normal -> rapida -> devagar). */
  cycleSpeed: () => void;
  /** Define velocidade diretamente. */
  setSpeed: (speed: TTSSpeed) => void;
};

const TTSContext = createContext<TTSContextValue | undefined>(undefined);

function isTTSSpeed(n: number): n is TTSSpeed {
  return (TTS_SPEEDS as readonly number[]).includes(n);
}

export function TTSProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeedState] = useState<TTSSpeed>(DEFAULT_SPEED);

  // Boot: ler velocidade persistida do AsyncStorage.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEYS.TTS_SPEED)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed = parseFloat(stored);
        if (isTTSSpeed(parsed)) setSpeedState(parsed);
      })
      .catch(() => {
        // falha de storage nao deve bloquear UX
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSpeed = useCallback((next: TTSSpeed) => {
    setSpeedState(next);
    AsyncStorage.setItem(STORAGE_KEYS.TTS_SPEED, String(next)).catch(() => {});
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedState((prev) => {
      const idx = TTS_SPEEDS.indexOf(prev);
      const next = TTS_SPEEDS[(idx + 1) % TTS_SPEEDS.length];
      AsyncStorage.setItem(STORAGE_KEYS.TTS_SPEED, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<TTSContextValue>(
    () => ({ speed, cycleSpeed, setSpeed }),
    [speed, cycleSpeed, setSpeed],
  );

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
}

export function useTTS(): TTSContextValue {
  const ctx = useContext(TTSContext);
  if (!ctx) {
    throw new Error("useTTS deve ser usado dentro de <TTSProvider>");
  }
  return ctx;
}
