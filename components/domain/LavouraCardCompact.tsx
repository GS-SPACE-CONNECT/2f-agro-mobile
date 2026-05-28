// LavouraCardCompact — card editorial pra grid 2-col da home. Adapta
// do LeadCardCompact: mesma estrutura visual (valor focal serif italic +
// nome medium + meta light + divider + rodape), mas com fields de Lavoura.
// Card lavoura compact: culturaLabel + identificador + area + saude.

import { useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LavouraStatusBadge } from "@/components/ui/LavouraStatusBadge";
import { useTheme } from "@/context/ThemeContext";
import { haptic } from "@/lib/haptics";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Lavoura } from "@/lib/types";
import { fontFamily, spacing, typography, type ThemeColors } from "@/lib/theme";

const SCALE_PRESSED = 0.97;
const CARD_HEIGHT = 130;
const ID_LENGTH = 5;

function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, ID_LENGTH).toUpperCase();
}

export interface LavouraCardCompactProps {
  lavoura: Lavoura;
  onPress?: () => void;
}

export function LavouraCardCompact({ lavoura, onPress }: LavouraCardCompactProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  const relativeTime = useMemo(
    () => (lavoura.ultimaLeitura ? formatRelativeTime(lavoura.ultimaLeitura, t) : null),
    [lavoura.ultimaLeitura, t],
  );

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: SCALE_PRESSED,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };
  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
      bounciness: 6,
    }).start();
  };

  const body = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cultura} numberOfLines={1}>
          {lavoura.culturaLabel.toUpperCase()}
        </Text>
        <LavouraStatusBadge saude={lavoura.saude} compact style={styles.badge} />
      </View>

      <Text style={styles.identificador} numberOfLines={1}>
        {lavoura.identificador}
      </Text>
      <Text style={styles.area} numberOfLines={1}>
        {lavoura.areaHectares.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}{" "}
        hectares
      </Text>

      <View style={styles.divider} />
      <View style={styles.bottomRow}>
        <Text style={styles.id} numberOfLines={1}>
          #{shortId(lavoura.id)}
        </Text>
        <Text style={styles.time} numberOfLines={1}>
          {relativeTime ?? ""}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Animated.View style={[styles.outer, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => {
          haptic.light();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${lavoura.culturaLabel} ${lavoura.identificador}, saude ${lavoura.saude}`}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    outer: { flex: 1 },
    card: {
      flex: 1,
      height: CARD_HEIGHT,
      backgroundColor: c.leadCardCompactBg,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 10,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.heroVerticalBorder,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.xs,
    },
    cultura: {
      fontFamily: fontFamily.displayItalic,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.4,
      color: c.leadCardCompactText,
      flexShrink: 1,
    },
    badge: {
      flexShrink: 0,
      marginTop: 2,
    },
    identificador: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      letterSpacing: -0.2,
      color: c.leadCardCompactText,
      marginTop: 8,
    },
    area: {
      ...typography.cardMeta,
      fontSize: 11,
      lineHeight: 14,
      color: c.leadCardCompactText,
      opacity: 0.7,
      marginTop: 2,
      flex: 1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.leadCardCompactText,
      opacity: 0.15,
      marginTop: 6,
      marginBottom: 6,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    id: {
      fontFamily: fontFamily.mono,
      fontSize: 10,
      letterSpacing: 0.5,
      color: c.leadCardCompactText,
      opacity: 0.55,
    },
    time: {
      ...typography.cardMeta,
      fontSize: 10,
      letterSpacing: 0.2,
      color: c.leadCardCompactText,
      opacity: 0.8,
    },
  });
}
