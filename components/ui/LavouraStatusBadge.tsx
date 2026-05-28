// Badge de saude da lavoura — pill colorida + emoji semaforico.
// Reusa a lavouraSaudePalette do theme. Emoji + cor + texto = acessivel
// pra daltonismo (regra do spec parent secao 4.4).
// Badge lavoura: emoji + cor + texto pra daltonismo.

import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import {
  fontFamily,
  lavouraSaudePalette,
  spacing,
  type LavouraSaudeKey,
} from "@/lib/theme";

const EMOJI: Record<LavouraSaudeKey, string> = {
  saudavel: "🟢",
  atencao: "🟡",
  risco: "🟠",
  perdida: "🔴",
};

export interface LavouraStatusBadgeProps {
  saude: LavouraSaudeKey;
  style?: ViewStyle;
  /** Versao compacta sem texto (so emoji), pra grids densos. */
  compact?: boolean;
}

export function LavouraStatusBadge({ saude, style, compact = false }: LavouraStatusBadgeProps) {
  const { t } = useTranslation();
  const palette = lavouraSaudePalette[saude];

  if (compact) {
    return (
      <View style={[styles.compact, style]}>
        <Text style={styles.emoji}>{EMOJI[saude]}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Text style={styles.emoji}>{EMOJI[saude]}</Text>
      <Text style={[styles.label, { color: palette.color }]}>
        {t(palette.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  compact: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
