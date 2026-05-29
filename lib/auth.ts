// Auth mockada Sprint 1 — sessao hardcoded ("Seu Joao") persistida em
// AsyncStorage. Sprint 2 substitui por chamadas ao .NET API (/auth/login,
// /auth/refresh). Interface auth.* fica estavel.
// Auth: mock no Sprint 1, .NET API no Sprint 2.

import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "./storage-keys";

export interface Session {
  user: {
    id: string;
    nome: string;
    fullName: string;
  };
}

const MOCK_SESSION: Session = {
  user: {
    id: "user-1",
    nome: "Seu Joao",
    fullName: "Joao da Silva",
  },
};

export const auth = {
  /** Retorna sessao persistida ou null se nao logado. */
  async getSession(): Promise<Session | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      // Storage corrompido — trata como nao logado pra nao crashar.
      return null;
    }
  },

  /** Loga como Seu Joao (mock). Sprint 2: signIn(email, senha). */
  async signIn(): Promise<Session> {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(MOCK_SESSION));
    return MOCK_SESSION;
  },

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};
