// Detalhe do alerta — exibe tipo, severidade, probabilidade, recomendação e TTS.

import { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { AlertSeverityBadge } from "@/components/ui/AlertSeverityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { useTTS } from "@/context/TTSContext";
import { useAlerta } from "@/hooks/useQueries";
import { hexToRgba } from "@/lib/color";
import { haptic } from "@/lib/haptics";
import { formatRelativeTime } from "@/lib/relative-time";
import { speak } from "@/lib/tts";
import {
  alertaSeveridadePalette,
  fontFamily,
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "@/lib/theme";

export default function AlertaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { speed: ttsSpeed } = useTTS();

  const { data: alerta, isLoading } = useAlerta(id ?? "");

  const handleListen = useCallback(() => {
    if (!alerta) return;
    haptic.light();
    const texto = `${alerta.tipoLabel}. ${alerta.recomendacao}`;
    void speak(texto, ttsSpeed);
  }, [alerta, ttsSpeed]);

  const heroColor = hexToRgba(colors.text, 0.8);

  // Loading
  if (isLoading) {
    return (
      <AppBackground>
        <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
          <BackButton colors={colors} styles={styles} t={t} />
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={colors.textMuted} />
          </View>
        </View>
      </AppBackground>
    );
  }

  // Não encontrado
  if (!alerta) {
    return (
      <AppBackground>
        <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
          <BackButton colors={colors} styles={styles} t={t} />
          <View style={styles.centerWrap}>
            <EmptyState
              icon="warning-outline"
              title={t("alerta_detail.not_found_title")}
              description={t("alerta_detail.not_found_description")}
            />
          </View>
        </View>
      </AppBackground>
    );
  }

  const palette = alertaSeveridadePalette[alerta.severidade];
  const probPct = Math.round(alerta.probabilidade * 100);
  const dataFormatada = formatRelativeTime(alerta.criadoEm, t);

  return (
    <AppBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing["6xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BackButton colors={colors} styles={styles} t={t} />

        {/* Header: tipo + badge */}
        <Text style={styles.tipoLabel}>{alerta.tipoLabel}</Text>
        <View style={styles.badgeRow}>
          <AlertSeverityBadge severidade={alerta.severidade} />
          <Text style={styles.dataLabel}>{dataFormatada}</Text>
        </View>

        {/* Hero: probabilidade */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("alerta_detail.probabilidade_label")}
        </Text>
        <Text style={[styles.heroNumber, { color: heroColor }]}>
          {probPct}
          <Text style={[styles.heroPercent, { color: heroColor }]}>%</Text>
        </Text>

        {/* Janela de risco */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("alerta_detail.janela_label")}
        </Text>
        <Text style={styles.bodyText}>
          {t("alerta_detail.janela_dias", { count: alerta.janelaDias })}
        </Text>

        {/* Recomendação */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("alerta_detail.recomendacao_label")}
        </Text>
        <Text style={styles.bodyText}>{alerta.recomendacao}</Text>

        {/* Fonte dos dados */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("alerta_detail.fonte_label")}
        </Text>
        <Text style={styles.fonteText}>
          {t("alerta_detail.fonte_descricao")}
        </Text>

        {/* Botão TTS */}
        <Pressable
          onPress={handleListen}
          style={({ pressed }) => [
            styles.listenPill,
            { borderColor: palette.color },
            pressed && styles.listenPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("alerta_detail.listen_button")}
        >
          <Ionicons name="volume-high" size={18} color={colors.text} />
          <Text style={styles.listenLabel}>
            {t("alerta_detail.listen_button")}
          </Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}

function BackButton({
  colors,
  styles,
  t,
}: {
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
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
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing["2xl"] },
    scroll: { flex: 1 },
    content: { paddingHorizontal: spacing["2xl"] },
    centerWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
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
    tipoLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: c.text,
      marginTop: spacing.xl,
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginTop: spacing.md,
    },
    dataLabel: {
      fontFamily: fontFamily.light,
      fontSize: 11,
      color: c.textMuted,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.separator,
      marginVertical: spacing.xl,
    },
    sectionLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: spacing.md,
    },
    heroNumber: {
      fontFamily: fontFamily.light,
      fontSize: 56,
      lineHeight: 60,
      letterSpacing: -3,
    },
    heroPercent: {
      fontFamily: fontFamily.light,
      fontSize: 24,
      letterSpacing: -1,
    },
    bodyText: {
      ...typography.body,
      color: c.text,
      lineHeight: 24,
    },
    fonteText: {
      ...typography.caption,
      color: c.textMuted,
      lineHeight: 20,
    },
    listenPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.sm,
      marginTop: spacing["2xl"],
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      backgroundColor: "transparent",
    },
    listenPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    listenLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: c.text,
    },
  });
}
