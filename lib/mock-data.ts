// Mock data pro Sprint 1 — app roda 100% sem backend.
// Quando o .NET API estiver pronto, lib/api.ts troca o source mas mantem
// a mesma interface. Dados sao plausiveis (Caruaru-PE, 12.5ha, culturas
// do semiarido) pra que demo nao pareca artificial.
// Mock data Sprint 1: roda sem backend, dados realistas pra demo.

import type {
  Alerta,
  DiagnosticoPraga,
  Lavoura,
  PragaTipo,
  Propriedade,
} from "./types";

export const PROPRIEDADE: Propriedade = {
  id: "prop-1",
  nome: "Sítio Boa Vista",
  donoNome: "Seu João",
  donoFullName: "João da Silva",
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
    culturaLabel: "Feijão",
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
    recomendacao: "Irrigar a Lavoura 2 (Tomate) até o fim da semana.",
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
    recomendacao: "Monitorar tendência mensal — sem ação agora.",
    status: "novo",
    criadoEm: "2026-05-20T08:00:00Z",
  },
];

// =====================
// Diagnostico de praga (tela Camera "Olho na Folha")
// =====================

/** Template do que o "modelo" pode devolver. Sprint 1 sorteia uma entrada
 *  destas; Sprint 2 troca por inferencia real (POST API ou ONNX local).
 *  Mantenha 5-8 entradas pra demo plausivel — uma sadia + pragas das
 *  culturas listadas acima (milho, tomate, alface, feijao, mandioca).
 */
type PragaTemplate = Omit<
  DiagnosticoPraga,
  "id" | "fotoUri" | "criadoEm" | "lavouraId"
>;

// ============================================================
// PRAGAS_DETECTAVEIS  ←  jota: preencher 5-8 entradas aqui.
// ------------------------------------------------------------
// Diretriz pro pitch:
//  - Texto curto na voz de "Seu Joao" (imperativo, sem jargao).
//  - recomendacao max ~120 chars (cabe no card).
//  - confianca: 0.62..0.94 (modelo nunca fala 100%).
//  - severidade: alto/critico pras pragas que matam safra rapido,
//    medio pras manejaveis, baixo pra sadia.
//  - 1 entrada "sadia" pra demonstrar happy path.
// ============================================================
export const PRAGAS_DETECTAVEIS: PragaTemplate[] = [
  // --- Exemplo 1: SADIA (happy path) ---
  {
    praga: "sadia",
    pragaLabel: "Sadia",
    confianca: 0.91,
    severidade: "baixo",
    recomendacao: "Folha saudável. Continue a rotina de irrigação atual.",
    agronomoTelefone: "+5581999990000",
  },
  // --- Exemplo 2: FERRUGEM ASIATICA (alto risco — culturas: soja, feijao) ---
  {
    praga: "ferrugem_asiatica",
    pragaLabel: "Ferrugem Asiática",
    confianca: 0.87,
    severidade: "alto",
    recomendacao:
      "Pulverize fungicida nas próximas 48 horas. Comece pelas folhas baixeiras.",
    agronomoTelefone: "+5581999990000",
  },
  // TODO(jota): +3 a 6 entradas. Sugestoes pra preencher:
  //   - lagarta_do_cartucho   (milho, severidade: alto)
  //   - mancha_foliar         (varias, severidade: medio)
  //   - oidio                 (tomate/alface, severidade: medio)
  //   - mosca_branca          (tomate, severidade: alto)
  //   - antracnose            (feijao/mandioca, severidade: medio)
  //
  // Modelo:
  // {
  //   praga: "lagarta_do_cartucho",
  //   pragaLabel: "Lagarta-do-cartucho",
  //   confianca: 0.79,
  //   severidade: "alto",
  //   recomendacao: "...",
  //   agronomoTelefone: "+5581999990000",
  // },
];

/**
 * Sprint 1: sorteia uma entrada do template, materializa em DiagnosticoPraga
 * com a foto/timestamp atuais. Sprint 2: substituido por POST API ou ONNX.
 */
export function gerarDiagnosticoMock(
  fotoUri: string,
  lavouraId?: string,
): DiagnosticoPraga {
  if (PRAGAS_DETECTAVEIS.length === 0) {
    // Fallback defensivo se ninguem preencheu PRAGAS_DETECTAVEIS — nunca
    // deve acontecer em demo, mas evita crash silencioso.
    return {
      id: `diag-${Date.now()}`,
      lavouraId,
      fotoUri,
      praga: "sadia",
      pragaLabel: "Sadia",
      confianca: 0.5,
      severidade: "baixo",
      recomendacao: "Não foi possível identificar. Tente outra foto.",
      agronomoTelefone: "+5581999990000",
      criadoEm: new Date().toISOString(),
    };
  }
  const pick =
    PRAGAS_DETECTAVEIS[Math.floor(Math.random() * PRAGAS_DETECTAVEIS.length)];
  return {
    id: `diag-${Date.now()}`,
    lavouraId,
    fotoUri,
    criadoEm: new Date().toISOString(),
    ...pick,
  };
}

/** Resolve label PT-BR pra um slug (util quando vier dado do backend). */
export function pragaLabel(praga: PragaTipo): string {
  const found = PRAGAS_DETECTAVEIS.find((p) => p.praga === praga);
  return found?.pragaLabel ?? praga;
}

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
