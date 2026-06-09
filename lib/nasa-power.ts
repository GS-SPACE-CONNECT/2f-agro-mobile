// Integração real com a API NASA POWER — dados climáticos via satélite.
// Endpoint público, sem autenticação. Comunidade "AG" (agricultura).
// Documentação: https://power.larc.nasa.gov/docs/services/api/
//
// Parâmetros usados:
//   T2M             — temperatura do ar a 2 metros (°C)
//   PRECTOTCORR     — precipitação total corrigida (mm/dia)
//   ALLSKY_SFC_SW_DWN — radiação solar incidente na superfície (kWh/m²/dia)

/** Dados climáticos resumidos retornados pela NASA POWER. */
export interface DadosClimaSatelite {
  /** Temperatura média do ar a 2m (°C). */
  temperaturaMedia: number;
  /** Precipitação média corrigida (mm/dia). */
  precipitacao: number;
  /** Radiação solar incidente média (kWh/m²/dia). */
  radiacaoSolar: number;
  /** Data ISO (YYYY-MM-DD) da leitura mais recente usada. */
  dataLeitura: string;
  /** Quantidade de dias válidos usados na média. */
  diasValidos: number;
}

// Sentinel da NASA POWER para "sem dados disponíveis".
const SEM_DADOS = -999;

const TIMEOUT_MS = 12_000;
const JANELA_DIAS = 14;
const DIAS_MEDIA = 3;

/** Formata Date para YYYYMMDD (formato NASA POWER). */
function fmtData(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dia}`;
}

/** Converte YYYYMMDD para ISO YYYY-MM-DD. */
function yyyymmddParaIso(s: string): string {
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

// Tipagem da resposta da NASA POWER (só os campos que usamos).
interface NasaPowerResponse {
  properties: {
    parameter: {
      T2M: Record<string, number>;
      PRECTOTCORR: Record<string, number>;
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

/** Busca dados climáticos reais da NASA POWER para as coordenadas da fazenda. */
export async function buscarClimaSatelite(
  lat: number,
  lng: number,
): Promise<DadosClimaSatelite> {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - JANELA_DIAS);

  const params = new URLSearchParams({
    parameters: "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
    community: "AG",
    longitude: lng.toFixed(4),
    latitude: lat.toFixed(4),
    start: fmtData(inicio),
    end: fmtData(hoje),
    format: "JSON",
  });

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`NASA POWER HTTP ${resp.status}`);
    }
    const json = (await resp.json()) as NasaPowerResponse;
    return parsearResposta(json);
  } finally {
    clearTimeout(timer);
  }
}

/** Extrai média dos últimos dias válidos da resposta da NASA POWER. */
function parsearResposta(json: NasaPowerResponse): DadosClimaSatelite {
  const { T2M, PRECTOTCORR, ALLSKY_SFC_SW_DWN } = json.properties.parameter;

  // Datas em ordem cronológica
  const datas = Object.keys(T2M).sort();

  // Filtra dias onde TODOS os 3 parâmetros têm dados válidos
  const validos = datas.filter(
    (d) =>
      T2M[d] !== SEM_DADOS &&
      PRECTOTCORR[d] !== SEM_DADOS &&
      ALLSKY_SFC_SW_DWN[d] !== SEM_DADOS,
  );

  if (validos.length === 0) {
    throw new Error("Nenhum dado válido da NASA POWER nos últimos 14 dias.");
  }

  // Pega os últimos N dias válidos
  const ultimos = validos.slice(-DIAS_MEDIA);

  const media = (param: Record<string, number>) =>
    ultimos.reduce((sum, d) => sum + param[d], 0) / ultimos.length;

  const ultimaData = ultimos[ultimos.length - 1];

  return {
    temperaturaMedia: Math.round(media(T2M) * 10) / 10,
    precipitacao: Math.round(media(PRECTOTCORR) * 10) / 10,
    radiacaoSolar: Math.round(media(ALLSKY_SFC_SW_DWN) * 10) / 10,
    dataLeitura: yyyymmddParaIso(ultimaData),
    diasValidos: ultimos.length,
  };
}
