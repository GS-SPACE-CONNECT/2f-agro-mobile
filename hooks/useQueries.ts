// React Query hooks para a API do 2F-AGRO.
// Cada hook encapsula uma chamada da api.ts com cache automático,
// persistência offline e revalidação inteligente.
// Telas consomem estes hooks em vez de chamar api.* diretamente.

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Alerta, Lavoura, Propriedade } from "@/lib/types";

// ---------------------------------------------------------------------------
// Query keys centralizadas (facilita invalidação e testes)
// ---------------------------------------------------------------------------

export const queryKeys = {
  propriedade: ["propriedade"] as const,
  lavouras: ["lavouras"] as const,
  lavoura: (id: string) => ["lavoura", id] as const,
  alertas: ["alertas"] as const,
  alerta: (id: string) => ["alerta", id] as const,
  alertaAtual: ["alerta-atual"] as const,
} as const;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePropriedade(
  options?: Partial<UseQueryOptions<Propriedade>>,
) {
  return useQuery({
    queryKey: queryKeys.propriedade,
    queryFn: () => api.getMinhaPropriedade(),
    staleTime: 1000 * 60 * 30, // 30min — propriedade muda raramente
    ...options,
  });
}

export function useLavouras(
  options?: Partial<UseQueryOptions<Lavoura[]>>,
) {
  return useQuery({
    queryKey: queryKeys.lavouras,
    queryFn: () => api.listLavouras(),
    ...options,
  });
}

export function useLavoura(
  id: string,
  options?: Partial<UseQueryOptions<Lavoura | null>>,
) {
  return useQuery({
    queryKey: queryKeys.lavoura(id),
    queryFn: () => api.getLavoura(id),
    enabled: !!id,
    ...options,
  });
}

export function useAlertas(
  options?: Partial<UseQueryOptions<Alerta[]>>,
) {
  return useQuery({
    queryKey: queryKeys.alertas,
    queryFn: () => api.listAlertas(),
    ...options,
  });
}

export function useAlerta(
  id: string,
  options?: Partial<UseQueryOptions<Alerta | null>>,
) {
  return useQuery({
    queryKey: queryKeys.alerta(id),
    queryFn: () => api.getAlerta(id),
    enabled: !!id,
    ...options,
  });
}

export function useAlertaAtual(
  options?: Partial<UseQueryOptions<Alerta | null>>,
) {
  return useQuery({
    queryKey: queryKeys.alertaAtual,
    queryFn: () => api.getCurrentAlert(),
    ...options,
  });
}
