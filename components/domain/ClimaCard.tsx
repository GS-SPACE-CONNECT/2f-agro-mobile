// Card de dados climáticos satelitais (NASA POWER API).
// Exibe temperatura, precipitação e radiação solar da fazenda.
// Dados reais de satélite — reforça conexão com o tema "Space Connect".

import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import type { DadosClimaSatelite } from "@/lib/nasa-power";
import {
  fontFamily,
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "@/lib/theme";

interface Props {
  dados: DadosClimaSatelite;
}

export const ClimaCard = memo(function ClimaCard({ dados }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const diasAtras = Math.max(
    0,
    Math.round(
      (Date.now() - new Date(dados.dataLeitura).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>{t("clima.kicker")}</Text>

      <View style={styles.statsRow}>
        {/* Temperatura */}
        <View style={styles.statItem}>
          <Ionicons
            name="thermometer-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={styles.statValue}>{dados.temperaturaMedia}°</Text>
          <Text style={styles.statLabel}>{t("clima.temperatura")}</Text>
        </View>

        <View style={styles.divider} />

        {/* Precipitação */}
        <View style={styles.statItem}>
          <Ionicons
            name="rainy-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={styles.statValue}>
            {dados.precipitacao}
            <Text style={styles.statUnidade}> mm</Text>
          </Text>
          <Text style={styles.statLabel}>{t("clima.precipitacao")}</Text>
        </View>

        <View style={styles.divider} />

        {/* Radiação solar */}
        <View style={styles.statItem}>
          <Ionicons
            name="sunny-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={styles.statValue}>
            {dados.radiacaoSolar}
            <Text style={styles.statUnidade}> kWh</Text>
          </Text>
          <Text style={styles.statLabel}>{t("clima.radiacao")}</Text>
        </View>
      </View>

      <Text style={styles.fonte}>
        {t("clima.fonte", { dias: diasAtras })}
      </Text>
    </View>
  );
});

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginHorizontal: 30,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      backgroundColor: c.glassBase,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.glassBorder,
    },
    kicker: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: spacing.md,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    divider: {
      width: StyleSheet.hairlineWidth,
      height: 36,
      backgroundColor: c.separator,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      gap: 2,
    },
    statValue: {
      fontFamily: fontFamily.light,
      fontSize: 24,
      letterSpacing: -1,
      color: c.text,
    },
    statUnidade: {
      fontFamily: fontFamily.light,
      fontSize: 11,
      color: c.textMuted,
    },
    statLabel: {
      ...typography.caption,
      color: c.textMuted,
      textAlign: "center",
    },
    fonte: {
      fontFamily: fontFamily.light,
      fontSize: 10,
      color: c.textSubtle,
      marginTop: spacing.md,
      textAlign: "center",
      letterSpacing: 0.3,
    },
  });
}
