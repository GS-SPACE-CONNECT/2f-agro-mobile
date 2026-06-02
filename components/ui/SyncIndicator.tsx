// Indicador visual de sync pendente — mostra estado da fila offline
// e conectividade. Aparece como pill flutuante no topo das tabs.
// Anima entrada/saída com Animated API nativa.

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useIsOnline } from "@/lib/query-client";
import { useOfflineQueue } from "@/lib/offline-queue";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily, radius, spacing } from "@/lib/theme";

export function SyncIndicator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const pendentes = useOfflineQueue((s) => s.pendentes);
  const processando = useOfflineQueue((s) => s.processando);

  const totalPendente = pendentes.length;
  const visivel = !isOnline || totalPendente > 0;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visivel ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [visivel, slideAnim]);

  // Monta label descritiva
  let label: string;
  let icon: keyof typeof Ionicons.glyphMap;
  let accentColor: string;

  if (!isOnline && totalPendente > 0) {
    label = t("sync.offline_com_pendentes", { count: totalPendente });
    icon = "cloud-offline-outline";
    accentColor = colors.warning;
  } else if (!isOnline) {
    label = t("sync.offline");
    icon = "cloud-offline-outline";
    accentColor = colors.textMuted;
  } else if (processando) {
    label = t("sync.sincronizando");
    icon = "sync-outline";
    accentColor = colors.success;
  } else {
    // Online com pendentes (vai sincronizar logo)
    label = t("sync.pendentes", { count: totalPendente });
    icon = "cloud-upload-outline";
    accentColor = colors.warning;
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Animated.View
      pointerEvents={visivel ? "auto" : "none"}
      style={[
        styles.container,
        {
          top: insets.top + spacing.xs,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={14} color={accentColor} />
        <Text
          style={[styles.label, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
