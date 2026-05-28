// Mock data pro Sprint 1 — app roda 100% sem backend.
// Quando o .NET API estiver pronto, lib/api.ts troca o source mas mantem
// a mesma interface. Dados sao plausiveis (Caruaru-PE, 12.5ha, culturas
// do semiarido) pra que demo nao pareca artificial.
// Mock data Sprint 1: roda sem backend, dados realistas pra demo.

import type { Alerta, Lavoura, Propriedade } from "./types";

export const PROPRIEDADE: Propriedade = {
  id: "prop-1",
  nome: "Sitio Boa Vista",
  donoNome: "Seu Joao",
  donoFullName: "Joao da Silva",
  municipio: "Caruaru",
  estado: "PE",
  lat: -8.2839,
  lng: -35.9758,
  areaTotalHectares: 12.5,
};

export const LAVOURAS: Lavoura[] = [
  {
    id: "lav-1",
    propriedadeId: "prop-1",
    cultura: "milho",
    culturaLabel: "Milho",
    identificador: "L1",
    areaHectares: 2.5,
    saude: "saudavel",
    ndviAtual: 0.72,
    ultimaLeitura: "2026-05-27T14:30:00Z",
    coordenadas: { lat: -8.284, lng: -35.975 },
  },
  {
    id: "lav-2",
    propriedadeId: "prop-1",
    cultura: "tomate",
    culturaLabel: "Tomate",
    identificador: "L2",
    areaHectares: 1.8,
    saude: "atencao",
    ndviAtual: 0.58,
    ultimaLeitura: "2026-05-27T14:30:00Z",
    coordenadas: { lat: -8.2835, lng: -35.976 },
  },
  {
    id: "lav-3",
    propriedadeId: "prop-1",
    cultura: "alface",
    culturaLabel: "Alface",
    identificador: "L3",
    areaHectares: 0.8,
    saude: "saudavel",
    ndviAtual: 0.68,
    ultimaLeitura: "2026-05-27T14:30:00Z",
  },
  {
    id: "lav-4",
    propriedadeId: "prop-1",
    cultura: "feijao",
    culturaLabel: "Feijao",
    identificador: "L4",
    areaHectares: 2.1,
    saude: "saudavel",
    ndviAtual: 0.7,
    ultimaLeitura: "2026-05-27T14:30:00Z",
  },
  {
    id: "lav-5",
    propriedadeId: "prop-1",
    cultura: "milho",
    culturaLabel: "Milho",
    identificador: "L5",
    areaHectares: 3.2,
    saude: "saudavel",
    ndviAtual: 0.74,
    ultimaLeitura: "2026-05-27T14:30:00Z",
  },
  {
    id: "lav-6",
    propriedadeId: "prop-1",
    cultura: "mandioca",
    culturaLabel: "Mandioca",
    identificador: "L6",
    areaHectares: 2.1,
    saude: "saudavel",
    ndviAtual: 0.69,
    ultimaLeitura: "2026-05-27T14:30:00Z",
  },
];

export const ALERTAS: Alerta[] = [
  {
    id: "alert-1",
    propriedadeId: "prop-1",
    lavouraId: "lav-2",
    tipo: "seca",
    tipoLabel: "SECA",
    severidade: "alto",
    probabilidade: 0.78,
    janelaDias: 7,
    recomendacao: "Irrigar a Lavoura 2 (Tomate) ate o fim da semana.",
    status: "novo",
    criadoEm: "2026-05-28T06:00:00Z",
  },
  {
    id: "alert-2",
    propriedadeId: "prop-1",
    tipo: "praga",
    tipoLabel: "PRAGA",
    severidade: "medio",
    probabilidade: 0.45,
    janelaDias: 14,
    recomendacao: "Inspecionar folhas das lavouras de milho.",
    status: "visto",
    criadoEm: "2026-05-25T10:00:00Z",
  },
  {
    id: "alert-3",
    propriedadeId: "prop-1",
    tipo: "geada",
    tipoLabel: "GEADA",
    severidade: "baixo",
    probabilidade: 0.18,
    janelaDias: 30,
    recomendacao: "Monitorar tendencia mensal — sem acao agora.",
    status: "novo",
    criadoEm: "2026-05-20T08:00:00Z",
  },
];

/**
 * Retorna o alerta de maior severidade entre os ativos (status "novo" ou
 * "visto"). Se nao houver, retorna null — UI mostra estado "tudo ok hoje".
 * Ordem de severidade: critico > alto > medio > baixo.
 */
export function getCurrentAlert(): Alerta | null {
  const order = { critico: 4, alto: 3, medio: 2, baixo: 1 } as const;
  const ativos = ALERTAS.filter(
    (a) => a.status === "novo" || a.status === "visto",
  );
  if (ativos.length === 0) return null;
  return ativos.reduce((best, cur) =>
    order[cur.severidade] > order[best.severidade] ? cur : best,
  );
}
