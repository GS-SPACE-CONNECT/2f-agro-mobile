// Camera — placeholder Sprint 1. Sprint 2: expo-camera + modelo ONNX
// pra deteccao de pragas em folhas.
// Camera: placeholder Sprint 1, ONNX Sprint 2.

import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme } from "@/context/ThemeContext";
import { spacing, type ThemeColors } from "@/lib/theme";

export default function CameraScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader title={t("camera.title")} subtitle={t("camera.subtitle")} />
        <View style={styles.empty}>
          <EmptyState
            icon="camera-outline"
            title={t("camera.coming_soon_title")}
            description={t("camera.coming_soon_description")}
          />
        </View>
      </View>
    </AppBackground>
  );
}

function createStyles(_c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingBottom: spacing["6xl"] },
    empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  });
}
