// Fila de mutações offline — Zustand + persistência AsyncStorage.
// Quando offline, POST/PUT/PATCH/DELETE são enfileirados aqui.
// Quando a conexão volta (ou background-fetch dispara), a fila é processada.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "./storage-keys";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface PendingMutation {
  id: string;
  criadoEm: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body: unknown;
  tentativas: number;
}

interface OfflineQueueState {
  pendentes: PendingMutation[];
  processando: boolean;
  adicionarMutacao: (
    mutacao: Omit<PendingMutation, "id" | "criadoEm" | "tentativas">,
  ) => void;
  removerMutacao: (id: string) => void;
  incrementarTentativa: (id: string) => void;
  limparFila: () => void;
  setProcessando: (v: boolean) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const MAX_TENTATIVAS = 5;

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set) => ({
      pendentes: [],
      processando: false,

      adicionarMutacao: (mutacao) =>
        set((state) => ({
          pendentes: [
            ...state.pendentes,
            {
              ...mutacao,
              id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              criadoEm: new Date().toISOString(),
              tentativas: 0,
            },
          ],
        })),

      removerMutacao: (id) =>
        set((state) => ({
          pendentes: state.pendentes.filter((m) => m.id !== id),
        })),

      incrementarTentativa: (id) =>
        set((state) => ({
          pendentes: state.pendentes.map((m) =>
            m.id === id ? { ...m, tentativas: m.tentativas + 1 } : m,
          ),
        })),

      limparFila: () => set({ pendentes: [] }),

      setProcessando: (v) => set({ processando: v }),
    }),
    {
      name: STORAGE_KEYS.OFFLINE_QUEUE,
      storage: createJSONStorage(() => AsyncStorage),
      // Não persiste o flag 'processando' — sempre começa false no boot
      partialize: (state) => ({ pendentes: state.pendentes }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Processar fila — chamado quando rede volta ou por background-fetch
// ---------------------------------------------------------------------------

export async function processarFila(): Promise<number> {
  const { pendentes, removerMutacao, incrementarTentativa, setProcessando } =
    useOfflineQueue.getState();

  if (pendentes.length === 0) return 0;

  setProcessando(true);
  let processadas = 0;

  for (const mutacao of pendentes) {
    if (mutacao.tentativas >= MAX_TENTATIVAS) {
      // Expirou tentativas — remove pra não travar a fila
      removerMutacao(mutacao.id);
      continue;
    }

    try {
      // Sprint 2: substituir pelo fetch real pro .NET API.
      // A URL base virá de variável de ambiente.
      const response = await fetch(mutacao.endpoint, {
        method: mutacao.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mutacao.body),
      });

      if (response.ok) {
        removerMutacao(mutacao.id);
        processadas++;
      } else {
        incrementarTentativa(mutacao.id);
      }
    } catch {
      // Falha de rede — para de processar e tenta depois
      incrementarTentativa(mutacao.id);
      break;
    }
  }

  setProcessando(false);
  return processadas;
}
