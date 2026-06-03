// Login Sprint 1 — CTA único "Entrar como Seu João".
// Layout editorial: numeral fantasma + Playfair display + CTA pill.

import { useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import { useFadeIn } from "@/hooks/useFadeIn";
import { auth } from "@/lib/auth";
import { haptic } from "@/lib/haptics";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { opacity, translateY } = useFadeIn(360);

  async function onSubmit() {
    haptic.success();
    await auth.signIn("joao@demo.com", "demo123");
    router.replace("/");
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing["5xl"], paddingBottom: insets.bottom + spacing["3xl"] },
      ]}
    >
      {/* Numeral fantasma — decorativo, editorial */}
      <Text style={styles.ghostNumeral}>01</Text>

      <Animated.View style={[styles.header, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.brand}>2F-AGRO</Text>
        <Text style={styles.heroTitle}>{t("auth.welcome")}</Text>
        <Text style={styles.tagline}>{t("auth.subtitle")}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel={t("auth.sign_in")}
          style={({ pressed }) => [
            styles.pillCTA,
            pressed && styles.pillCTAPressed,
          ]}
        >
          <Text style={styles.pillCTALabel}>{t("auth.sign_in")}</Text>
        </Pressable>
        <Text style={styles.versionLine}>v1.0 · FIAP 2026</Text>
      </View>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingHorizontal: spacing["2xl"],
    },
    ghostNumeral: {
      position: "absolute",
      top: 60,
      right: -20,
      fontFamily: fontFamily.displayRegular,
      fontSize: 200,
      lineHeight: 200,
      letterSpacing: -10,
      color: c.text,
      opacity: 0.04,
    },
    header: {
      alignItems: "flex-start",
      marginTop: spacing["3xl"],
      gap: spacing.xs,
    },
    brand: {
      fontFamily: fontFamily.displayBold,
      fontSize: 56,
      letterSpacing: -2.5,
      color: c.text,
      marginBottom: spacing.lg,
    },
    heroTitle: {
      fontFamily: fontFamily.displayRegular,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -1,
      color: c.text,
    },
    tagline: {
      ...typography.bodyLg,
      color: c.textMuted,
      maxWidth: 300,
      marginTop: spacing.md,
    },
    footer: {
      marginTop: "auto",
      paddingTop: spacing["3xl"],
      gap: spacing.lg,
    },
    pillCTA: {
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    pillCTAPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
    pillCTALabel: {
      ...typography.bodyLg,
      fontFamily: fontFamily.semibold,
      color: c.primaryText,
    },
    versionLine: {
      ...typography.caption,
      fontFamily: fontFamily.light,
      color: c.textSubtle,
      textAlign: "center",
    },
  });
}
