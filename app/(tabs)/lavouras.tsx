// Lavouras — lista vertical completa. Sprint 1: sem filtros. Mesmo
// design da home (LavouraRow), apenas com header.
// React Query: cache offline automático via persistQueryClient.
// Lista de lavouras: vertical, todas visiveis.

import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LavouraRow } from "@/components/domain/LavouraRow";
import { LavouraRowSkeleton } from "@/components/domain/LavouraRowSkeleton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme } from "@/context/ThemeContext";
import { useLavouras } from "@/hooks/useQueries";
import { haptic } from "@/lib/haptics";
import { radius, spacing, type ThemeColors } from "@/lib/theme";

const HORIZONTAL_PADDING = 30;

export default function LavourasScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // React Query: serve dados do cache AsyncStorage quando offline
  const lavourasQuery = useLavouras();

  const lavouras = lavourasQuery.data ?? [];
  const initialLoading = lavourasQuery.isLoading && !lavourasQuery.data;
  const error = lavourasQuery.error?.message ?? null;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await lavourasQuery.refetch();
    setRefreshing(false);
  }, [lavourasQuery]);

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
                <ErrorBanner message={error} onRetry={() => void lavourasQuery.refetch()} />
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

      {/* FAB — Nova Lavoura */}
      <Pressable
        onPress={() => {
          haptic.light();
          router.push("/lavoura/nova" as never);
        }}
        accessibilityRole="button"
        accessibilityLabel={t("lavoura_form.title_criar")}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 100 },
          pressed && styles.fabPressed,
        ]}
      >
        <Ionicons name="add" size={28} color={colors.primaryText} />
      </Pressable>
    </AppBackground>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { backgroundColor: "transparent" },
    list: { paddingBottom: spacing["6xl"] },
    errorWrap: {
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: spacing.lg,
    },
    fab: {
      position: "absolute",
      right: spacing["2xl"],
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    fabPressed: { opacity: 0.9, transform: [{ scale: 0.95 }] },
  });
}
