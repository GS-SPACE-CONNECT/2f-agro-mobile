// LavouraRow — substitui LavouraCardCompact por linha unica de lista
// (estilo Linear/Vercel/Stripe dashboard). Sem chrome de card, apenas:
//   - Dot 8x8 na cor da saude da lavoura (esquerda)
//   - Cultura em Manrope SemiBold 13 caps com letterSpacing
//   - Spacer flex
//   - Meta inline: identificador | area | tempo relativo
// Hairline divider entre rows. Densidade alta, escaneavel.
// Row de lavoura: dot colorido + caps + meta inline, hairline.

import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import { haptic } from "@/lib/haptics";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Lavoura } from "@/lib/types";
import {
  fontFamily,
  lavouraSaudePalette,
  spacing,
  type ThemeColors,
} from "@/lib/theme";

export interface LavouraRowProps {
  lavoura: Lavoura;
  onPress?: () => void;
  /** True na ultima row, esconde o hairline divider. */
  isLast?: boolean;
}

export function LavouraRow({ lavoura, onPress, isLast = false }: LavouraRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const palette = lavouraSaudePalette[lavoura.saude];
  const relativeTime = useMemo(
    () =>
      lavoura.ultimaLeitura ? formatRelativeTime(lavoura.ultimaLeitura, t) : null,
    [lavoura.ultimaLeitura, t],
  );

  const areaText = lavoura.areaHectares.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const metaParts = [lavoura.identificador, `${areaText} ha`];
  if (relativeTime) metaParts.push(relativeTime);
  const metaLine = metaParts.join(" · ");

  const content = (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={[styles.dot, { backgroundColor: palette.color }]} />
      <Text style={styles.cultura} numberOfLines={1}>
        {lavoura.culturaLabel.toUpperCase()}
      </Text>
      <View style={styles.spacer} />
      <Text style={styles.meta} numberOfLines={1}>
        {metaLine}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${lavoura.culturaLabel} ${lavoura.identificador}, saúde ${t(palette.labelKey)}`}
      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
    >
      {content}
    </Pressable>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing.xl,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.separator,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    cultura: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      letterSpacing: 2,
      color: c.text,
      flexShrink: 0,
    },
    spacer: {
      flex: 1,
    },
    meta: {
      fontFamily: fontFamily.light,
      fontSize: 13,
      letterSpacing: 0.3,
      color: c.textMuted,
      flexShrink: 1,
    },
  });
}
