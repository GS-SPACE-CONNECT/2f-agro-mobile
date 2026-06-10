import { enableScreens } from "react-native-screens";
import { Ionicons } from "@expo/vector-icons";

// Sem isso, react-native-screens desliga em web e bottom-tabs caem em fallback
// que nao esconde abas inativas. Forcar enableScreens(true) rota pro Screen.web
// que aplica display:'none' nas inativas.
enableScreens(true);

// Importar background-sync no top-level — defineTask DEVE ser registrado
// antes de qualquer render pra que o TaskManager encontre a task.
import "@/lib/background-sync";

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import "@/i18n";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { LocaleProvider } from "@/context/LocaleContext";
import { NavigationThemeBridge, ThemeProvider, useTheme } from "@/context/ThemeContext";
import { TTSProvider } from "@/context/TTSContext";
import { UserLocationProvider } from "@/context/UserLocationContext";
import { auth } from "@/lib/auth";
import { registrarBackgroundSync } from "@/lib/background-sync";
import { queryClient, asyncStoragePersister } from "@/lib/query-client";
import { processarFila } from "@/lib/offline-queue";

export default function RootLayout() {
  // Registra background-sync e tenta processar fila pendente no boot
  useEffect(() => {
    void registrarBackgroundSync();
    void processarFila();
  }, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <ThemeProvider>
          <NavigationThemeBridge>
            <LocaleProvider>
              <TTSProvider>
                <UserLocationProvider>
                  <RootStack />
                </UserLocationProvider>
              </TTSProvider>
            </LocaleProvider>
          </NavigationThemeBridge>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { colors, mode, isHydrated: themeHydrated } = useTheme();
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium_Italic,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Espera a primeira leitura da sessão antes de montar o Stack — evita
  // flash da tela errada no boot.
  useEffect(() => {
    let cancelled = false;
    auth.getSession().then(() => {
      if (cancelled) return;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useGuardedRedirect(ready && themeHydrated);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <MeshBackground />
      {!ready || !themeHydrated || !fontsLoaded ? null : (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="lavoura/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="lavoura/nova" options={{ headerShown: false }} />
          <Stack.Screen name="alerta/[id]" options={{ headerShown: false }} />
        </Stack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

function useGuardedRedirect(ready: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    // Lê a sessão do storage a cada navegação: signIn/signOut não emitem
    // evento, então qualquer estado capturado no boot fica stale — o guard
    // devolveria o usuário pro login logo após entrar (e vice-versa no sair).
    void auth.getSession().then((s) => {
      if (cancelled) return;
      const onLogin = segments[0] === "login";
      if (!s && !onLogin) {
        router.replace("/login");
      } else if (s && onLogin) {
        router.replace("/");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready, segments, router]);
}
