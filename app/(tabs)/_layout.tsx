// Tab bar 2F-AGRO: 5 abas (Home, Lavouras, Camera, Cooperativa, Perfil).
// Glass thick mantida do forward.
// Tab bar: 5 abas glass. SyncIndicator flutuante no topo.

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { GlassSurface } from "@/components/ui/GlassSurface";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/lib/theme";

type TabIconKey = "index" | "lavouras" | "camera" | "cooperativa" | "profile";

type TabIconRenderProps = {
  color: string;
  size: number;
  focused: boolean;
};

const ICONS: Record<
  TabIconKey,
  { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }
> = {
  index: { focused: "home", unfocused: "home-outline" },
  lavouras: { focused: "leaf", unfocused: "leaf-outline" },
  camera: { focused: "camera", unfocused: "camera-outline" },
  cooperativa: { focused: "map", unfocused: "map-outline" },
  profile: { focused: "person-circle", unfocused: "person-circle-outline" },
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const makeTabIcon = useCallback(
    (key: TabIconKey) =>
      ({ color, size, focused }: TabIconRenderProps) => (
        <Ionicons
          name={focused ? ICONS[key].focused : ICONS[key].unfocused}
          size={size - 2}
          color={color}
        />
      ),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <SyncIndicator />
      <Tabs
        screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        animation: "none",
        freezeOnBlur: true,
        lazy: true,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <GlassSurface
            variant="thick"
            radius={0}
            border={false}
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.bottomBarBg,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.glassBorder,
              },
            ]}
          />
        ),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fontFamily.semibold,
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabs.home"), tabBarIcon: makeTabIcon("index") }}
      />
      <Tabs.Screen
        name="lavouras"
        options={{ title: t("tabs.lavouras"), tabBarIcon: makeTabIcon("lavouras") }}
      />
      <Tabs.Screen
        name="camera"
        options={{ title: t("tabs.camera"), tabBarIcon: makeTabIcon("camera") }}
      />
      <Tabs.Screen
        name="cooperativa"
        options={{ title: t("tabs.cooperativa"), tabBarIcon: makeTabIcon("cooperativa") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t("tabs.perfil"), tabBarIcon: makeTabIcon("profile") }}
      />
      </Tabs>
    </View>
  );
}
