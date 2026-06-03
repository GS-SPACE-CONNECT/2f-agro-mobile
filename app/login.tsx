// Login 2F-AGRO — formulário de email + senha com validação.
// Usa Input, validation.ts e useShake (infra já existente).
// Mock: qualquer email válido + senha 6+ chars autentica via fallback.

import { useMemo, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/Input";
import { useTheme } from "@/context/ThemeContext";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useShake } from "@/hooks/useShake";
import { auth } from "@/lib/auth";
import { haptic } from "@/lib/haptics";
import { validateEmail, validatePassword, type ValidationResult } from "@/lib/validation";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { opacity, translateY } = useFadeIn(360);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailShake = useShake();
  const senhaShake = useShake();

  function resolveError(result: ValidationResult): string | null {
    if (!result) return null;
    return t(result.key, result.vars ?? {});
  }

  async function onSubmit() {
    const eErr = resolveError(validateEmail(email));
    const sErr = resolveError(validatePassword(senha));

    setEmailError(eErr);
    setSenhaError(sErr);
    setSubmitError(null);

    if (eErr) emailShake.shake();
    if (sErr) senhaShake.shake();
    if (eErr || sErr) {
      haptic.warning();
      return;
    }

    setLoading(true);
    try {
      haptic.success();
      await auth.signIn(email.trim(), senha);
      router.replace("/");
    } catch {
      setSubmitError(t("auth.error"));
      haptic.warning();
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + spacing["5xl"],
            paddingBottom: insets.bottom + spacing["3xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.header, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.brand}>2F-AGRO</Text>
          <Text style={styles.heroTitle}>{t("auth.welcome")}</Text>
          <Text style={styles.tagline}>{t("auth.subtitle")}</Text>
        </Animated.View>

        <View style={styles.form}>
          <Input
            label={t("auth.email_label")}
            placeholder={t("auth.email_placeholder")}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError(null);
            }}
            error={emailError}
            icon="mail-outline"
            shakeAnim={emailShake.translateX}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!loading}
          />

          <Input
            label={t("auth.senha_label")}
            placeholder={t("auth.senha_placeholder")}
            value={senha}
            onChangeText={(v) => {
              setSenha(v);
              if (senhaError) setSenhaError(null);
            }}
            error={senhaError}
            icon="lock-closed-outline"
            shakeAnim={senhaShake.translateX}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            editable={!loading}
          />

          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}

          <Text style={styles.demoHint}>{t("auth.demo_hint")}</Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t("auth.sign_in")}
            style={({ pressed }) => [
              styles.pillCTA,
              pressed && styles.pillCTAPressed,
              loading && styles.pillCTADisabled,
            ]}
          >
            <Text style={styles.pillCTALabel}>
              {loading ? t("auth.signing_in") : t("auth.sign_in")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flexGrow: 1,
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
    form: {
      marginTop: spacing["3xl"],
    },
    submitError: {
      ...typography.caption,
      fontWeight: "500",
      color: c.error,
      textAlign: "center",
      marginTop: spacing.sm,
    },
    demoHint: {
      ...typography.caption,
      color: c.textSubtle,
      textAlign: "center",
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
    pillCTADisabled: { opacity: 0.6 },
    pillCTALabel: {
      ...typography.bodyLg,
      fontFamily: fontFamily.semibold,
      color: c.primaryText,
    },
  });
}
