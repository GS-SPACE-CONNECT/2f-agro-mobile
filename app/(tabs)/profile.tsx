// Profile Sprint 1 — Perfil mockado (Seu Joao), tema, idioma, sair.
// Sprint 2: avatar upload, mudar senha, dados da propriedade editaveis.
// Profile: mockado + tema + locale + sair.

import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { LocalePicker } from "@/components/ui/LocalePicker";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SettingRow } from "@/components/ui/SettingRow";
import { useTheme } from "@/context/ThemeContext";
import { useUserLocation } from "@/context/UserLocationContext";
import { auth } from "@/lib/auth";
import { fontFamily, radius, spacing, typography, type ThemeColors } from "@/lib/theme";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const { propriedade } = useUserLocation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function onSignOut() {
    await auth.signOut();
    router.replace("/login");
  }

  const themeToggleValue = mode === "dark"
    ? t("settings.theme_dark")
    : t("settings.theme_light");

  const donoFullName = propriedade?.donoFullName ?? t("profile.unknown_user");
  const subtitle = propriedade
    ? `${propriedade.nome} · ${propriedade.municipio}-${propriedade.estado}`
    : "";

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader title={t("profile.title")} />

        <View style={styles.avatarBlock}>
          <ProfileAvatar source={donoFullName} size={84} />
          <Text style={styles.name}>{donoFullName}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.settings}>
          <Pressable
            onPress={() => toggleTheme()}
            accessibilityRole="button"
            accessibilityLabel={t("settings.theme")}
          >
            <SettingRow
              icon="moon"
              label={t("settings.theme")}
              value={themeToggleValue}
              divider
            />
          </Pressable>
          <LocalePicker />
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel={t("profile.sign_out")}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.signOutLabel}>{t("profile.sign_out")}</Text>
          </Pressable>
        </View>
      </View>
    </AppBackground>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing["2xl"], paddingBottom: spacing["6xl"] },
    avatarBlock: {
      alignItems: "center",
      marginTop: spacing.xl,
      marginBottom: spacing["2xl"],
      gap: spacing.sm,
    },
    name: {
      ...typography.h3,
      color: c.text,
      marginTop: spacing.sm,
    },
    subtitle: {
      ...typography.caption,
      color: c.textMuted,
    },
    settings: {
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    footer: { marginTop: "auto", paddingTop: spacing["2xl"] },
    signOutBtn: {
      height: 52,
      borderRadius: radius.pill,
      borderColor: c.borderStrong,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    signOutLabel: {
      ...typography.body,
      fontFamily: fontFamily.semibold,
      color: c.text,
    },
  });
}
