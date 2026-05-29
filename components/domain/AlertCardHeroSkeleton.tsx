// Skeleton do AlertCardHero — espelha a nova composicao Manrope.
// Skeleton minimal: numero, kicker, acento, body, meta.

import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";
import { spacing } from "@/lib/theme";

export function AlertCardHeroSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Skeleton width={170} height={90} borderRadius={4} />
      <Skeleton width={50} height={10} borderRadius={3} style={styles.kicker} />
      <View style={[styles.accent, { backgroundColor: colors.borderStrong }]} />
      <Skeleton width={160} height={12} borderRadius={3} style={styles.bodyLine} />
      <Skeleton width={140} height={12} borderRadius={3} style={styles.bodyLine} />
      <Skeleton width={100} height={9} borderRadius={3} style={styles.meta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    minHeight: 280,
    paddingLeft: 30,
    paddingRight: spacing.lg,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.lg,
  },
  kicker: { marginTop: spacing.sm },
  accent: {
    width: 24,
    height: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  bodyLine: { marginTop: 4 },
  meta: { marginTop: spacing.lg },
});
