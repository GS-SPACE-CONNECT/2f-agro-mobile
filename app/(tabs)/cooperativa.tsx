// Tela Mapa — cooperativa regional com pinos semafóricos e filtros por evento.

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Marker, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/context/ThemeContext";
import {
  COOPERATIVA_PROPRIEDADES,
  type PropriedadeCooperativa,
} from "@/lib/mock-cooperativa";
import type { AlertaTipo } from "@/lib/types";
import {
  alertaSeveridadePalette,
  fontFamily,
  fontSize,
  lavouraSaudePalette,
  radius,
  spacing,
  type LavouraSaudeKey,
  type ThemeColors,
} from "@/lib/theme";

// Estilo escuro para Google Maps (Android). Apple Maps usa userInterfaceStyle.
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#141414" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#242424" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a2e1a" }],
  },
];

// Tipos de alerta pra filtro.
type FiltroTipo = "todos" | AlertaTipo;

const FILTROS: FiltroTipo[] = [
  "todos",
  "seca",
  "praga",
  "geada",
  "chuva_forte",
  "queimada",
];

const FILTRO_I18N_KEY: Record<FiltroTipo, string> = {
  todos: "cooperativa.filter_all",
  seca: "cooperativa.filter_seca",
  praga: "cooperativa.filter_praga",
  geada: "cooperativa.filter_geada",
  chuva_forte: "cooperativa.filter_chuva",
  queimada: "cooperativa.filter_queimada",
};

/** Cor do pino baseada na saúde geral da propriedade (semáforo). */
function corPino(saude: LavouraSaudeKey): string {
  return lavouraSaudePalette[saude].color;
}

/** Região inicial centralizada na cooperativa. */
const REGIAO_INICIAL: Region = {
  latitude: -8.2839,
  longitude: -35.9758,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function MapaCooperativaScreen() {
  const { t } = useTranslation();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filtroAtivo, setFiltroAtivo] = useState<FiltroTipo>("todos");

  // Filtra propriedades pelo tipo de alerta ativo.
  const propriedadesFiltradas = useMemo(() => {
    if (filtroAtivo === "todos") return COOPERATIVA_PROPRIEDADES;
    return COOPERATIVA_PROPRIEDADES.filter(
      (p) => p.alertaAtivo?.tipo === filtroAtivo,
    );
  }, [filtroAtivo]);

  const handleFiltro = useCallback((filtro: FiltroTipo) => {
    setFiltroAtivo(filtro);
  }, []);

  return (
    <View style={styles.container}>
      {/* Mapa full-bleed */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={REGIAO_INICIAL}
        customMapStyle={mode === "dark" ? DARK_MAP_STYLE : undefined}
        userInterfaceStyle={mode === "dark" ? "dark" : "light"}
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        cacheEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.text}
        loadingBackgroundColor={colors.bg}
      >
        {propriedadesFiltradas.map((prop) => (
          <Marker
            key={prop.id}
            identifier={prop.id}
            coordinate={{ latitude: prop.lat, longitude: prop.lng }}
            pinColor={corPino(prop.saudeGeral)}
          >
            <Callout tooltip>
              <CalloutContent propriedade={prop} colors={colors} t={t} />
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header sobreposto — glass, minimal */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("cooperativa.title")}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.glassBase, borderColor: colors.glassBorder }]}>
            <Text style={[styles.countBadgeText, { color: colors.textMuted }]}>
              {propriedadesFiltradas.length}
            </Text>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {t("cooperativa.subtitle")}
        </Text>
      </View>

      {/* Barra de filtros — horizontal scroll sobre o mapa */}
      <View style={[styles.filtersContainer, { paddingTop: insets.top + 60 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTROS.map((filtro) => {
            const ativo = filtroAtivo === filtro;
            return (
              <Pressable
                key={filtro}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: ativo
                      ? colors.text
                      : colors.glassBase,
                    borderColor: ativo
                      ? colors.text
                      : colors.glassBorder,
                  },
                ]}
                onPress={() => handleFiltro(filtro)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: ativo ? colors.primaryText : colors.text,
                    },
                  ]}
                >
                  {t(FILTRO_I18N_KEY[filtro])}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Legenda semáforo — canto inferior esquerdo */}
      <View style={[styles.legend, { bottom: insets.bottom + 90 }]}>
        <LegendItem cor={lavouraSaudePalette.saudavel.color} label={t("lavoura.saude.saudavel")} colors={colors} />
        <LegendItem cor={lavouraSaudePalette.atencao.color} label={t("lavoura.saude.atencao")} colors={colors} />
        <LegendItem cor={lavouraSaudePalette.risco.color} label={t("lavoura.saude.risco")} colors={colors} />
        <LegendItem cor={lavouraSaudePalette.perdida.color} label={t("lavoura.saude.perdida")} colors={colors} />
      </View>
    </View>
  );
}

// ─── Componentes internos ──────────────────────────────────────────────────

function LegendItem({
  cor,
  label,
  colors,
}: {
  cor: string;
  label: string;
  colors: ThemeColors;
}) {
  return (
    <View style={legendStyles.row}>
      <View style={[legendStyles.dot, { backgroundColor: cor }]} />
      <Text style={[legendStyles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  label: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, letterSpacing: 0.2 },
});

/** Callout customizado — glass minimal, sem card chrome pesado. */
function CalloutContent({
  propriedade,
  colors,
  t,
}: {
  propriedade: PropriedadeCooperativa;
  colors: ThemeColors;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const temAlerta = !!propriedade.alertaAtivo;
  const severidadeCor = temAlerta
    ? alertaSeveridadePalette[propriedade.alertaAtivo!.severidade].color
    : undefined;

  return (
    <View
      style={[
        calloutStyles.container,
        { backgroundColor: colors.bgElevated },
      ]}
    >
      <Text style={[calloutStyles.nome, { color: colors.text }]}>
        {propriedade.nome}
      </Text>
      <Text style={[calloutStyles.dono, { color: colors.textMuted }]}>
        {propriedade.donoNome} · {t("cooperativa.pin_area", { area: propriedade.areaTotalHectares })}
      </Text>

      {/* Saúde geral */}
      <View style={calloutStyles.statusRow}>
        <View
          style={[
            calloutStyles.statusDot,
            { backgroundColor: corPino(propriedade.saudeGeral) },
          ]}
        />
        <Text style={[calloutStyles.statusText, { color: colors.textMuted }]}>
          {t("cooperativa.pin_saude", {
            status: t(`lavoura.saude.${propriedade.saudeGeral}`),
          })}
        </Text>
      </View>

      {/* Alerta ativo (se houver) */}
      {temAlerta && (
        <View style={[calloutStyles.alertRow, { borderTopColor: colors.separator }]}>
          <Ionicons name="warning-outline" size={14} color={severidadeCor} />
          <View style={calloutStyles.alertTextWrap}>
            <Text style={[calloutStyles.alertTipo, { color: severidadeCor }]}>
              {propriedade.alertaAtivo!.tipoLabel}
            </Text>
            <Text
              style={[calloutStyles.alertReco, { color: colors.textMuted }]}
              numberOfLines={2}
            >
              {propriedade.alertaAtivo!.recomendacao}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const calloutStyles = StyleSheet.create({
  container: {
    width: 230,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  nome: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  dono: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    letterSpacing: 0.1,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  statusText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    letterSpacing: 0.1,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
  },
  alertTextWrap: { flex: 1 },
  alertTipo: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  alertReco: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: 15,
  },
});

// ─── Estilos principais ────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
      backgroundColor: colors.glassBase,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.glassBorder,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    headerTitle: {
      fontFamily: fontFamily.semibold,
      fontSize: fontSize.xl,
      letterSpacing: -0.3,
    },
    countBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
    },
    countBadgeText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
      letterSpacing: 0.2,
    },
    headerSubtitle: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      letterSpacing: 0.2,
      marginTop: 1,
    },
    filtersContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    filtersScroll: {
      paddingHorizontal: spacing.xl,
      gap: spacing.xs + 2,
    },
    filterChip: {
      paddingHorizontal: spacing.md + 2,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    filterChipText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.xs,
      letterSpacing: 0.3,
    },
    legend: {
      position: "absolute",
      left: spacing.lg,
      backgroundColor: colors.glassBase,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm - 1,
      paddingHorizontal: spacing.sm + 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorder,
    },
  });
}
