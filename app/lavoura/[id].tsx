// Detalhe da lavoura — drill-down com NDVI temporal, ML, cluster, alertas
// e acoes recomendadas. Layout editorial: tipografia thin-weight + hairline
// separadores, sem chrome de card. Cor so no accent (saude palette).

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { LavouraStatusBadge } from "@/components/ui/LavouraStatusBadge";
import { AlertSeverityBadge } from "@/components/ui/AlertSeverityBadge";
import { NdviChart } from "@/components/domain/NdviChart";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { hexToRgba } from "@/lib/color";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Alerta, LavouraDetalhe } from "@/lib/types";
import {
  alertaSeveridadePalette,
  fontFamily,
  lavouraSaudePalette,
  spacing,
  typography,
  type ThemeColors,
} from "@/lib/theme";

const PRIORIDADE_DOT_COLOR: Record<string, string> = {
  alta: "#F97316",
  media: "#EAB308",
  baixa: "#6B7280",
};

export default function LavouraDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [detalhe, setDetalhe] = useState<LavouraDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await api.getDetalheLavoura(id);
      setDetalhe(d);
    } catch {
      // Sprint 1: mock nunca falha. Sprint 2: tratar erro real.
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Loading
  if (loading) {
    return (
      <AppBackground>
        <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
          <BackButton colors={colors} styles={styles} t={t} />
          <LoadingScreen inline label={t("common.loading")} />
        </View>
      </AppBackground>
    );
  }

  // Nao encontrado
  if (!detalhe) {
    return (
      <AppBackground>
        <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
          <BackButton colors={colors} styles={styles} t={t} />
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="leaf-outline"
              title={t("lavoura_detail.not_found_title")}
              description={t("lavoura_detail.not_found_description")}
            />
          </View>
        </View>
      </AppBackground>
    );
  }

  const palette = lavouraSaudePalette[detalhe.saude];
  const probPct = Math.round(detalhe.mlPredicao.probabilidadeRisco * 100);
  const heroColor = hexToRgba(colors.text, 0.55);

  const areaText = detalhe.areaHectares.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <AppBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing["6xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Voltar */}
        <BackButton colors={colors} styles={styles} t={t} />

        {/* Header: cultura + meta + badge */}
        <Text style={styles.culturaLabel}>
          {detalhe.culturaLabel.toUpperCase()}
        </Text>
        <Text style={styles.metaLine}>
          {detalhe.identificador} · {areaText} ha
        </Text>
        <LavouraStatusBadge saude={detalhe.saude} style={styles.badge} />

        {/* ── NDVI ── */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("lavoura_detail.ndvi_section")}
        </Text>
        <View style={styles.heroRow}>
          <Text style={[styles.heroNumber, { color: heroColor }]}>
            {detalhe.ndviAtual?.toFixed(2) ?? "—"}
          </Text>
          <Text style={styles.heroSuffix}>
            {t("lavoura_detail.ndvi_atual")}
          </Text>
        </View>
        <NdviChart
          leituras={detalhe.ndviHistorico}
          accentColor={palette.color}
        />

        {/* ── Modelo ML ── */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("lavoura_detail.ml_section")}
        </Text>
        <View style={styles.heroRow}>
          <Text style={[styles.heroNumber, { color: heroColor }]}>
            {probPct}
            <Text style={[styles.heroPercent, { color: heroColor }]}>%</Text>
          </Text>
        </View>
        <Text style={styles.heroCaption}>
          {t("lavoura_detail.ml_probabilidade")}
        </Text>

        {/* ── K-Means ── */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("lavoura_detail.cluster_section")}
        </Text>
        <Text style={styles.clusterLabel}>
          {detalhe.mlPredicao.clusterLabel}
        </Text>
        <Text style={styles.clusterMeta}>
          {t("lavoura_detail.cluster_numero", { n: detalhe.mlPredicao.cluster })}
        </Text>
        <Text style={styles.clusterDesc}>
          {detalhe.mlPredicao.clusterDescricao}
        </Text>

        {/* ── Alertas ── */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("lavoura_detail.alertas_section")}
        </Text>
        {detalhe.alertas.length === 0 ? (
          <Text style={styles.emptyHint}>
            {t("lavoura_detail.alertas_empty")}
          </Text>
        ) : (
          detalhe.alertas.map((a) => (
            <AlertRow key={a.id} alerta={a} colors={colors} styles={styles} t={t} />
          ))
        )}

        {/* ── Acoes recomendadas ── */}
        <View style={styles.separator} />
        <Text style={styles.sectionLabel}>
          {t("lavoura_detail.acoes_section")}
        </Text>
        {detalhe.acoesRecomendadas.map((acao) => (
          <View key={acao.id} style={styles.acaoRow}>
            <View
              style={[
                styles.acaoDot,
                { backgroundColor: PRIORIDADE_DOT_COLOR[acao.prioridade] ?? colors.textMuted },
              ]}
            />
            <View style={styles.acaoContent}>
              <Text style={styles.acaoTitulo}>{acao.titulo}</Text>
              <Text style={styles.acaoDesc}>{acao.descricao}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

// ── Sub-componentes inline ──

function BackButton({
  colors,
  styles,
  t,
}: {
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.text} />
      <Text style={styles.backLabel}>{t("common.back")}</Text>
    </Pressable>
  );
}

function AlertRow({
  alerta,
  colors,
  styles,
  t,
}: {
  alerta: Alerta;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const sevPalette = alertaSeveridadePalette[alerta.severidade];
  const dataFormatada = formatRelativeTime(alerta.criadoEm, t);

  return (
    <View style={styles.alertaRow}>
      <View style={[styles.alertaDot, { backgroundColor: sevPalette.color }]} />
      <Text style={styles.alertaTipo}>{alerta.tipoLabel}</Text>
      <AlertSeverityBadge severidade={alerta.severidade} />
      <View style={styles.spacer} />
      <Text style={styles.alertaData}>{dataFormatada}</Text>
    </View>
  );
}

// ── Styles ──

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing["2xl"] },
    scroll: { flex: 1 },
    content: { paddingHorizontal: spacing["2xl"] },
    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    // Back
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: spacing.sm,
      gap: 4,
    },
    backLabel: {
      ...typography.body,
      fontFamily: fontFamily.medium,
      color: c.text,
    },

    // Header
    culturaLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      letterSpacing: 4,
      color: c.text,
      marginTop: spacing.xl,
    },
    metaLine: {
      fontFamily: fontFamily.light,
      fontSize: 13,
      letterSpacing: 0.3,
      color: c.textMuted,
      marginTop: spacing.xs,
    },
    badge: {
      marginTop: spacing.md,
    },

    // Separadores
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.separator,
      marginVertical: spacing["2xl"],
    },

    // Secoes
    sectionLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: spacing.md,
    },

    // Hero numbers (NDVI + ML)
    heroRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    heroNumber: {
      fontFamily: fontFamily.light,
      fontSize: 52,
      lineHeight: 56,
      letterSpacing: -3,
    },
    heroPercent: {
      fontFamily: fontFamily.light,
      fontSize: 20,
      letterSpacing: -1,
    },
    heroSuffix: {
      fontFamily: fontFamily.light,
      fontSize: 14,
      letterSpacing: 1,
      color: c.textMuted,
      textTransform: "uppercase",
    },
    heroCaption: {
      fontFamily: fontFamily.light,
      fontSize: 13,
      color: c.textMuted,
      marginTop: spacing.xs,
    },

    // Cluster
    clusterLabel: {
      ...typography.h3,
      color: c.text,
    },
    clusterMeta: {
      fontFamily: fontFamily.light,
      fontSize: 11,
      letterSpacing: 1,
      color: c.textSubtle,
      textTransform: "uppercase",
      marginTop: spacing.xs,
    },
    clusterDesc: {
      ...typography.body,
      color: c.textMuted,
      marginTop: spacing.sm,
    },

    // Alertas
    alertaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    alertaDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    alertaTipo: {
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      letterSpacing: 1.5,
      color: c.text,
    },
    alertaData: {
      fontFamily: fontFamily.light,
      fontSize: 11,
      color: c.textMuted,
    },
    spacer: { flex: 1 },
    emptyHint: {
      ...typography.caption,
      color: c.textSubtle,
      fontStyle: "italic",
    },

    // Acoes
    acaoRow: {
      flexDirection: "row",
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.separator,
    },
    acaoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
    },
    acaoContent: {
      flex: 1,
    },
    acaoTitulo: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: c.text,
    },
    acaoDesc: {
      ...typography.caption,
      color: c.textMuted,
      marginTop: 2,
    },
  });
}
