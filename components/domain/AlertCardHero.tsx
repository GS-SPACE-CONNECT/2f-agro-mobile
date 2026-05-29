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

/**
 * Converte hex (#RRGGBB) pra rgba com alpha. Usado pra deixar
 * o numero hero translucido (white em dark, black em light) sem
 * depender de opacity prop que falha em alguns paths do RN web.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

  // Cor do hero "78%": branco em dark / preto em light, ambos translucidos.
  // Independe da severidade — quem carrega a cor da urgencia eh o kicker
  // + acento. Mantem o numero como elemento neutro/etereo.
  const heroColor = hexToRgba(colors.text, 0.35);

  if (!alerta) {
    return (
      <View style={styles.container}>
        <Text style={[styles.hero, { color: heroColor }]}>OK</Text>
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

        <Text style={[styles.hero, { color: heroColor }]} numberOfLines={1}>
          {probPct}
          <Text style={[styles.heroSuffix, { color: heroColor }]}>%</Text>
        </Text>

        {/* Kicker "SECA" em cor neutra (cor do tema) com letterSpacing
            editorial. Quem leva a cor da urgencia eh apenas o divider abaixo. */}
        <Text style={styles.kicker} numberOfLines={1}>
          {alerta.tipoLabel}
        </Text>

        {/* Divider horizontal neutro (cor do tema) — branco em dark,
            preto em light. Sem laranja: composicao 100% sem cor de
            severidade no card. */}
        <View style={[styles.divider, { backgroundColor: colors.text }]} />

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
      width: 260,
      minHeight: 280,
      // paddingLeft 30 = mesma indentacao do greeting (SECTION_HORIZONTAL_PADDING
      // no index.tsx). Conteudo do alert alinha verticalmente com "Bom dia,".
      paddingLeft: 30,
      paddingRight: spacing.lg,
      paddingTop: spacing["2xl"],
      paddingBottom: spacing.lg,
    },
    hero: {
      fontFamily: fontFamily.medium,
      fontSize: 100,
      // lineHeight 88 (mais apertado q fontSize) puxa o conteudo de baixo
      // pra perto do numero. "78" tem altura visual ~75px, lineHeight 88
      // mantem respiro minimo sem o "vazio fantasma" do bounding box 100.
      lineHeight: 88,
      letterSpacing: -5,
      // Translucencia feita via rgba na cor (mais confiavel que opacity
      // prop em alguns paths do RN web). Cor calculada inline acima.
    },
    heroSuffix: {
      fontFamily: fontFamily.medium,
      fontSize: 36,
      letterSpacing: -1.5,
    },
    // Kicker = text "SECA" caps + letterSpacing editorial. Cor do tema
    // (neutra) — quem leva a cor da urgencia eh o divider abaixo.
    kicker: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      letterSpacing: 4,
      marginTop: spacing.xs,
      textTransform: "uppercase",
      color: c.text,
    },
    // Divider horizontal entre kicker e body — linha 160x1 na cor da
    // severidade. Substitui o accent antigo no caminho com alerta.
    divider: {
      width: 160,
      height: 1,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    // Accent — linha curta 24x1, ainda usada apenas no estado vazio (no_alerts).
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
      paddingRight: 30, // evita colidir com o listenBtn (quando presente)
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
