// Auth do 2F-AGRO — JWT armazenado no SecureStore, session metadata no
// AsyncStorage. signIn() chama POST /api/auth/login; se o backend não
// estiver disponível (Sprint 1 / dev), faz fallback pra sessão mock.
// Interface auth.* mantida estável — _layout.tsx não precisa mudar.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { request, ApiError } from "./http-client";
import { STORAGE_KEYS } from "./storage-keys";

export interface Session {
  user: {
    id: string;
    nome: string;
    fullName: string;
  };
}

/** Shape esperada da resposta de POST /api/auth/login. */
interface LoginResponse {
  token: string;
  user: {
    id: string;
    nome: string;
    fullName: string;
  };
}

const MOCK_SESSION: Session = {
  user: {
    id: "user-1",
    nome: "Seu João",
    fullName: "João da Silva",
  },
};

export const auth = {
  /** Retorna sessão persistida ou null se não logado. */
  async getSession(): Promise<Session | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Session;
      // Verifica se o JWT ainda existe no SecureStore
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT);
      if (!token) {
        // Token foi removido (expirado/limpo) — sessão inválida
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Autentica com email e senha via POST /api/auth/login.
   * Se o backend não estiver disponível, faz fallback para mock (dev/demo).
   */
  async signIn(email: string, senha: string): Promise<Session> {
    try {
      const resp = await request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email, senha },
        skipAuth: true,
        retries: 1,
      });

      // Salva JWT no SecureStore (encriptado)
      await SecureStore.setItemAsync(STORAGE_KEYS.JWT, resp.token);

      const session: Session = { user: resp.user };
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      return session;
    } catch (e) {
      // Fallback: se o backend não está disponível (rede/404/500 em dev),
      // usa sessão mock pra não quebrar a demo Sprint 1.
      if (
        e instanceof TypeError ||
        (e instanceof ApiError && (e.status === 0 || e.status >= 500 || e.status === 404))
      ) {
        // Mock token — não é JWT real, mas permite fluxo de demo
        await SecureStore.setItemAsync(STORAGE_KEYS.JWT, "mock-token-dev");
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(MOCK_SESSION));
        return MOCK_SESSION;
      }
      throw e;
    }
  },

  /** Remove JWT e session — desloga o usuário. */
  async signOut(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT);
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  /** Retorna o JWT armazenado (ou null). Usado internamente pelo http-client. */
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.JWT);
  },
};
