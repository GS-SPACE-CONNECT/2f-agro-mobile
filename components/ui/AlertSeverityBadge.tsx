// Badge de severidade de alerta — pill colorida com texto curto.
// Reusa a alertaSeveridadePalette do theme.
// Adapta do PriorityBadge do forward-mobile.

import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import {
  alertaSeveridadePalette,
  fontFamily,
  spacing,
  type AlertaSeveridadeKey,
} from "@/lib/theme";

export interface AlertSeverityBadgeProps {
  severidade: AlertaSeveridadeKey;
  style?: ViewStyle;
}

export function AlertSeverityBadge({ severidade, style }: AlertSeverityBadgeProps) {
  const { t } = useTranslation();
  const palette = alertaSeveridadePalette[severidade];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.color }]}>
        {t(palette.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
