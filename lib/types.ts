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
