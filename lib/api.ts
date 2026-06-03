// Cliente da API 2F-AGRO — rota pra backend .NET real ou mock data (Sprint 1).
// Flag EXPO_PUBLIC_USE_MOCK controla qual implementação roda.
// Interface api.* é estável: telas não precisam mudar independente do backend.

import Constants from "expo-constants";

import { ApiError, getBaseUrl, request } from "./http-client";
import * as mock from "./mock-data";
import type {
  Alerta,
  CriarLavouraRequest,
  DiagnosticoPraga,
  Lavoura,
  LavouraDetalhe,
  Propriedade,
} from "./types";

export { ApiError };

// =====================
// Flag de mock — default "true" em dev (Sprint 1 demo funciona sem backend)
// =====================

const USE_MOCK =
  (Constants.expoConfig?.extra?.useMock as string | undefined) === "true";

// =====================
// Helpers
// =====================

const FAKE_LATENCY_MS = 350;
const FAKE_INFERENCE_MS = 1200;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Ordem de severidade pra computar alerta mais urgente client-side. */
const SEVERIDADE_ORDEM = { critico: 4, alto: 3, medio: 2, baixo: 1 } as const;

/** Resolve fotoUri relativa do backend pra URL absoluta. */
function resolverFotoUri(uri: string): string {
  if (!uri || uri.startsWith("http") || uri.startsWith("file:") || uri.startsWith("blob:")) {
    return uri;
  }
  return `${getBaseUrl()}${uri}`;
}

// =====================
// API mock (Sprint 1 — idêntica à original)
// =====================

const mockApi = {
  async getMinhaPropriedade(): Promise<Propriedade> {
    await delay(FAKE_LATENCY_MS);
    return mock.PROPRIEDADE;
  },

  async listLavouras(): Promise<Lavoura[]> {
    await delay(FAKE_LATENCY_MS);
    return mock.LAVOURAS;
  },

  async getLavoura(id: string): Promise<Lavoura | null> {
    await delay(FAKE_LATENCY_MS);
    return mock.LAVOURAS.find((l) => l.id === id) ?? null;
  },

  async listAlertas(): Promise<Alerta[]> {
    await delay(FAKE_LATENCY_MS);
    return mock.ALERTAS;
  },

  async getCurrentAlert(): Promise<Alerta | null> {
    await delay(FAKE_LATENCY_MS);
    return mock.getCurrentAlert();
  },

  async getDetalheLavoura(id: string): Promise<LavouraDetalhe | null> {
    await delay(FAKE_LATENCY_MS);
    return mock.getDetalheLavoura(id);
  },

  async diagnosticarFolha(
    fotoUri: string,
    lavouraId?: string,
  ): Promise<DiagnosticoPraga> {
    await delay(FAKE_INFERENCE_MS);
    return mock.gerarDiagnosticoMock(fotoUri, lavouraId);
  },

  // Métodos novos — stub mock pra manter interface unificada
  async criarLavoura(_data: CriarLavouraRequest): Promise<Lavoura> {
    await delay(FAKE_LATENCY_MS);
    return mock.LAVOURAS[0];
  },

  async atualizarLavoura(_id: string, _data: CriarLavouraRequest): Promise<Lavoura> {
    await delay(FAKE_LATENCY_MS);
    return mock.LAVOURAS[0];
  },

  async removerLavoura(_id: string): Promise<void> {
    await delay(FAKE_LATENCY_MS);
  },

  async getDiagnostico(_id: string): Promise<DiagnosticoPraga | null> {
    await delay(FAKE_LATENCY_MS);
    return mock.gerarDiagnosticoMock("mock://foto.jpg");
  },

  async listDiagnosticos(_lavouraId?: string): Promise<DiagnosticoPraga[]> {
    await delay(FAKE_LATENCY_MS);
    return [mock.gerarDiagnosticoMock("mock://foto.jpg")];
  },

  async diagnosticosRecentes(_quantidade?: number): Promise<DiagnosticoPraga[]> {
    await delay(FAKE_LATENCY_MS);
    return [mock.gerarDiagnosticoMock("mock://foto.jpg")];
  },

  async getCooperativaMapa(): Promise<unknown> {
    await delay(FAKE_LATENCY_MS);
    return { cooperativas: [] };
  },

  async confirmarAlerta(_id: string): Promise<void> {
    await delay(FAKE_LATENCY_MS);
  },
};

// =====================
// API real (chamadas HTTP pro backend .NET)
// =====================

const realApi = {
  async getMinhaPropriedade(): Promise<Propriedade> {
    return request<Propriedade>("/api/propriedades/me");
  },

  async listLavouras(propriedadeId?: string): Promise<Lavoura[]> {
    return request<Lavoura[]>("/api/lavouras", {
      params: { propriedadeId },
    });
  },

  async getLavoura(id: string): Promise<Lavoura | null> {
    try {
      return await request<Lavoura>(`/api/lavouras/${id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async listAlertas(propriedadeId?: string): Promise<Alerta[]> {
    return request<Alerta[]>("/api/alertas", {
      params: { propriedadeId },
    });
  },

  async getCurrentAlert(): Promise<Alerta | null> {
    const alertas = await this.listAlertas();
    const ativos = alertas.filter(
      (a) => a.status === "novo" || a.status === "visto",
    );
    if (ativos.length === 0) return null;
    return ativos.reduce((best, cur) =>
      SEVERIDADE_ORDEM[cur.severidade] > SEVERIDADE_ORDEM[best.severidade]
        ? cur
        : best,
    );
  },

  async getDetalheLavoura(id: string): Promise<LavouraDetalhe | null> {
    try {
      return await request<LavouraDetalhe>(`/api/lavouras/${id}/detalhe`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async diagnosticarFolha(
    fotoUri: string,
    lavouraId?: string,
  ): Promise<DiagnosticoPraga> {
    const form = new FormData();
    form.append("foto", {
      uri: fotoUri,
      name: "folha.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
    if (lavouraId) form.append("lavouraId", lavouraId);

    const resp = await request<DiagnosticoPraga>("/api/diagnosticos", {
      method: "POST",
      formData: form,
    });
    return { ...resp, fotoUri: resolverFotoUri(resp.fotoUri) };
  },

  // ========== CRUD Lavouras ==========

  async criarLavoura(data: CriarLavouraRequest): Promise<Lavoura> {
    return request<Lavoura>("/api/lavouras", {
      method: "POST",
      body: data,
    });
  },

  async atualizarLavoura(id: string, data: CriarLavouraRequest): Promise<Lavoura> {
    return request<Lavoura>(`/api/lavouras/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async removerLavoura(id: string): Promise<void> {
    return request<void>(`/api/lavouras/${id}`, {
      method: "DELETE",
    });
  },

  // ========== Diagnósticos ==========

  async getDiagnostico(id: string): Promise<DiagnosticoPraga | null> {
    try {
      const resp = await request<DiagnosticoPraga>(`/api/diagnosticos/${id}`);
      return { ...resp, fotoUri: resolverFotoUri(resp.fotoUri) };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async listDiagnosticos(lavouraId?: string): Promise<DiagnosticoPraga[]> {
    const resp = await request<DiagnosticoPraga[]>("/api/diagnosticos", {
      params: { lavouraId },
    });
    return resp.map((d) => ({ ...d, fotoUri: resolverFotoUri(d.fotoUri) }));
  },

  async diagnosticosRecentes(quantidade?: number): Promise<DiagnosticoPraga[]> {
    const resp = await request<DiagnosticoPraga[]>("/api/diagnosticos/recentes", {
      params: { quantidade },
    });
    return resp.map((d) => ({ ...d, fotoUri: resolverFotoUri(d.fotoUri) }));
  },

  // ========== Cooperativa (Sprint 2-3) ==========

  async getCooperativaMapa(): Promise<unknown> {
    return request<unknown>("/api/mapa/cooperativa");
  },

  // ========== Alertas ==========

  async confirmarAlerta(id: string): Promise<void> {
    return request<void>(`/api/alertas/${id}/confirmar`, {
      method: "POST",
    });
  },
};

// =====================
// Export unificado — flag decide qual implementação roda
// =====================

export const api: typeof realApi = USE_MOCK ? mockApi : realApi;
