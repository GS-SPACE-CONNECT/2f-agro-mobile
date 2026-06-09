// Profile — layout editorial row-based. Avatar + nome à esquerda,
// seção configurações com label caps, rodapé minimalista.

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
import { useTTS } from "@/context/TTSContext";
import { useUserLocation } from "@/context/UserLocationContext";
import { auth } from "@/lib/auth";
import { fontFamily, spacing, typography, type ThemeColors } from "@/lib/theme";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const { speed, cycleSpeed } = useTTS();
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

        {/* Bloco avatar — row-based, editorial */}
        <View style={styles.avatarRow}>
          <ProfileAvatar source={donoFullName} size={64} />
          <View style={styles.avatarText}>
            <Text style={styles.name}>{donoFullName}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {/* Seção configurações */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>{t("profile.settings_section")}</Text>
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
            <Pressable
              onPress={cycleSpeed}
              accessibilityRole="button"
              accessibilityLabel={t("settings.tts_speed")}
            >
              <SettingRow
                icon="volume-medium"
                label={t("settings.tts_speed")}
                value={
                  speed === 0.75
                    ? t("settings.tts_speed_slow")
                    : speed === 1.25
                      ? t("settings.tts_speed_fast")
                      : t("settings.tts_speed_normal")
                }
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel={t("profile.sign_out")}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.signOutLabel}>{t("profile.sign_out")}</Text>
          </Pressable>
          <Text style={styles.versionLine}>v1.0 · FIAP 2026</Text>
        </View>
      </View>
    </AppBackground>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing["2xl"], paddingBottom: spacing["6xl"] },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
      marginTop: spacing.xl,
      marginBottom: spacing["3xl"],
    },
    avatarText: {
      flex: 1,
      gap: spacing.xs,
    },
    name: {
      ...typography.h3,
      color: c.text,
    },
    subtitle: {
      ...typography.caption,
      color: c.textMuted,
    },
    settingsSection: {
      gap: spacing.md,
    },
    sectionLabel: {
      ...typography.labelCaps,
      color: c.textSubtle,
      paddingHorizontal: spacing.lg,
    },
    settings: {
      gap: spacing.xs,
    },
    footer: {
      marginTop: "auto",
      paddingTop: spacing["2xl"],
      gap: spacing.lg,
      alignItems: "center",
    },
    signOutBtn: {
      alignSelf: "stretch",
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    signOutLabel: {
      ...typography.body,
      fontFamily: fontFamily.medium,
      color: c.textMuted,
    },
    versionLine: {
      ...typography.caption,
      fontFamily: fontFamily.light,
      color: c.textSubtle,
    },
  });
}
