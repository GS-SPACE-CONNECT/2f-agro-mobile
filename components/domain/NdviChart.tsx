// NdviChart — grafico temporal NDVI em barras verticais (puro RN Views).
// Sem dependencia de chart library. Barras finas + labels de mes embaixo.
// Ultima barra (leitura atual) em opacidade total; demais translucidas.
// Estetica editorial: sem eixos, sem grid, so tipografia + cor.

import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { fontFamily, spacing, type ThemeColors } from "@/lib/theme";
import type { NdviLeitura } from "@/lib/types";

const MESES_CURTO = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const BAR_MAX_HEIGHT = 100;
const BAR_WIDTH = 12;
const BAR_RADIUS = 6;

export interface NdviChartProps {
  leituras: NdviLeitura[];
  accentColor: string;
}

export function NdviChart({ leituras, accentColor }: NdviChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (leituras.length === 0) return null;

  return (
    <View style={styles.container}>
      {leituras.map((l, i) => {
        const isLast = i === leituras.length - 1;
        const clamped = Math.max(0, Math.min(1, l.valor));
        const barHeight = Math.max(4, clamped * BAR_MAX_HEIGHT);
        const month = MESES_CURTO[new Date(l.data).getMonth()] ?? "";

        return (
          <View key={l.data} style={styles.column}>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: accentColor,
                    opacity: isLast ? 1 : 0.3,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.label,
                isLast && { color: colors.text, fontFamily: fontFamily.semibold },
              ]}
            >
              {month}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
    },
    column: {
      flex: 1,
      alignItems: "center",
      gap: spacing.xs,
    },
    track: {
      height: BAR_MAX_HEIGHT,
      justifyContent: "flex-end",
      alignItems: "center",
    },
    bar: {
      width: BAR_WIDTH,
      borderTopLeftRadius: BAR_RADIUS,
      borderTopRightRadius: BAR_RADIUS,
      borderBottomLeftRadius: 2,
      borderBottomRightRadius: 2,
    },
    label: {
      fontFamily: fontFamily.light,
      fontSize: 9,
      letterSpacing: 0.5,
      color: c.textSubtle,
      textTransform: "uppercase",
    },
  });
}
