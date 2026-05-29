// Alerta detail — placeholder Sprint 1. Sprint 2: descricao completa,
// historico, recomendacoes do agronomo, TTS leituras.
// Detalhe do alerta: placeholder Sprint 1.

import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily, spacing, typography, type ThemeColors } from "@/lib/theme";

export default function AlertaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
          <Text style={styles.backLabel}>{t("common.back")}</Text>
        </Pressable>

        <View style={styles.body}>
          <Text style={styles.idLabel}>#{id}</Text>
          <EmptyState
            icon="warning-outline"
            title={t("alerta_detail.coming_soon_title")}
            description={t("alerta_detail.coming_soon_description")}
          />
        </View>
      </View>
    </AppBackground>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing["2xl"] },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: spacing.sm,
      gap: 4,
    },
    backLabel: {
      ...typography.body,
      fontFamily: fontFamily.medium,
      color: c.text,
    },
    body: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.lg },
    idLabel: {
      fontFamily: fontFamily.mono,
      fontSize: 12,
      color: c.textMuted,
    },
  });
}
