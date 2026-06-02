// Tela Mapa — região da cooperativa. Mostra propriedades vizinhas com pinos
// semafóricos (saúde da lavoura). Tap no pino abre callout com detalhes.
// Filtros por tipo de evento (seca, praga, geada, etc). Tiles cacheados offline.

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("cooperativa.title")}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {t("cooperativa.properties_count", {
            count: propriedadesFiltradas.length,
          })}
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  label: { fontFamily: fontFamily.regular, fontSize: fontSize.sm },
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
    width: 240,
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  nome: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    marginBottom: 2,
  },
  dono: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  alertTextWrap: { flex: 1 },
  alertTipo: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  alertReco: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 16,
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
    },
    headerTitle: {
      fontFamily: fontFamily.displaySemibold,
      fontSize: fontSize["2xl"],
      letterSpacing: -0.8,
    },
    headerSubtitle: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      marginTop: 2,
    },
    filtersContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    filtersScroll: {
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: 9999,
      borderWidth: 1,
    },
    filterChipText: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
    },
    legend: {
      position: "absolute",
      left: spacing.xl,
      backgroundColor: colors.glassBase,
      borderRadius: 10,
      padding: spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorder,
    },
  });
}
