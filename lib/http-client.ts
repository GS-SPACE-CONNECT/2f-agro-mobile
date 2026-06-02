// Cliente HTTP do 2F-AGRO — wrapper de fetch com JWT, retry com backoff
// exponencial e mensagens de erro amigáveis em PT-BR.
// Nenhuma dependência externa — usa fetch nativo do React Native.

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { STORAGE_KEYS } from "./storage-keys";

// =====================
// ApiError
// =====================

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

// =====================
// Tipos internos
// =====================

export interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | undefined>;
  /** Pula o header Authorization (para /auth/login). */
  skipAuth?: boolean;
  /** Quantidade máxima de retries (default 3). */
  retries?: number;
}

/** Formato RFC 7807 Problem Details retornado pelo backend .NET. */
interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
}

// =====================
// Helpers
// =====================

function getBaseUrl(): string {
  return (
    (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
    "http://localhost:5001"
  );
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = getBaseUrl();
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Status codes que justificam retry (transitórios). */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/** Traduz status HTTP + detail RFC 7807 para mensagem amigável PT-BR. */
function mensagemErro(status: number, detail?: string): string {
  if (status === 0) return "Sem conexão. Verifique sua internet e tente novamente.";
  if (status === 401) return "Sessão expirada. Faça login novamente.";
  if (status === 403) return "Você não tem permissão para esta ação.";
  if (status === 404) return detail ?? "Recurso não encontrado.";
  if (status === 400) return detail ?? "Dados inválidos. Verifique e tente novamente.";
  if (status === 422) return detail ?? "Não foi possível processar a solicitação.";
  if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";
  return detail ?? "Erro inesperado. Tente novamente.";
}

/** Tenta extrair `detail` do body RFC 7807. Se não conseguir, retorna undefined. */
async function extrairDetail(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as ProblemDetails;
    return body.detail ?? body.title ?? undefined;
  } catch {
    return undefined;
  }
}

// =====================
// Fetch core
// =====================

async function doFetch<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const { method = "GET", body, formData, params, skipAuth = false } = opts;

  const headers: Record<string, string> = {};

  // JWT — lê direto do SecureStore (sem importar auth.ts → sem circular dep)
  if (!skipAuth) {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let fetchBody: BodyInit | undefined;
  if (formData) {
    // multipart/form-data — o fetch do RN seta Content-Type + boundary automaticamente
    fetchBody = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  // 401 — limpa token (sessão expirada)
  if (response.status === 401 && !skipAuth) {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT);
  }

  if (!response.ok) {
    const detail = await extrairDetail(response);
    throw new ApiError(mensagemErro(response.status, detail), response.status);
  }

  // 204 No Content — sem body pra parsear
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// =====================
// Retry com backoff exponencial
// =====================

async function requestWithRetry<T>(
  path: string,
  opts: HttpOptions,
  attempt = 0,
): Promise<T> {
  try {
    return await doFetch<T>(path, opts);
  } catch (e) {
    const maxRetries = opts.retries ?? 3;

    // Retry em: erro de rede (TypeError) ou status transitório
    const retryable =
      e instanceof TypeError ||
      (e instanceof ApiError && RETRYABLE_STATUS.has(e.status));

    if (retryable && attempt < maxRetries) {
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
      await sleep(delayMs);
      return requestWithRetry<T>(path, opts, attempt + 1);
    }

    // Erro de rede que esgotou retries — mapeia pra ApiError amigável
    if (e instanceof TypeError) {
      throw new ApiError(mensagemErro(0), 0);
    }

    throw e;
  }
}

// =====================
// API pública
// =====================

/** Faz uma requisição HTTP para o backend com JWT, retry e error handling. */
export async function request<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  return requestWithRetry<T>(path, opts, 0);
}

/** Retorna a base URL configurada (util pra resolver URIs relativas). */
export { getBaseUrl };
