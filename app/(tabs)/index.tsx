// Home 2F-AGRO — "Sua roca hoje". Composicao premium minimalista.
// Layout (TOP -> BOTTOM):
//   - AppBackground gradient vertical
//   - Hero area (altura 560):
//       Row top: Greeting "Bom dia, Joao da Silva" Playfair 36 (esquerda)
//       Row top: RotatingClock HH:MM (direita, mais abaixo q greeting pra
//                nao competir; reduzido a 56pt)
//       Globe DOM com bleed direita (mais abaixo q antes)
//       AlertCardHero com bleed esquerdo (mais abaixo q antes)
//   - Section title "Suas lavouras" Playfair italic 20
//   - Lista vertical de LavouraRow (dot + caps + meta inline, hairline)
//   - FooterAction "Tirar foto da folha" -> /camera
// Home: greeting + clock + globo + alerta hero + lista de lavouras + cta.

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
import { LavouraRow } from "@/components/domain/LavouraRow";
import { LavouraRowSkeleton } from "@/components/domain/LavouraRowSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useTheme } from "@/context/ThemeContext";
import { useUserLocation } from "@/context/UserLocationContext";
import { ApiError, api } from "@/lib/api";
import type { Alerta, Lavoura } from "@/lib/types";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

const TOP_VISIBLE = 6;
const LIST_HORIZONTAL_PADDING = 0; // rows ja tem padding interno
const SECTION_HORIZONTAL_PADDING = 30;
const HERO_AREA_HEIGHT = 490;

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
    // Sprint 2: Speech.speak(...)
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
          !initialLoading && topLavouras.length > 0 ? (
            <View style={styles.footerWrap}>
              <FooterAction
                icon="camera"
                label={t("home.foto_folha_cta")}
                onPress={() => router.push("/camera" as never)}
              />
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
    footerWrap: {
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      marginTop: spacing["2xl"],
    },
    greeting: {
      ...typography.hDisplay,
      color: c.text,
      paddingHorizontal: SECTION_HORIZONTAL_PADDING,
      maxWidth: 260,
    },
  });
}
