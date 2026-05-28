// Lavouras — lista vertical completa. Sprint 1: sem filtros. Mesmo
// design da home (LavouraRow), apenas com header.
// Lista de lavouras: vertical, todas visiveis.

import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LavouraRow } from "@/components/domain/LavouraRow";
import { LavouraRowSkeleton } from "@/components/domain/LavouraRowSkeleton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme } from "@/context/ThemeContext";
import { ApiError, api } from "@/lib/api";
import type { Lavoura } from "@/lib/types";
import { spacing, type ThemeColors } from "@/lib/theme";

const HORIZONTAL_PADDING = 30;

export default function LavourasScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const l = await api.listLavouras();
      setLavouras(l);
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

  return (
    <AppBackground>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={initialLoading ? [] : lavouras}
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
            <ScreenHeader title={t("lavouras.title")} subtitle={t("lavouras.subtitle")} />
            {error && lavouras.length > 0 ? (
              <View style={styles.errorWrap}>
                <ErrorBanner message={error} onRetry={() => void load()} />
              </View>
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
            <EmptyState
              icon="cloud-offline-outline"
              title={t("home.error_title")}
              description={error}
            />
          ) : (
            <EmptyState
              icon="leaf-outline"
              title={t("home.empty_title")}
              description={t("home.empty_description")}
            />
          )
        }
        renderItem={({ item, index }) => (
          <LavouraRow
            lavoura={item}
            isLast={index === lavouras.length - 1}
            onPress={() => router.push(`/lavoura/${item.id}` as never)}
          />
        )}
      />
    </AppBackground>
  );
}

function createStyles(_c: ThemeColors) {
  return StyleSheet.create({
    container: { backgroundColor: "transparent" },
    list: { paddingBottom: spacing["6xl"] },
    errorWrap: {
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: spacing.lg,
    },
  });
}
