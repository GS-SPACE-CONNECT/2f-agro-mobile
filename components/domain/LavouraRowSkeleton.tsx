// Skeleton da LavouraRow — mesma estrutura (dot + cultura + spacer + meta)
// com hairline divider.
// Skeleton row: mantem altura e ritmo de lista enquanto carrega.

import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";
import { spacing, type ThemeColors } from "@/lib/theme";

export interface LavouraRowSkeletonProps {
  isLast?: boolean;
}

export function LavouraRowSkeleton({ isLast = false }: LavouraRowSkeletonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Skeleton width={8} height={8} borderRadius={4} />
      <Skeleton width={70} height={12} borderRadius={3} />
      <View style={styles.spacer} />
      <Skeleton width={100} height={11} borderRadius={3} />
    </View>
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
    spacer: { flex: 1 },
  });
}
