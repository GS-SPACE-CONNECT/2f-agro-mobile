// Mock data pro Sprint 1 — app roda 100% sem backend.
// Quando o .NET API estiver pronto, lib/api.ts troca o source mas mantem
// a mesma interface. Dados sao plausiveis (Caruaru-PE, 12.5ha, culturas
// do semiarido) pra que demo nao pareca artificial.
// Mock data Sprint 1: roda sem backend, dados realistas pra demo.

import type {
  AcaoRecomendada,
  Alerta,
  DiagnosticoPraga,
  Lavoura,
  LavouraDetalhe,
  MlPredicao,
  NdviLeitura,
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

// =====================
// Detalhe da lavoura (drill-down)
// =====================

/** Perfis K-Means (k=4). Indice do array = numero do cluster. */
const CLUSTER_PERFIS: Omit<MlPredicao, "probabilidadeRisco">[] = [
  {
    cluster: 0,
    clusterLabel: "Produtivo",
    clusterDescricao:
      "NDVI alto e estável. Solo bem nutrido, irrigação regular.",
  },
  {
    cluster: 1,
    clusterLabel: "Estável",
    clusterDescricao:
      "NDVI moderado. Produção constante, sem riscos iminentes.",
  },
  {
    cluster: 2,
    clusterLabel: "Vulnerável",
    clusterDescricao:
      "NDVI em declínio. Atenção a pragas e déficit hídrico.",
  },
  {
    cluster: 3,
    clusterLabel: "Crítico",
    clusterDescricao:
      "NDVI muito baixo. Risco de perda — ação urgente necessária.",
  },
];

/** Historico NDVI por lavoura (Jan–Jul 2026). */
const NDVI_HISTORICO: Record<string, NdviLeitura[]> = {
  "lav-1": [
    { data: "2026-01-15", valor: 0.32 },
    { data: "2026-02-15", valor: 0.41 },
    { data: "2026-03-15", valor: 0.48 },
    { data: "2026-04-15", valor: 0.55 },
    { data: "2026-05-15", valor: 0.63 },
    { data: "2026-06-15", valor: 0.68 },
    { data: "2026-07-15", valor: 0.72 },
  ],
  "lav-2": [
    { data: "2026-01-15", valor: 0.65 },
    { data: "2026-02-15", valor: 0.68 },
    { data: "2026-03-15", valor: 0.64 },
    { data: "2026-04-15", valor: 0.61 },
    { data: "2026-05-15", valor: 0.55 },
    { data: "2026-06-15", valor: 0.52 },
    { data: "2026-07-15", valor: 0.58 },
  ],
  "lav-3": [
    { data: "2026-01-15", valor: 0.22 },
    { data: "2026-02-15", valor: 0.35 },
    { data: "2026-03-15", valor: 0.50 },
    { data: "2026-04-15", valor: 0.62 },
    { data: "2026-05-15", valor: 0.70 },
    { data: "2026-06-15", valor: 0.65 },
    { data: "2026-07-15", valor: 0.68 },
  ],
  "lav-4": [
    { data: "2026-01-15", valor: 0.38 },
    { data: "2026-02-15", valor: 0.45 },
    { data: "2026-03-15", valor: 0.52 },
    { data: "2026-04-15", valor: 0.58 },
    { data: "2026-05-15", valor: 0.64 },
    { data: "2026-06-15", valor: 0.68 },
    { data: "2026-07-15", valor: 0.70 },
  ],
  "lav-5": [
    { data: "2026-01-15", valor: 0.30 },
    { data: "2026-02-15", valor: 0.42 },
    { data: "2026-03-15", valor: 0.51 },
    { data: "2026-04-15", valor: 0.59 },
    { data: "2026-05-15", valor: 0.66 },
    { data: "2026-06-15", valor: 0.71 },
    { data: "2026-07-15", valor: 0.74 },
  ],
  "lav-6": [
    { data: "2026-01-15", valor: 0.45 },
    { data: "2026-02-15", valor: 0.48 },
    { data: "2026-03-15", valor: 0.52 },
    { data: "2026-04-15", valor: 0.56 },
    { data: "2026-05-15", valor: 0.60 },
    { data: "2026-06-15", valor: 0.65 },
    { data: "2026-07-15", valor: 0.69 },
  ],
};

/** Predicao ML por lavoura. */
const ML_PREDICOES: Record<string, MlPredicao> = {
  "lav-1": { probabilidadeRisco: 0.12, ...CLUSTER_PERFIS[0] },
  "lav-2": { probabilidadeRisco: 0.45, ...CLUSTER_PERFIS[2] },
  "lav-3": { probabilidadeRisco: 0.08, ...CLUSTER_PERFIS[1] },
  "lav-4": { probabilidadeRisco: 0.15, ...CLUSTER_PERFIS[0] },
  "lav-5": { probabilidadeRisco: 0.10, ...CLUSTER_PERFIS[0] },
  "lav-6": { probabilidadeRisco: 0.18, ...CLUSTER_PERFIS[1] },
};

/** Acoes recomendadas por lavoura. */
const ACOES: Record<string, AcaoRecomendada[]> = {
  "lav-1": [
    {
      id: "acao-1-1",
      titulo: "Manter irrigação",
      descricao: "Continue a rotina atual. Solo com umidade adequada.",
      prioridade: "baixa",
    },
    {
      id: "acao-1-2",
      titulo: "Adubação de cobertura",
      descricao: "Aplicar nitrogênio na próxima quinzena para floração.",
      prioridade: "media",
    },
  ],
  "lav-2": [
    {
      id: "acao-2-1",
      titulo: "Irrigar até fim da semana",
      descricao: "Déficit hídrico detectado. Priorizar esta lavoura.",
      prioridade: "alta",
    },
    {
      id: "acao-2-2",
      titulo: "Inspecionar folhas",
      descricao: "Modelo indica risco de praga. Verificar face inferior.",
      prioridade: "alta",
    },
    {
      id: "acao-2-3",
      titulo: "Consultar agrônomo",
      descricao: "NDVI em queda. Avaliar ajuste no manejo.",
      prioridade: "media",
    },
  ],
  "lav-3": [
    {
      id: "acao-3-1",
      titulo: "Colher na próxima semana",
      descricao: "Ciclo da alface próximo do fim. Colher antes que amargue.",
      prioridade: "media",
    },
  ],
  "lav-4": [
    {
      id: "acao-4-1",
      titulo: "Manter rotina",
      descricao: "Feijão crescendo bem. Nenhuma ação urgente.",
      prioridade: "baixa",
    },
  ],
  "lav-5": [
    {
      id: "acao-5-1",
      titulo: "Manter rotina",
      descricao: "Milho com NDVI excelente. Continuar irrigação.",
      prioridade: "baixa",
    },
  ],
  "lav-6": [
    {
      id: "acao-6-1",
      titulo: "Verificar pragas",
      descricao: "Mandioca estável, mas época de mosca branca.",
      prioridade: "media",
    },
  ],
};

/**
 * Monta o detalhe completo de uma lavoura, juntando dados base + NDVI
 * historico + predicao ML + alertas filtrados + acoes recomendadas.
 */
export function getDetalheLavoura(id: string): LavouraDetalhe | null {
  const base = LAVOURAS.find((l) => l.id === id);
  if (!base) return null;

  const alertas = ALERTAS.filter(
    (a) => a.lavouraId === id,
  );

  return {
    ...base,
    ndviHistorico: NDVI_HISTORICO[id] ?? [],
    mlPredicao: ML_PREDICOES[id] ?? {
      probabilidadeRisco: 0,
      ...CLUSTER_PERFIS[1],
    },
    alertas,
    acoesRecomendadas: ACOES[id] ?? [],
  };
}
