import { enableScreens } from "react-native-screens";
import { Ionicons } from "@expo/vector-icons";

// Sem isso, react-native-screens desliga em web e bottom-tabs caem em fallback
// que nao esconde abas inativas. Forcar enableScreens(true) rota pro Screen.web
// que aplica display:'none' nas inativas.
enableScreens(true);

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
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import "@/i18n";
import { IntroVideo } from "@/components/ui/IntroVideo";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { LocaleProvider } from "@/context/LocaleContext";
import { NavigationThemeBridge, ThemeProvider, useTheme } from "@/context/ThemeContext";
import { UserLocationProvider } from "@/context/UserLocationContext";
import { auth, type Session } from "@/lib/auth";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationThemeBridge>
          <LocaleProvider>
            <UserLocationProvider>
              <RootStack />
            </UserLocationProvider>
          </LocaleProvider>
        </NavigationThemeBridge>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { colors, mode, isHydrated: themeHydrated } = useTheme();
  const [introDone, setIntroDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

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

  // Auth mock: le sessao persistida ao boot. Sprint 2 sobe pra refresh
  // token + listener de mudancas como o Supabase fazia.
  useEffect(() => {
    let cancelled = false;
    auth.getSession().then((s) => {
      if (cancelled) return;
      setSession(s);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useGuardedRedirect(ready && introDone && themeHydrated, session);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <MeshBackground />
      {!introDone ? (
        <IntroVideo onFinished={() => setIntroDone(true)} />
      ) : !ready || !themeHydrated || !fontsLoaded ? null : (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "" }} />
          <Stack.Screen name="lavoura/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="alerta/[id]" options={{ headerShown: false }} />
        </Stack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

function useGuardedRedirect(ready: boolean, session: Session | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const onLogin = segments[0] === "login";
    if (!session && !onLogin) {
      router.replace("/login");
    } else if (session && onLogin) {
      router.replace("/");
    }
  }, [ready, session, segments, router]);
}
