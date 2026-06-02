// Cliente da API — Sprint 1 retorna mock data direto. Sprint 2 substitui
// pelo client do .NET API, mantendo a mesma interface (api.*).
// Interface estavel: telas nao precisam mudar quando o backend chega.
// API client: mock no Sprint 1, .NET API no Sprint 2.

import * as mock from "./mock-data";
import type { Alerta, DiagnosticoPraga, Lavoura, LavouraDetalhe, Propriedade } from "./types";

// Latencia falsa pra simular network — deixa skeletons aparecerem rapido,
// mas nao demais (UX nao deve parecer travada).
const FAKE_LATENCY_MS = 350;
// Inferencia "pesa" mais que list/get: simula upload + modelo rodando.
// 1.2s da peso narrativo no pitch ("o app esta pensando") sem chatear.
const FAKE_INFERENCE_MS = 1200;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export const api = {
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

  /**
   * Roda inferencia de praga sobre a foto da folha. Sprint 1: mock que
   * sorteia de PRAGAS_DETECTAVEIS. Sprint 2: POST multipart pro endpoint
   * /diagnostico do .NET API, que delega pra YOLO (ONNX/TFLite).
   *
   * @param fotoUri  URI local da foto (file:// no device, blob: no web)
   * @param lavouraId  Opcional — associa o diagnostico a uma lavoura
   */
  async diagnosticarFolha(
    fotoUri: string,
    lavouraId?: string,
  ): Promise<DiagnosticoPraga> {
    await delay(FAKE_INFERENCE_MS);
    return mock.gerarDiagnosticoMock(fotoUri, lavouraId);
  },
};
