// Tipos de dominio do 2F-AGRO. Espelham (e antecipam) o backend .NET
// (FiapAgro.Domain). Quando o backend ficar pronto, os DTOs do C# vao
// projetar pra essas mesmas shapes — minimiza atrito na integracao.
// Domain types: mirror dos DTOs futuros do .NET API.

import type { AlertaSeveridadeKey, AlertaStatusKey, LavouraSaudeKey } from "./theme";

// =====================
// Alerta
// =====================

export type AlertaTipo = "seca" | "praga" | "geada" | "chuva_forte" | "queimada";

export interface Alerta {
  id: string;
  propriedadeId: string;
  /** Lavoura especifica, ou undefined se o alerta vale pra propriedade toda. */
  lavouraId?: string;
  tipo: AlertaTipo;
  /** Label em PT-BR ja resolvido pra UI (ex: "SECA", "PRAGA"). */
  tipoLabel: string;
  severidade: AlertaSeveridadeKey;
  /** 0..1, probabilidade do evento. */
  probabilidade: number;
  /** Janela em dias (ex: 7 = "proximos 7 dias"). */
  janelaDias: number;
  /** Texto curto, imperativo. Max ~80 chars pra caber no card hero. */
  recomendacao: string;
  status: AlertaStatusKey;
  criadoEm: string; // ISO timestamp
}

// =====================
// Lavoura
// =====================

export type CulturaTipo =
  | "milho"
  | "tomate"
  | "alface"
  | "feijao"
  | "mandioca"
  | "soja"
  | "cana";

export interface Lavoura {
  id: string;
  propriedadeId: string;
  cultura: CulturaTipo;
  /** Label PT-BR ("Milho", "Tomate", etc) — facilita render sem map. */
  culturaLabel: string;
  /** Identificador local que o agricultor usa ("L1", "L2"). */
  identificador: string;
  areaHectares: number;
  saude: LavouraSaudeKey;
  /** Normalized Difference Vegetation Index, -1..1. Opcional (Sprint 2). */
  ndviAtual?: number;
  ultimaLeitura?: string; // ISO timestamp
  coordenadas?: { lat: number; lng: number };
  /** ISO timestamp — retornado pelo backend, opcional no mobile. */
  criadoEm?: string;
}

// =====================
// Request types (POST/PUT para o backend)
// =====================

export interface CriarLavouraRequest {
  propriedadeId: string;
  cultura: CulturaTipo;
  identificador: string;
  areaHectares: number;
  saude?: LavouraSaudeKey;
  ndviAtual?: number;
  latitude?: number;
  longitude?: number;
}

// =====================
// Diagnostico de praga (tela Camera "Olho na Folha")
// =====================

/**
 * Slugs das pragas que o modelo pode detectar. Bate com as classes do dataset
 * PlantVillage + pragas brasileiras priorizadas pelo time. "sadia" e a classe
 * negativa (sem praga detectada).
 */
export type PragaTipo =
  | "sadia"
  | "ferrugem_asiatica"
  | "lagarta_do_cartucho"
  | "mancha_foliar"
  | "oidio"
  | "mosca_branca"
  | "broca_do_cafe"
  | "antracnose";

export interface DiagnosticoPraga {
  id: string;
  /** Lavoura associada (opcional — agricultor pode bater foto solta). */
  lavouraId?: string;
  /** URI local da foto (file:// no device, blob: no web). */
  fotoUri: string;
  praga: PragaTipo;
  /** Label PT-BR ja resolvido pra UI ("Ferrugem Asiatica"). */
  pragaLabel: string;
  /** 0..1, confianca do modelo. */
  confianca: number;
  /** Severidade da praga (reusa a paleta do Alerta). "baixo" = sadia/ok. */
  severidade: AlertaSeveridadeKey;
  /** Texto curto, imperativo, voz Seu Joao. Max ~120 chars. */
  recomendacao: string;
  /** Telefone do agronomo da cooperativa (E.164 ou local). */
  agronomoTelefone: string;
  criadoEm: string; // ISO timestamp
}

// =====================
// Detalhe da lavoura (drill-down)
// =====================

/** Leitura NDVI num ponto no tempo — compoe o grafico temporal. */
export interface NdviLeitura {
  data: string; // ISO date (YYYY-MM-DD)
  valor: number; // -1..1
}

/** Predicao do modelo ML (probabilidade de risco + cluster K-Means). */
export interface MlPredicao {
  /** 0..1, probabilidade de risco nos proximos dias. */
  probabilidadeRisco: number;
  /** Indice do cluster K-Means (0..3, k=4). */
  cluster: number;
  /** Label curto do perfil ("Produtivo", "Vulneravel", etc). */
  clusterLabel: string;
  /** Descricao curta do que o cluster significa. */
  clusterDescricao: string;
}

/** Acao recomendada pro agricultor — imperativa, curta. */
export interface AcaoRecomendada {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: "alta" | "media" | "baixa";
}

/** Lavoura completa com dados de drill-down (NDVI temporal, ML, alertas). */
export interface LavouraDetalhe extends Lavoura {
  ndviHistorico: NdviLeitura[];
  mlPredicao: MlPredicao;
  alertas: Alerta[];
  acoesRecomendadas: AcaoRecomendada[];
}

// =====================
// Propriedade
// =====================

export interface Propriedade {
  id: string;
  /** Nome curto da propriedade ("Sitio Boa Vista"). */
  nome: string;
  /** Nome popular do dono ("Seu Joao"). */
  donoNome: string;
  /** Nome completo do dono ("Joao da Silva"). Usado pelo Greeting da home. */
  donoFullName: string;
  municipio: string;
  estado: string;
  lat: number;
  lng: number;
  areaTotalHectares: number;
}
