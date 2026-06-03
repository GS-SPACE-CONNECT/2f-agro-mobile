// Detalhe do alerta — placeholder Sprint 1, layout editorial.

import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "@/lib/theme";

export default function AlertaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={styles.backLabel}>{t("common.back")}</Text>
        </Pressable>

        {/* Numeral fantasma translúcido */}
        <Text style={styles.ghostNumeral}>{id}</Text>

        {/* Conteúdo */}
        <View style={styles.body}>
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
      gap: 2,
    },
    backLabel: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.base,
      color: c.text,
    },
    ghostNumeral: {
      fontFamily: fontFamily.light,
      fontSize: 120,
      lineHeight: 120,
      letterSpacing: -6,
      color: c.text,
      opacity: 0.04,
      position: "absolute",
      right: spacing.xl,
      top: 100,
    },
    body: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.md,
    },
  });
}
