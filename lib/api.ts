// Cliente da API — Sprint 1 retorna mock data direto. Sprint 2 substitui
// pelo client do .NET API, mantendo a mesma interface (api.*).
// Interface estavel: telas nao precisam mudar quando o backend chega.
// API client: mock no Sprint 1, .NET API no Sprint 2.

import * as mock from "./mock-data";
import type { Alerta, Lavoura, Propriedade } from "./types";

// Latencia falsa pra simular network — deixa skeletons aparecerem rapido,
// mas nao demais (UX nao deve parecer travada).
const FAKE_LATENCY_MS = 350;

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
};
