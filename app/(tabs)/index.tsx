// Home 2F-AGRO — "Sua roca hoje". Layout:
// - AppBackground gradient vertical
// - Hero area (altura ~460):
//   - Greeting "Bom dia, Joao da Silva" Playfair 36 top-left
//   - RotatingClock HH:MM top-right (memoizado pra nao tickar globo)
//   - Globe DOM com marker na propriedade (lat/lng vem do contexto)
//   - AlertCardHero a esquerda com bleed -15px (substitui HeroStatsBlock)
// - Section title "Suas lavouras" Playfair italic 20
// - Grid 2-col de 6 LavouraCardCompact
// - FooterAction "Tirar foto da folha" -> /camera
// Home 2F-AGRO: greeting + clock + globo + alerta + grid lavouras.

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { FooterAction } from "@/components/ui/FooterAction";
import Globe from "@/components/illustrations/Globe.dom";
import { RotatingClock } from "@/components/illustrations/RotatingClock";
import { AlertCardHero } from "@/components/domain/AlertCardHero";
import { AlertCardHeroSkeleton } from "@/components/domain/AlertCardHeroSkeleton";
import { LavouraCardCompact } from "@/components/domain/LavouraCardCompact";
import { LavouraCardCompactSkeleton } from "@/components/domain/LavouraCardCompactSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useTheme } from "@/context/ThemeContext";
import { useUserLocation } from "@/context/UserLocationContext";
import { ApiError, api } from "@/lib/api";
import type { Alerta, Lavoura } from "@/lib/types";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

const TOP_VISIBLE = 6;
const GRID_HORIZONTAL_PADDING = 30;
const GRID_GAP = 8;
const HERO_AREA_HEIGHT = 460;

const Greeting = memo(function Greeting({ fullName }: { fullName: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Text style={styles.greeting} numberOfLines={2}>
      {t("home.welcome", { name: fullName })}
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
      <View style={decorationStyles.clockWrap} pointerEvents="none">
        <RotatingClock />
      </View>
      <View style={decorationStyles.globeWrap} pointerEvents="none">
        <Globe size={324} markerLat={markerLat} markerLng={markerLng} />
      </View>
    </>
  );
});

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { propriedade } = useUserLocation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [l, a] = await Promise.all([api.listLavouras(), api.getCurrentAlert()]);
      setLavouras(l);
      setAlerta(a);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("home.error"));
    }
  }, [t]);

  useEffect(() => {
    void (async () => {
      await load();
      setInitialLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const topLavouras = useMemo(() => lavouras.slice(0, TOP_VISIBLE), [lavouras]);

  const handleListen = useCallback(() => {
    // Sprint 1: haptic ja disparado dentro do AlertCardHero.
    // Sprint 2: Speech.speak(alerta.tipoLabel + ' ' + ... + recomendacao, { language: 'pt-BR' }).
  }, []);

  const handleAlertPress = useCallback((a: Alerta) => {
    router.push(`/alerta/${a.id}` as never);
  }, []);

  const fullName = propriedade?.donoFullName ?? "";
  const markerLat = propriedade?.lat ?? -8.2839;
  const markerLng = propriedade?.lng ?? -35.9758;

  return (
    <AppBackground>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={initialLoading ? [] : topLavouras}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
              <Greeting fullName={fullName} />
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
            {error && lavouras.length > 0 ? (
              <View style={styles.errorWrap}>
                <ErrorBanner message={error} onRetry={() => void load()} />
              </View>
            ) : null}
            {!initialLoading && topLavouras.length > 0 ? (
              <Text style={styles.sectionTitle}>{t("home.lavouras_section")}</Text>
            ) : null}
            {initialLoading ? (
              <Text style={styles.sectionTitle}>{t("home.lavouras_section")}</Text>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.skeletonGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.skeletonCell}>
                  <LavouraCardCompactSkeleton />
                </View>
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
                onPress={() => void load()}
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
          !initialLoading ? (
            <View style={styles.footerWrap}>
              <FooterAction
                icon="camera"
                label={t("home.foto_folha_cta")}
                onPress={() => router.push("/camera" as never)}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <LavouraCardCompact
            lavoura={item}
            onPress={() => router.push(`/lavoura/${item.id}` as never)}
          />
        )}
      />
    </AppBackground>
  );
}

const decorationStyles = StyleSheet.create({
  clockWrap: {
    position: "absolute",
    left: 190,
    top: 100,
  },
  globeWrap: {
    position: "absolute",
    left: 185,
    top: 130,
    width: 324,
    height: 315,
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
      left: -15,
      top: 192,
    },
    columnWrapper: {
      gap: GRID_GAP,
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
    },
    sectionTitle: {
      ...typography.hSectionItalic,
      color: c.text,
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    errorWrap: {
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      marginBottom: spacing.lg,
    },
    skeletonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      gap: GRID_GAP,
    },
    skeletonCell: {
      width: "48%",
    },
    emptyWrap: {
      alignItems: "center",
      marginTop: spacing["2xl"],
      gap: spacing.lg,
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
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
    footerWrap: {
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      marginTop: spacing.xl,
    },
    greeting: {
      ...typography.hDisplay,
      color: c.text,
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      maxWidth: 280,
    },
  });
}
