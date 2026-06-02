// Mock data da cooperativa — propriedades vizinhas no entorno de Caruaru-PE.
// Sprint 1: dados locais. Sprint 2: virá do endpoint GET /cooperativa/propriedades.
// Cada propriedade tem um status geral (pior saúde entre suas lavouras) que
// determina a cor do pino semafórico no mapa.

import type { AlertaTipo } from "./types";
import type { AlertaSeveridadeKey, LavouraSaudeKey } from "./theme";

export interface PropriedadeCooperativa {
  id: string;
  nome: string;
  donoNome: string;
  lat: number;
  lng: number;
  areaTotalHectares: number;
  /** Pior saúde entre as lavouras — define cor do pino. */
  saudeGeral: LavouraSaudeKey;
  /** Alerta ativo de maior severidade (se houver). */
  alertaAtivo?: {
    tipo: AlertaTipo;
    tipoLabel: string;
    severidade: AlertaSeveridadeKey;
    recomendacao: string;
  };
}

/** Propriedades da cooperativa de Caruaru-PE (raio ~5km do centro). */
export const COOPERATIVA_PROPRIEDADES: PropriedadeCooperativa[] = [
  {
    id: "prop-1",
    nome: "Sítio Boa Vista",
    donoNome: "Seu João",
    lat: -8.2839,
    lng: -35.9758,
    areaTotalHectares: 12.5,
    saudeGeral: "atencao",
    alertaAtivo: {
      tipo: "seca",
      tipoLabel: "SECA",
      severidade: "alto",
      recomendacao: "Irrigar lavoura de tomate até o fim da semana.",
    },
  },
  {
    id: "prop-2",
    nome: "Sítio Serra Verde",
    donoNome: "Dona Maria",
    lat: -8.2795,
    lng: -35.9802,
    areaTotalHectares: 8.3,
    saudeGeral: "saudavel",
  },
  {
    id: "prop-3",
    nome: "Fazenda Pedra Bonita",
    donoNome: "Seu Antônio",
    lat: -8.2882,
    lng: -35.9715,
    areaTotalHectares: 15.0,
    saudeGeral: "risco",
    alertaAtivo: {
      tipo: "praga",
      tipoLabel: "PRAGA",
      severidade: "alto",
      recomendacao: "Lagarta-do-cartucho detectada no milho. Pulverizar urgente.",
    },
  },
  {
    id: "prop-4",
    nome: "Sítio Água Fria",
    donoNome: "Seu Manoel",
    lat: -8.2810,
    lng: -35.9690,
    areaTotalHectares: 6.2,
    saudeGeral: "saudavel",
  },
  {
    id: "prop-5",
    nome: "Roça do Zé",
    donoNome: "Seu Zé",
    lat: -8.2860,
    lng: -35.9830,
    areaTotalHectares: 4.8,
    saudeGeral: "atencao",
    alertaAtivo: {
      tipo: "geada",
      tipoLabel: "GEADA",
      severidade: "baixo",
      recomendacao: "Monitorar temperatura nas próximas noites.",
    },
  },
  {
    id: "prop-6",
    nome: "Sítio Esperança",
    donoNome: "Dona Francisca",
    lat: -8.2770,
    lng: -35.9740,
    areaTotalHectares: 9.1,
    saudeGeral: "saudavel",
  },
  {
    id: "prop-7",
    nome: "Fazenda Nova Vida",
    donoNome: "Seu Carlos",
    lat: -8.2905,
    lng: -35.9780,
    areaTotalHectares: 11.7,
    saudeGeral: "perdida",
    alertaAtivo: {
      tipo: "queimada",
      tipoLabel: "QUEIMADA",
      severidade: "critico",
      recomendacao: "Incêndio próximo registrado. Evacuar animais.",
    },
  },
];
