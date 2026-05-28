// Login Sprint 1 — single-button CTA. Sprint 2 vira email + senha
// (formulario do forward fica como referencia em git history).
// Login mock: "Entrar como Seu Joao" -> sessao mockada -> home.

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
    await auth.signIn();
    router.replace("/");
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing["5xl"], paddingBottom: insets.bottom + spacing["3xl"] },
      ]}
    >
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
    header: {
      alignItems: "flex-start",
      marginTop: spacing["3xl"],
      gap: spacing.xs,
    },
    brand: {
      fontFamily: fontFamily.displayBold,
      fontSize: 56,
      letterSpacing: -2,
      color: c.text,
      marginBottom: spacing.lg,
    },
    heroTitle: {
      fontFamily: fontFamily.displayRegular,
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -1,
      color: c.text,
    },
    tagline: {
      ...typography.bodyLg,
      color: c.textMuted,
      maxWidth: 320,
      marginTop: spacing.md,
    },
    footer: {
      marginTop: "auto",
      paddingTop: spacing["3xl"],
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
  });
}
