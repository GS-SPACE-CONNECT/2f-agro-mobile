// Tela Câmera "Olho na Folha" — permissão → captura → inferência → resultado.

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { DiagnosticoCard } from "@/components/domain/DiagnosticoCard";
import { useTheme } from "@/context/ThemeContext";
import { useTTS } from "@/context/TTSContext";
import { haptic } from "@/lib/haptics";
import { speak } from "@/lib/tts";
import { ApiError, api } from "@/lib/api";
import type { DiagnosticoPraga } from "@/lib/types";
import { fontFamily, radius, spacing, type ThemeColors } from "@/lib/theme";

type ScreenState =
  | { kind: "permission_needed" }
  | { kind: "permission_denied" }
  | { kind: "camera_ready" }
  | { kind: "analyzing"; fotoUri: string }
  | { kind: "result"; diagnostico: DiagnosticoPraga }
  | { kind: "error"; message: string };

export default function CameraScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScreenState>({ kind: "camera_ready" });
  const cameraRef = useRef<CameraView | null>(null);

  // Reconcilia permission do hook com nosso state local. O hook do
  // expo-camera ja gerencia o pedido — usamos so pra decidir o que renderizar.
  const effectiveState: ScreenState = useMemo(() => {
    if (!permission) return { kind: "permission_needed" };
    if (!permission.granted) {
      if (permission.canAskAgain) return { kind: "permission_needed" };
      return { kind: "permission_denied" };
    }
    return state;
  }, [permission, state]);

  const handleGrant = useCallback(async () => {
    haptic.light();
    const result = await requestPermission();
    if (result.granted) {
      setState({ kind: "camera_ready" });
    }
  }, [requestPermission]);

  const handleOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const handleShutter = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;
    haptic.medium();
    try {
      const photo = await cam.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        setState({ kind: "error", message: t("camera.error.capture_failed") });
        return;
      }
      setState({ kind: "analyzing", fotoUri: photo.uri });
      try {
        const diagnostico = await api.diagnosticarFolha(photo.uri);
        haptic.success();
        setState({ kind: "result", diagnostico });
      } catch (e) {
        haptic.error();
        const msg =
          e instanceof ApiError ? e.message : t("camera.error.diagnose_failed");
        setState({ kind: "error", message: msg });
      }
    } catch {
      haptic.error();
      setState({ kind: "error", message: t("camera.error.capture_failed") });
    }
  }, [t]);

  const handleRetake = useCallback(() => {
    haptic.light();
    setState({ kind: "camera_ready" });
  }, []);

  const { speed: ttsSpeed } = useTTS();

  const handleListen = useCallback(
    (d: DiagnosticoPraga) => {
      const texto = `${d.pragaLabel}. ${d.recomendacao}`;
      void speak(texto, ttsSpeed);
    },
    [ttsSpeed],
  );

  if (effectiveState.kind === "permission_needed") {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            title={t("camera.title")}
            subtitle={t("camera.subtitle")}
          />
          <View style={styles.center}>
            <EmptyState
              icon="camera-outline"
              title={t("camera.permission.requesting_title")}
              description={t("camera.permission.requesting_description")}
            />
            <Pressable
              onPress={() => void handleGrant()}
              style={({ pressed }) => [
                styles.primaryPill,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryPillLabel}>
                {t("camera.permission.grant_button")}
              </Text>
            </Pressable>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (effectiveState.kind === "permission_denied") {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            title={t("camera.title")}
            subtitle={t("camera.subtitle")}
          />
          <View style={styles.center}>
            <EmptyState
              icon="lock-closed-outline"
              title={t("camera.permission.denied_title")}
              description={t("camera.permission.denied_description")}
            />
            <Pressable
              onPress={handleOpenSettings}
              style={({ pressed }) => [
                styles.primaryPill,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryPillLabel}>
                {t("camera.permission.open_settings")}
              </Text>
            </Pressable>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (effectiveState.kind === "analyzing") {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            title={t("camera.title")}
            subtitle={t("camera.subtitle")}
          />
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={styles.analyzingTitle}>
              {t("camera.capture.analyzing_title")}
            </Text>
            <Text style={styles.analyzingBody}>
              {t("camera.capture.analyzing_description")}
            </Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (effectiveState.kind === "result") {
    return (
      <AppBackground>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title={t("camera.title")}
            subtitle={t("camera.subtitle")}
          />
          <DiagnosticoCard
            diagnostico={effectiveState.diagnostico}
            onListen={handleListen}
            onRetake={handleRetake}
          />
        </ScrollView>
      </AppBackground>
    );
  }

  if (effectiveState.kind === "error") {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            title={t("camera.title")}
            subtitle={t("camera.subtitle")}
          />
          <View style={styles.errorWrap}>
            <ErrorBanner
              message={effectiveState.message}
              onRetry={handleRetake}
            />
          </View>
        </View>
      </AppBackground>
    );
  }

  // camera_ready
  return (
    <View style={styles.cameraRoot}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      {/* Guias de enquadramento — 4 cantos L */}
      <View style={styles.framingGuide} pointerEvents="none">
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Hint glass pill no topo */}
      <View
        style={[
          styles.cameraOverlayTop,
          { paddingTop: insets.top + spacing.lg },
        ]}
        pointerEvents="box-none"
      >
        <Text style={styles.cameraHint}>{t("camera.capture.hint")}</Text>
      </View>

      {/* Gradiente sutil + shutter na zona do polegar */}
      <View
        style={[
          styles.cameraOverlayBottom,
          { paddingBottom: insets.bottom + spacing["4xl"] },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => void handleShutter()}
          style={({ pressed }) => [
            styles.shutter,
            pressed && styles.shutterPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("camera.capture.shutter")}
          hitSlop={20}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const CORNER_SIZE = 32;
const CORNER_THICKNESS = 2.5;
const FRAME_INSET = 48;

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingBottom: spacing["6xl"] },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.xl,
      paddingHorizontal: spacing["2xl"],
    },
    errorWrap: { paddingHorizontal: spacing["2xl"], marginTop: spacing.xl },
    resultScroll: { paddingBottom: spacing["6xl"] },
    primaryPill: {
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing["3xl"],
      borderRadius: radius.pill,
      backgroundColor: c.primary,
    },
    primaryPillLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: c.primaryText,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    analyzingTitle: {
      fontFamily: fontFamily.semibold,
      fontSize: 20,
      letterSpacing: -0.4,
      color: c.text,
      marginTop: spacing.xl,
    },
    analyzingBody: {
      fontFamily: fontFamily.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.textMuted,
      textAlign: "center",
      maxWidth: 280,
    },
    // ---- Camera fullscreen layout ----
    cameraRoot: {
      flex: 1,
      backgroundColor: "#000",
    },
    // Guias de enquadramento — 4 cantos L
    framingGuide: {
      ...StyleSheet.absoluteFillObject,
      margin: FRAME_INSET,
    },
    corner: {
      position: "absolute",
      width: CORNER_SIZE,
      height: CORNER_SIZE,
    },
    cornerTL: {
      top: 0,
      left: 0,
      borderTopWidth: CORNER_THICKNESS,
      borderLeftWidth: CORNER_THICKNESS,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderTopLeftRadius: 4,
    },
    cornerTR: {
      top: 0,
      right: 0,
      borderTopWidth: CORNER_THICKNESS,
      borderRightWidth: CORNER_THICKNESS,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderTopRightRadius: 4,
    },
    cornerBL: {
      bottom: 0,
      left: 0,
      borderBottomWidth: CORNER_THICKNESS,
      borderLeftWidth: CORNER_THICKNESS,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderBottomLeftRadius: 4,
    },
    cornerBR: {
      bottom: 0,
      right: 0,
      borderBottomWidth: CORNER_THICKNESS,
      borderRightWidth: CORNER_THICKNESS,
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderBottomRightRadius: 4,
    },
    cameraOverlayTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    cameraHint: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      letterSpacing: 0.8,
      color: "rgba(255, 255, 255, 0.9)",
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      paddingVertical: spacing.sm - 1,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      overflow: "hidden",
      textTransform: "uppercase",
    },
    cameraOverlayBottom: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    shutter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 3.5,
      borderColor: "rgba(255, 255, 255, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    shutterInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#FFFFFF",
    },
    shutterPressed: {
      transform: [{ scale: 0.92 }],
      opacity: 0.85,
    },
  });
}

