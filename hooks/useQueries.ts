// React Query hooks para a API do 2F-AGRO.
// Cada hook encapsula uma chamada da api.ts com cache automático,
// persistência offline e revalidação inteligente.
// Telas consomem estes hooks em vez de chamar api.* diretamente.

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Alerta, CriarLavouraRequest, Lavoura, Propriedade } from "@/lib/types";

// ---------------------------------------------------------------------------
// Query keys centralizadas (facilita invalidação e testes)
// ---------------------------------------------------------------------------

export const queryKeys = {
  propriedade: ["propriedade"] as const,
  lavouras: ["lavouras"] as const,
  lavoura: (id: string) => ["lavoura", id] as const,
  alertas: ["alertas"] as const,
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

export function useAlertaAtual(
  options?: Partial<UseQueryOptions<Alerta | null>>,
) {
  return useQuery({
    queryKey: queryKeys.alertaAtual,
    queryFn: () => api.getCurrentAlert(),
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Mutations — CRUD de Lavouras
// ---------------------------------------------------------------------------

export function useCriarLavoura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CriarLavouraRequest) => api.criarLavoura(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lavouras });
    },
  });
}

export function useAtualizarLavoura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CriarLavouraRequest }) =>
      api.atualizarLavoura(id, data),
    onSuccess: (_result, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.lavouras });
      void qc.invalidateQueries({ queryKey: queryKeys.lavoura(id) });
    },
  });
}

export function useRemoverLavoura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removerLavoura(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lavouras });
    },
  });
}
