// Tela Mapa — cooperativa regional com pinos semafóricos e filtros por evento.
//
// A superfície do mapa é um Expo DOM Component (Leaflet + tiles CARTO/OSM),
// não react-native-maps: no Expo Go Android o Google Maps exige API key e
// sem ela não renderiza nada. Ver components/domain/CooperativaMap.dom.tsx.

import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import CooperativaMap, {
  type MapPin,
} from "@/components/domain/CooperativaMap.dom";
import { useTheme } from "@/context/ThemeContext";
import { COOPERATIVA_PROPRIEDADES } from "@/lib/mock-cooperativa";
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
const REGIAO_INICIAL = {
  latitude: -8.2839,
  longitude: -35.9758,
  zoom: 14,
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

  // DOM components só recebem props serializáveis — traduz e achata aqui.
  const pins = useMemo<MapPin[]>(
    () =>
      propriedadesFiltradas.map((prop) => ({
        id: prop.id,
        nome: prop.nome,
        dono: prop.donoNome,
        areaHa: prop.areaTotalHectares,
        lat: prop.lat,
        lng: prop.lng,
        cor: corPino(prop.saudeGeral),
        saudeLabel: t("cooperativa.pin_saude", {
          status: t(`lavoura.saude.${prop.saudeGeral}`),
        }),
        alertaLabel: prop.alertaAtivo?.tipoLabel,
        alertaReco: prop.alertaAtivo?.recomendacao,
        alertaCor: prop.alertaAtivo
          ? alertaSeveridadePalette[prop.alertaAtivo.severidade].color
          : undefined,
      })),
    [propriedadesFiltradas, t],
  );

  const handleFiltro = useCallback((filtro: FiltroTipo) => {
    setFiltroAtivo(filtro);
  }, []);

  return (
    <View style={styles.container}>
      {/* Mapa full-bleed (webview Leaflet) */}
      <View style={StyleSheet.absoluteFillObject}>
        <CooperativaMap
          dom={{ style: { flex: 1 }, scrollEnabled: false }}
          pins={pins}
          dark={mode === "dark"}
          centerLat={REGIAO_INICIAL.latitude}
          centerLng={REGIAO_INICIAL.longitude}
          zoom={REGIAO_INICIAL.zoom}
        />
      </View>

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

      {/* Atribuição dos tiles (obrigatória pelo OSM/CARTO) */}
      <Text style={[styles.attribution, { color: colors.textMuted, bottom: insets.bottom + 90 }]}>
        © OpenStreetMap · © CARTO
      </Text>
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
    attribution: {
      position: "absolute",
      right: spacing.lg,
      fontFamily: fontFamily.regular,
      fontSize: 9,
      letterSpacing: 0.2,
    },
  });
}
