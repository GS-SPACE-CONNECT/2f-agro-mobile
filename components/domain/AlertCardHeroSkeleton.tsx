// Skeleton do AlertCardHero novo — espelha a composicao editorial:
// numero hero, kicker, acento, body, meta. Sem chrome de container.
// Skeleton minimal espelha layout do hero.

import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";
import { spacing } from "@/lib/theme";

export function AlertCardHeroSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Hero number */}
      <Skeleton width={110} height={56} borderRadius={4} />
      {/* Kicker */}
      <Skeleton width={70} height={11} borderRadius={3} style={styles.kicker} />
      {/* Accent line */}
      <View style={[styles.accent, { backgroundColor: colors.borderStrong }]} />
      {/* Body lines */}
      <Skeleton width={148} height={13} borderRadius={3} style={styles.bodyLine} />
      <Skeleton width={130} height={13} borderRadius={3} style={styles.bodyLine} />
      {/* Meta */}
      <Skeleton width={90} height={9} borderRadius={3} style={styles.meta} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    minHeight: 202,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  meta: { marginTop: spacing.md },
});
