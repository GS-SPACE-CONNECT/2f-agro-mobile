// Skeleton do LavouraCardCompact — mesma estrutura visual (top row,
// 2 linhas de meta, divider, bottom row) mas com Skeleton bars.
// Mantem CARD_HEIGHT 130 e bg do tema.
// Skeleton lavoura: mantem ritmo visual enquanto carrega.

import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";
import { type ThemeColors } from "@/lib/theme";

const CARD_HEIGHT = 130;

export function LavouraCardCompactSkeleton() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Skeleton width={60} height={16} borderRadius={4} />
        <Skeleton width={18} height={18} borderRadius={9} />
      </View>
      <Skeleton width={40} height={12} borderRadius={4} style={styles.id} />
      <Skeleton width={80} height={11} borderRadius={4} style={styles.area} />
      <View style={styles.divider} />
      <View style={styles.bottomRow}>
        <Skeleton width={40} height={10} borderRadius={4} />
        <Skeleton width={50} height={10} borderRadius={4} />
      </View>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      height: CARD_HEIGHT,
      backgroundColor: c.leadCardCompactBg,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.heroVerticalBorder,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    id: { marginTop: 10 },
    area: { marginTop: 4 },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.leadCardCompactText,
      opacity: 0.15,
      marginTop: 6,
      marginBottom: 6,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
}
