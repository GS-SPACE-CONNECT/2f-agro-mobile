// DiagnosticoCard — resultado editorial da inferência "Olho na Folha".

import { useCallback, useMemo } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import { haptic } from "@/lib/haptics";
import type { DiagnosticoPraga } from "@/lib/types";
import {
  alertaSeveridadePalette,
  fontFamily,
  radius,
  spacing,
  type ThemeColors,
} from "@/lib/theme";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface DiagnosticoCardProps {
  diagnostico: DiagnosticoPraga;
  onListen?: (diagnostico: DiagnosticoPraga) => void;
  onRetake?: () => void;
}

export function DiagnosticoCard({
  diagnostico,
  onListen,
  onRetake,
}: DiagnosticoCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const palette = alertaSeveridadePalette[diagnostico.severidade];
  const isSadia = diagnostico.praga === "sadia";
  const confPct = Math.round(diagnostico.confianca * 100);
  const heroColor = hexToRgba(colors.text, 0.8);

  const handleListen = useCallback(() => {
    haptic.light();
    onListen?.(diagnostico);
  }, [diagnostico, onListen]);

  const handleCallAgronomist = useCallback(() => {
    haptic.medium();
    const tel = diagnostico.agronomoTelefone.replace(/\s+/g, "");
    // tel: e universal e funciona offline — escolhido em vez de WhatsApp
    // (wa.me) porque agricultor pode nao ter WhatsApp ou 4G no momento.
    void Linking.openURL(`tel:${tel}`);
  }, [diagnostico.agronomoTelefone]);

  const handleRetake = useCallback(() => {
    haptic.light();
    onRetake?.();
  }, [onRetake]);

  const severidadeLabel = t(palette.labelKey).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: diagnostico.fotoUri }} style={styles.thumb} />
      </View>

      <Text style={[styles.hero, { color: heroColor }]} numberOfLines={1}>
        {confPct}
        <Text style={[styles.heroSuffix, { color: heroColor }]}>%</Text>
      </Text>

      <Text style={styles.kicker} numberOfLines={1}>
        {t("camera.result.kicker")}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.text }]} />

      <Text style={styles.pragaLabel} numberOfLines={2}>
        {isSadia
          ? t("camera.result.no_pest_title")
          : diagnostico.pragaLabel}
      </Text>

      <Text style={styles.body} numberOfLines={4}>
        {diagnostico.recomendacao}
      </Text>

      <Text style={styles.meta} numberOfLines={1}>
        {severidadeLabel} · {t("camera.result.confidence", { pct: confPct })}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={handleListen}
          style={({ pressed }) => [
            styles.actionPill,
            pressed && styles.actionPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("camera.result.listen")}
        >
          <Ionicons name="volume-high" size={18} color={colors.text} />
          <Text style={styles.actionLabel}>{t("camera.result.listen")}</Text>
        </Pressable>

        {!isSadia ? (
          <Pressable
            onPress={handleCallAgronomist}
            style={({ pressed }) => [
              styles.actionPillPrimary,
              pressed && styles.actionPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("camera.result.call_agronomist")}
          >
            <Ionicons name="call" size={18} color={colors.primaryText} />
            <Text style={styles.actionLabelPrimary}>
              {t("camera.result.call_agronomist")}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={handleRetake}
        style={({ pressed }) => [
          styles.retakeRow,
          pressed && { opacity: 0.6 },
        ]}
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={16} color={colors.textMuted} />
        <Text style={styles.retakeLabel}>{t("camera.result.new_photo")}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingLeft: 30,
      paddingRight: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
    },
    thumbWrap: {
      width: 72,
      height: 72,
      borderRadius: radius.lg,
      overflow: "hidden",
      marginBottom: spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    thumb: {
      width: "100%",
      height: "100%",
    },
    hero: {
      fontFamily: fontFamily.light,
      fontSize: 88,
      lineHeight: 78,
      letterSpacing: -4.5,
    },
    heroSuffix: {
      fontFamily: fontFamily.light,
      fontSize: 32,
      letterSpacing: -1.5,
    },
    kicker: {
      fontFamily: fontFamily.semibold,
      fontSize: 10,
      letterSpacing: 4,
      marginTop: spacing.xs,
      textTransform: "uppercase",
      color: c.text,
    },
    divider: {
      width: 120,
      height: StyleSheet.hairlineWidth,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    pragaLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 22,
      lineHeight: 26,
      letterSpacing: -0.4,
      color: c.text,
      marginBottom: spacing.sm,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 21,
      letterSpacing: -0.1,
      color: c.text,
      paddingRight: spacing.xl,
    },
    meta: {
      fontFamily: fontFamily.light,
      fontSize: 9,
      letterSpacing: 1.5,
      color: c.textMuted,
      marginTop: spacing.md,
      textTransform: "uppercase",
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    actionPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs + 2,
      paddingVertical: spacing.sm + 1,
      paddingHorizontal: spacing.md + 2,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderStrong,
      backgroundColor: "transparent",
    },
    actionPillPrimary: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs + 2,
      paddingVertical: spacing.sm + 1,
      paddingHorizontal: spacing.md + 2,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
    },
    actionPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    actionLabel: {
      fontFamily: fontFamily.medium,
      fontSize: 13,
      color: c.text,
    },
    actionLabelPrimary: {
      fontFamily: fontFamily.medium,
      fontSize: 13,
      color: c.primaryText,
    },
    retakeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.lg,
    },
    retakeLabel: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: c.textMuted,
      textDecorationLine: "underline",
    },
  });
}
