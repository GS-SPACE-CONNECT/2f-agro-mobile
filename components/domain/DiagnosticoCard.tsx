// DiagnosticoCard — resultado da inferencia "Olho na Folha".
// Mantem a linguagem editorial do AlertCardHero (hero number Manrope
// thin + kicker caps + divider + body curto), adaptada pra tela cheia
// de resultado: thumbnail da foto no topo, % confianca como hero,
// nome da praga como manchete, recomendacao em voz Seu Joao, e 3
// acoes (ouvir resultado, falar agronomo, tirar outra foto).
// Card do diagnostico: foto + confianca + praga + recomendacao + acoes.

import { useCallback } from "react";
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
  const styles = createStyles(colors);

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
      width: 88,
      height: 88,
      borderRadius: radius.xl,
      overflow: "hidden",
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    thumb: {
      width: "100%",
      height: "100%",
    },
    hero: {
      fontFamily: fontFamily.medium,
      fontSize: 100,
      lineHeight: 88,
      letterSpacing: -5,
    },
    heroSuffix: {
      fontFamily: fontFamily.medium,
      fontSize: 36,
      letterSpacing: -1.5,
    },
    kicker: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      letterSpacing: 4,
      marginTop: spacing.xs,
      textTransform: "uppercase",
      color: c.text,
    },
    divider: {
      width: 160,
      height: 1,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    pragaLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 26,
      lineHeight: 30,
      letterSpacing: -0.5,
      color: c.text,
      marginBottom: spacing.md,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: -0.1,
      color: c.text,
      paddingRight: 20,
    },
    meta: {
      fontFamily: fontFamily.light,
      fontSize: 9,
      letterSpacing: 1.5,
      color: c.textMuted,
      marginTop: spacing.lg,
      textTransform: "uppercase",
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing["2xl"],
    },
    actionPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.borderStrong,
      backgroundColor: "transparent",
    },
    actionPillPrimary: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md - 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
    },
    actionPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    actionLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: c.text,
    },
    actionLabelPrimary: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: c.primaryText,
    },
    retakeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.xl,
    },
    retakeLabel: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: c.textMuted,
      textDecorationLine: "underline",
    },
  });
}
