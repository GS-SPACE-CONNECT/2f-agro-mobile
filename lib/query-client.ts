// Configuração central do React Query com persistência offline.
// Cache salvo no AsyncStorage — sobrevive a reinícios do app.
// onlineManager integrado ao NetInfo — queries pausam quando offline.
// focusManager integrado ao AppState — refetch automático ao voltar pro app.

import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { STORAGE_KEYS } from "./storage-keys";

// ---------------------------------------------------------------------------
// QueryClient
// ---------------------------------------------------------------------------

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h — mantém cache por um dia
      staleTime: 1000 * 60 * 5,     // 5min — serve stale enquanto revalida
      retry: 2,
      networkMode: "offlineFirst",   // Serve cache mesmo offline
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

// ---------------------------------------------------------------------------
// Persister (AsyncStorage)
// ---------------------------------------------------------------------------

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: STORAGE_KEYS.QUERY_CACHE,
});

// ---------------------------------------------------------------------------
// Online Manager — sincroniza React Query com estado real de rede
// ---------------------------------------------------------------------------

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// ---------------------------------------------------------------------------
// Focus Manager — refetch ao voltar pro app (só nativo, web já tem)
// ---------------------------------------------------------------------------

if (Platform.OS !== "web") {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        setFocused(status === "active");
      },
    );
    return () => subscription.remove();
  });
}

// ---------------------------------------------------------------------------
// Hook: useIsOnline — estado reativo de conectividade
// ---------------------------------------------------------------------------

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((online) => setIsOnline(online));
  }, []);

  return isOnline;
}
