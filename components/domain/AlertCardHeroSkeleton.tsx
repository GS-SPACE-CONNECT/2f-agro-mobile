// Skeleton do AlertCardHero — mesmo footprint, sem dados, com Skeleton bars.
// Skeleton alert hero: mantem layout enquanto carrega.

import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";
import { spacing, type ThemeColors } from "@/lib/theme";

export function AlertCardHeroSkeleton() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Skeleton width={70} height={18} borderRadius={4} />
        <Skeleton width={28} height={28} borderRadius={14} />
      </View>
      <View style={styles.divider} />
      <Skeleton width={60} height={9} borderRadius={3} style={styles.gap} />
      <Skeleton width={120} height={16} borderRadius={4} style={styles.gap} />
      <Skeleton width={90} height={11} borderRadius={3} style={styles.gap} />
      <Skeleton width={140} height={36} borderRadius={4} style={styles.gap} />
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: 180,
      minHeight: 202,
      backgroundColor: c.heroVerticalBg,
      borderColor: c.heroVerticalBorder,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: spacing["2xl"],
      paddingVertical: spacing.lg,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.text,
      opacity: 0.18,
      marginVertical: spacing.sm,
    },
    gap: { marginTop: 6 },
  });
}
