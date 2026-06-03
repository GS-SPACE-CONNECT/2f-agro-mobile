import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { fontFamily, type ThemeColors } from "@/lib/theme";

export interface ProfileAvatarProps {
  uri?: string | null;
  /** Used to derive initials when no photo is available. Pass full name or email. */
  source: string;
  size?: number;
}

export function ProfileAvatar({ uri, source, size = 96 }: ProfileAvatarProps) {
  const { colors } = useTheme();
  const [loadError, setLoadError] = useState(false);
  const styles = useMemo(() => createStyles(colors, size), [colors, size]);

  // When the URI changes (user uploaded a new avatar), reset the error
  // state so we attempt to load the new image instead of staying on placeholder.
  // URI novo (foto atualizada) reseta loadError para tentar carregar de novo.
  useEffect(() => {
    setLoadError(false);
  }, [uri]);

  const showImage = !!uri && !loadError;

  if (showImage) {
    return (
      <Image
        source={{ uri: uri as string }}
        style={styles.avatar}
        onError={() => setLoadError(true)}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.placeholder]}>
      <Text style={styles.initials}>{getInitials(source)}</Text>
    </View>
  );
}

function getInitials(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return (parts[0]?.charAt(0) ?? "?").toUpperCase();
  }
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts[parts.length - 1]?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}

function createStyles(c: ThemeColors, size: number) {
  return StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderStrong,
    },
    placeholder: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      fontFamily: fontFamily.bold,
      fontSize: size * 0.36,
      color: c.text,
    },
  });
}
