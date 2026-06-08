// Home 2F-AGRO — "Sua roça hoje". Composição premium minimalista.
// Layout (TOP → BOTTOM):
//   - AppBackground gradient vertical
//   - Hero area:
//       Greeting "Bom dia, Seu João" Playfair 36 (saudação por hora do dia)
//       RotatingClock + Globe DOM (decoração)
//       AlertCardHero com botão 🔊 Ouvir (TTS via expo-speech)
//   - Section title "Minhas lavouras" Playfair italic
//   - Lista vertical de LavouraRow
//   - Botões de ação: Tirar foto / Mapa / Cooperativa

import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import Globe from "@/components/illustrations/Globe.dom";
import { RotatingClock } from "@/components/illustrations/RotatingClock";
import { AlertCardHero } from "@/components/domain/AlertCardHero";
import { AlertCardHeroSkeleton } from "@/components/domain/AlertCardHeroSkeleton";
import { ClimaCard } from "@/components/domain/ClimaCard";
import { LavouraRow } from "@/components/domain/LavouraRow";
import { LavouraRowSkeleton } from "@/components/domain/LavouraRowSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useTheme } from "@/context/ThemeContext";
import { useTTS } from "@/context/TTSContext";
import { useUserLocation } from "@/context/UserLocationContext";
import { useLavouras, useAlertaAtual, useClimaSatelite } from "@/hooks/useQueries";
import { haptic } from "@/lib/haptics";
import { speak } from "@/lib/tts";
import type { Alerta, Lavoura } from "@/lib/types";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

const TOP_VISIBLE = 6;
const LIST_HORIZONTAL_PADDING = 0; // rows ja tem padding interno
const SECTION_HORIZONTAL_PADDING = 30;
const HERO_AREA_HEIGHT = 490;

/** Retorna a chave i18n de saudação adequada à hora do dia. */
function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "home.greeting_morning";
  if (hour < 18) return "home.greeting_afternoon";
  return "home.greeting_evening";
}

const Greeting = memo(function Greeting({ name }: { name: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Text
      style={styles.greeting}
      numberOfLines={2}
      accessibilityRole="header"
    >
      {t(getGreetingKey(), { name })}
    </Text>
  );
});

const HeroDecoration = memo(function HeroDecoration({
  markerLat,
  markerLng,
}: {
  markerLat: number;
  markerLng: number;
}) {
  return (
    <>
      {/* Globo aceita drag horizontal pra girar — sem pointerEvents:none. */}
      <View style={decorationStyles.globeWrap}>
        <Globe size={320} markerLat={markerLat} markerLng={markerLng} />
      </View>
      <View style={decorationStyles.clockWrap} pointerEvents="none">
        <RotatingClock />
      </View>
    </>
  );
});

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { propriedade } = useUserLocation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // React Query: cache offline automático via persistQueryClient
  const lavourasQuery = useLavouras();
  const alertaQuery = useAlertaAtual();

  // Dados climáticos reais do satélite (NASA POWER API)
  const markerLat = propriedade?.lat ?? -8.2839;
  const markerLng = propriedade?.lng ?? -35.9758;
  const climaQuery = useClimaSatelite(markerLat, markerLng);

  const lavouras = lavourasQuery.data ?? [];
  const alerta = alertaQuery.data ?? null;
  const initialLoading =
    lavourasQuery.isLoading && !lavourasQuery.data;
  const error =
    lavourasQuery.error?.message ?? alertaQuery.error?.message ?? null;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([lavourasQuery.refetch(), alertaQuery.refetch()]);
    setRefreshing(false);
  }, [lavourasQuery, alertaQuery]);

  const topLavouras = useMemo(() => lavouras.slice(0, TOP_VISIBLE), [lavouras]);

  const { speed: ttsSpeed } = useTTS();

  const handleListen = useCallback(
    (a: Alerta) => {
      const texto = `${a.tipoLabel}. ${a.recomendacao}`;
      void speak(texto, ttsSpeed);
    },
    [ttsSpeed],
  );

  const handleAlertPress = useCallback((a: Alerta) => {
    router.push(`/alerta/${a.id}` as never);
  }, []);

  const displayName = propriedade?.donoNome ?? "";

  const retryAll = useCallback(() => {
    void lavourasQuery.refetch();
    void alertaQuery.refetch();
  }, [lavourasQuery, alertaQuery]);

  return (
    <AppBackground>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={initialLoading ? [] : topLavouras}
        keyExtractor={(l) => l.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.heroArea}>
              <Greeting name={displayName} />
              <HeroDecoration markerLat={markerLat} markerLng={markerLng} />
              <View style={styles.alertWrap}>
                {initialLoading ? (
                  <AlertCardHeroSkeleton />
                ) : (
                  <AlertCardHero
                    alerta={alerta}
                    onListen={handleListen}
                    onPress={handleAlertPress}
                  />
                )}
              </View>
            </View>
            {climaQuery.data ? (
              <ClimaCard dados={climaQuery.data} />
            ) : null}
            {error && lavouras.length > 0 ? (
              <View style={styles.errorWrap}>
                <ErrorBanner message={error} onRetry={retryAll} />
              </View>
            ) : null}
            {(initialLoading || topLavouras.length > 0) ? (
              <Text style={styles.sectionTitle}>{t("home.lavouras_section")}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          initialLoading ? (
            <View>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <LavouraRowSkeleton key={i} isLast={i === 5} />
              ))}
            </View>
          ) : error ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="cloud-offline-outline"
                title={t("home.error_title")}
                description={error}
              />
              <Pressable
                onPress={retryAll}
                style={({ pressed }) => [
                  styles.retryPill,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.retryPillLabel}>{t("common.retry")}</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState
              icon="leaf-outline"
              title={t("home.empty_title")}
              description={t("home.empty_description")}
            />
          )
        }
        ListFooterComponent={
          !initialLoading && topLavouras.length > 0 ? (
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => {
                  haptic.light();
                  router.push("/camera" as never);
                }}
                accessibilityRole="button"
                accessibilityLabel={t("home.foto_folha_cta")}
              >
                <Ionicons name="camera-outline" size={24} color={colors.text} />
                <Text style={styles.actionLabel}>{t("home.foto_folha_cta")}</Text>
              </Pressable>

              <Pressable
                style={styles.actionBtn}
                disabled
                accessibilityRole="button"
                accessibilityLabel={t("home.mapa_cta")}
                accessibilityState={{ disabled: true }}
              >
                <Ionicons name="map-outline" size={24} color={colors.textSubtle} />
                <Text style={[styles.actionLabel, { color: colors.textSubtle }]}>
                  {t("home.mapa_cta")}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => {
                  haptic.light();
                  router.push("/cooperativa" as never);
                }}
                accessibilityRole="button"
                accessibilityLabel={t("home.cooperativa_cta")}
              >
                <Ionicons name="people-outline" size={24} color={colors.text} />
                <Text style={styles.actionLabel}>{t("home.cooperativa_cta")}</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <LavouraRow
            lavoura={item}
            isLast={index === topLavouras.length - 1}
            onPress={() => router.push(`/lavoura/${item.id}` as never)}
          />
        )}
      />
    </AppBackground>
  );
}

const decorationStyles = StyleSheet.create({
  // Clock posicionado dentro da area do globo (overlap proposital).
  // zIndex 0 + elevation 0: clock fica ATRAS do globo. Necessario
  // explicitar pq Globe.dom (WebView/canvas) tem compositor proprio
  // em algumas plataformas e nao respeita render-order natural.
  clockWrap: {
    position: "absolute",
    right: -15,
    top: 450,
    zIndex: 0,
    elevation: 0,
  },
  // Globo com bleed direita (~half off-screen). zIndex/elevation altos
  // garantem que o globo cubra o clock no overlap em todas as plataformas.
  globeWrap: {
    position: "absolute",
    right: -110,
    top: 175,
    width: 300,
    height: 300,
    zIndex: 2,
    elevation: 2,
  },
});

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { backgroundColor: "transparent" },
    list: { paddingBottom: spacing["6xl"] },
    heroArea: {
      height: HERO_AREA_HEIGHT,
      paddingTop: 45,
    },
    alertWrap: {
      position: "absolute",
      left: 0,
      top: 170,
    },
    sectionTitle: {
      ...typography.hSectionItalic,
      color: c.text,
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    errorWrap: {
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      marginBottom: spacing.lg,
    },
    emptyWrap: {
      alignItems: "center",
      marginTop: spacing["2xl"],
      gap: spacing.lg,
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
    },
    retryPill: {
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing["2xl"],
      borderRadius: radius.pill,
      backgroundColor: c.primary,
    },
    retryPillLabel: {
      ...typography.body,
      fontFamily: fontFamily.semibold,
      color: c.primaryText,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      paddingVertical: spacing["2xl"],
      marginTop: spacing.lg,
    },
    actionBtn: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 64,
      minWidth: 80,
    },
    actionLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      color: c.text,
    },
    greeting: {
      ...typography.hDisplay,
      color: c.text,
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      maxWidth: 260,
    },
  });
}
