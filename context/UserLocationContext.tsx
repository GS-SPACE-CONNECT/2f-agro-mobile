// UserLocationProvider: propriedade do usuario (fazenda), carregada via
// api.getMinhaPropriedade() ao boot. Consumida pelo Globe (marker cobe)
// e por componentes que mostram cidade/nome do dono.
// Provider da propriedade do usuario (fazenda).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/lib/api";
import type { Propriedade } from "@/lib/types";

interface UserLocationContextValue {
  propriedade: Propriedade | null;
  reload: () => Promise<void>;
  isHydrated: boolean;
}

const UserLocationContext = createContext<UserLocationContextValue | undefined>(undefined);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const reload = useCallback(async () => {
    try {
      const p = await api.getMinhaPropriedade();
      setPropriedade(p);
    } catch {
      // Sprint 1: mock nao falha. Sprint 2: tratar erro de API.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getMinhaPropriedade()
      .then((p) => {
        if (!cancelled) setPropriedade(p);
      })
      .catch(() => {
        // Sprint 1: mock nao falha.
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<UserLocationContextValue>(
    () => ({ propriedade, reload, isHydrated }),
    [propriedade, reload, isHydrated],
  );

  return (
    <UserLocationContext.Provider value={value}>
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation(): UserLocationContextValue {
  const ctx = useContext(UserLocationContext);
  if (!ctx) {
    throw new Error("useUserLocation must be used inside <UserLocationProvider>");
  }
  return ctx;
}
