// RotatingClock — texto HH:MM gigante (Manrope 80) com gradient
// transparente via MaskedView + LinearGradient. Atualiza por minuto.
// Spec Figma node 1:2 (light) / 8:55 (dark): clockGradientFrom/Mid/To.
// Memoizado pra evitar re-render de Globe/HeroStatsBlock no tick.
// Relogio gigante decorativo da home, atualiza por minuto.

import { useEffect, useMemo, useState, memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/context/ThemeContext";
import { typography } from "@/lib/theme";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function nowHHMM(date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const REFRESH_MS = 60_000;

function RotatingClockComponent() {
  const { colors } = useTheme();
  const [value, setValue] = useState<string>(() => nowHHMM());

  useEffect(() => {
    const id = setInterval(() => {
      setValue(nowHHMM());
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const gradientColors = useMemo(
    () =>
      [
        colors.clockGradientFrom,
        colors.clockGradientMid,
        colors.clockGradientTo,
      ] as [string, string, string],
    [colors.clockGradientFrom, colors.clockGradientMid, colors.clockGradientTo],
  );

  return (
    <MaskedView
      style={styles.container}
      maskElement={
        <View style={styles.maskInner}>
          {/* Cor do texto = cor final do gradient. Quando MaskedView nao
              aplica (web fallback), a cor visivel ainda fica theme-aware.
              numberOfLines=1 garante que digitos como "22:48" nunca quebrem. */}
          <Text
            style={[styles.text, { color: colors.clockGradientTo }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
        </View>
      }
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.gradient}
      />
    </MaskedView>
  );
}

export const RotatingClock = memo(RotatingClockComponent);

const styles = StyleSheet.create({
  container: {
    // 220 com folga generosa pra "HH:MM" a 80pt Manrope letterSpacing -4
    // nao quebrar em valores como "22:48" / "10:50".
    width: 220,
    height: 90,
  },
  maskInner: {
    flex: 1,
    backgroundColor: "transparent",
  },
  // Clock hero size — usa typography.clockHero (Manrope Regular 80) com
  // letterSpacing reforcado pra dar peso visual editorial.
  text: {
    ...typography.clockHero,
    fontSize: 80,
    lineHeight: 80,
    letterSpacing: -4,
  },
  gradient: {
    flex: 1,
  },
});
