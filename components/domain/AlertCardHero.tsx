// AlertCardHero — substitui o HeroStatsBlock na Home. Mesmo footprint
// (180x202, paddingX 2xl, paddingY lg, radius 20, bg heroVerticalBg).
// Mostra alerta critico ativo com botao de ouvir (TTS, Sprint 2). Quando
// nao ha alerta, mostra estado positivo "tudo certo".
// Card hero do alerta: tipo + severidade + probabilidade + recomendacao + TTS.

import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import { haptic } from "@/lib/haptics";
import type { Alerta } from "@/lib/types";
import {
  alertaSeveridadePalette,
  fontFamily,
  spacing,
  typography,
  type ThemeColors,
} from "@/lib/theme";

export interface AlertCardHeroProps {
  alerta: Alerta | null;
  onListen?: (alerta: Alerta) => void;
  onPress?: (alerta: Alerta) => void;
}

export function AlertCardHero({ alerta, onListen, onPress }: AlertCardHeroProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Sprint 1: TTS plena vira no Sprint 2 (expo-speech). Por ora dispara
  // haptic — botao ja existe, comportamento melhora sem refactor.
  const handleListen = useCallback(() => {
    if (!alerta) return;
    haptic.light();
    onListen?.(alerta);
  }, [alerta, onListen]);

  const handlePress = useCallback(() => {
    if (!alerta) return;
    haptic.light();
    onPress?.(alerta);
  }, [alerta, onPress]);

  // Estado vazio: tudo certo
  if (!alerta) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.tipo}>OK</Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>
        <View style={styles.divider} />
        <Text style={styles.probLabel}>{t("home.alert.no_alerts_label")}</Text>
        <Text style={styles.probValueOk}>{t("home.alert.no_alerts_title")}</Text>
        <Text style={styles.window}>{t("home.alert.no_alerts_subtitle")}</Text>
      </View>
    );
  }

  const palette = alertaSeveridadePalette[alerta.severidade];
  const probPct = Math.round(alerta.probabilidade * 100);

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <View style={[styles.container, { borderColor: palette.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.tipo, { color: palette.color }]} numberOfLines={1}>
            {alerta.tipoLabel}
          </Text>
          <Pressable
            onPress={handleListen}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("home.alert.listen_button")}
            style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="volume-high" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Text style={styles.probLabel}>{t("home.alert.probability_label")}</Text>
        <Text style={styles.probValue} numberOfLines={1}>
          {t(palette.labelKey).toUpperCase()} ({probPct}%)
        </Text>
        <Text style={styles.window}>
          {t("home.alert.window", { count: alerta.janelaDias })}
        </Text>

        <Text style={styles.recomendacao} numberOfLines={3}>
          {alerta.recomendacao}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: 180,
      minHeight: 202,
      backgroundColor: c.heroVerticalBg,
      borderColor: c.heroVerticalBorder,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: spacing["2xl"],
      paddingVertical: spacing.lg,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tipo: {
      fontFamily: fontFamily.displayItalic,
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: -0.6,
      color: c.text,
      flexShrink: 1,
    },
    listenBtn: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.text,
      opacity: 0.18,
      marginVertical: spacing.sm,
    },
    probLabel: {
      ...typography.label,
      fontFamily: fontFamily.semibold,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: c.textMuted,
    },
    probValue: {
      fontFamily: fontFamily.bold,
      fontSize: 16,
      letterSpacing: -0.4,
      color: c.text,
      marginTop: 2,
    },
    probValueOk: {
      fontFamily: fontFamily.displaySemibold,
      fontSize: 18,
      letterSpacing: -0.6,
      color: c.text,
      marginTop: 2,
    },
    window: {
      fontFamily: fontFamily.light,
      fontSize: 11,
      letterSpacing: -0.2,
      color: c.textMuted,
      marginTop: 4,
    },
    recomendacao: {
      fontFamily: fontFamily.displayItalic,
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.3,
      color: c.text,
      marginTop: spacing.md,
    },
  });
}
