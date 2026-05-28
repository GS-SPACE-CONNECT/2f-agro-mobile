// AlertCardHero — composicao editorial minimalista pra slot esquerdo da home,
// adjacente ao globo. Sem chrome de card pesado: bg fantasma, sem border, sem
// divider. Hierarquia tipografica leva a leitura:
//   1. Probabilidade gigante (Playfair 60) na cor da severidade
//   2. Tipo do alerta caps espacado (Playfair Italic 16, letterSpacing 4)
//   3. Acento horizontal sutil (24px linha)
//   4. Recomendacao em Playfair Italic
//   5. Metadata (severidade + janela) em Manrope Light caps
// Numero hero + acento serif + meta caps = estetica editorial premium.

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

  // Estado vazio — composicao identica, mas com sucesso como heroi.
  if (!alerta) {
    return (
      <View style={styles.container}>
        <Text style={[styles.hero, { color: colors.success }]}>OK</Text>
        <Text style={styles.kicker}>{t("home.alert.no_alerts_kicker")}</Text>
        <View style={[styles.accent, { backgroundColor: colors.success }]} />
        <Text style={styles.body}>{t("home.alert.no_alerts_body")}</Text>
        <Text style={styles.meta}>{t("home.alert.no_alerts_meta")}</Text>
      </View>
    );
  }

  const palette = alertaSeveridadePalette[alerta.severidade];
  const probPct = Math.round(alerta.probabilidade * 100);
  const severidadeLabel = t(palette.labelKey);

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <View style={styles.container}>
        {/* TTS ghost button, top-right, sem chrome */}
        <Pressable
          onPress={handleListen}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("home.alert.listen_button")}
          style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="volume-medium-outline" size={16} color={colors.textMuted} />
        </Pressable>

        {/* Hero: numero gigante serif na cor da severidade */}
        <Text style={[styles.hero, { color: palette.color }]} numberOfLines={1}>
          {probPct}
          <Text style={styles.heroSuffix}>%</Text>
        </Text>

        {/* Kicker: tipo do alerta em caps com letterspacing editorial */}
        <Text style={styles.kicker} numberOfLines={1}>
          {alerta.tipoLabel.split("").join(" ")}
        </Text>

        {/* Acento horizontal — 24px, cor da severidade, sem opacity */}
        <View style={[styles.accent, { backgroundColor: palette.color }]} />

        {/* Recomendacao em Playfair Italic, max 3 linhas, lineHeight generoso */}
        <Text style={styles.body} numberOfLines={3}>
          {alerta.recomendacao}
        </Text>

        {/* Metadata: severidade + janela, italic minusculo Manrope */}
        <Text style={styles.meta} numberOfLines={1}>
          {severidadeLabel.toLowerCase()} ·{" "}
          {t("home.alert.window", { count: alerta.janelaDias })}
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
      // bg fantasma — apenas pra texturar levemente sobre o gradient.
      // Sem border, sem radius pesado, sem padding excessivo.
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    listenBtn: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      fontFamily: fontFamily.displayRegular,
      fontSize: 64,
      lineHeight: 64,
      letterSpacing: -3,
    },
    heroSuffix: {
      fontFamily: fontFamily.displayRegular,
      fontSize: 24,
      letterSpacing: -1,
    },
    kicker: {
      fontFamily: fontFamily.displayItalic,
      fontSize: 13,
      letterSpacing: 3,
      color: c.text,
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
      fontFamily: fontFamily.displayItalic,
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.2,
      color: c.text,
    },
    meta: {
      fontFamily: fontFamily.light,
      fontSize: 10,
      letterSpacing: 0.5,
      color: c.textMuted,
      marginTop: spacing.md,
      textTransform: "uppercase",
    },
  });
}
