// AlertCardHero — composicao 100% Manrope. Estetica thin-weight + caps
// + acento sutil. Sem chrome de card; apenas tipografia sobre o gradient.
//   1. Numero hero (Manrope Light 72) — herois sao thin no premium tech
//   2. % suffix menor (Light 28)
//   3. Kicker "SECA" caps SemiBold com letterSpacing 4 na cor da severidade
//   4. Acento horizontal 24px na cor da severidade
//   5. Recomendacao Regular 13, lineHeight 19
//   6. Meta caps Light com bullet separador
// Manrope thin = estetica Apple/Linear/Vercel premium.

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

  if (!alerta) {
    return (
      <View style={styles.container}>
        <Text style={[styles.hero, { color: colors.success }]}>OK</Text>
        <Text style={[styles.kicker, { color: colors.success }]}>
          {t("home.alert.no_alerts_kicker")}
        </Text>
        <View style={[styles.accent, { backgroundColor: colors.success }]} />
        <Text style={styles.body}>{t("home.alert.no_alerts_body")}</Text>
        <Text style={styles.meta}>{t("home.alert.no_alerts_meta")}</Text>
      </View>
    );
  }

  const palette = alertaSeveridadePalette[alerta.severidade];
  const probPct = Math.round(alerta.probabilidade * 100);
  const severidadeLabel = t(palette.labelKey).toUpperCase();
  const janelaText = t("home.alert.window", { count: alerta.janelaDias }).toUpperCase();

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <View style={styles.container}>
        <Pressable
          onPress={handleListen}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("home.alert.listen_button")}
          style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="volume-medium-outline" size={14} color={colors.textMuted} />
        </Pressable>

        <Text style={[styles.hero, { color: palette.color }]} numberOfLines={1}>
          {probPct}
          <Text style={[styles.heroSuffix, { color: palette.color }]}>%</Text>
        </Text>

        <Text style={[styles.kicker, { color: palette.color }]} numberOfLines={1}>
          {alerta.tipoLabel}
        </Text>

        <View style={[styles.accent, { backgroundColor: palette.color }]} />

        <Text style={styles.body} numberOfLines={3}>
          {alerta.recomendacao}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {severidadeLabel} · {janelaText}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: 220,
      minHeight: 280,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing["2xl"],
      paddingBottom: spacing.lg,
    },
    listenBtn: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      fontFamily: fontFamily.medium,
      fontSize: 100,
      lineHeight: 100,
      letterSpacing: -5,
      // Translucido pra dar peso editorial sem dominar — ghost numerals
      // (Vercel/Stripe pricing style). Visivel mas etereo sobre o gradient.
      opacity: 0.6,
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
    },
    accent: {
      width: 24,
      height: 1,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      lineHeight: 19,
      letterSpacing: -0.1,
      color: c.text,
    },
    meta: {
      fontFamily: fontFamily.light,
      fontSize: 9,
      letterSpacing: 1.5,
      color: c.textMuted,
      marginTop: spacing.lg,
      textTransform: "uppercase",
    },
  });
}
