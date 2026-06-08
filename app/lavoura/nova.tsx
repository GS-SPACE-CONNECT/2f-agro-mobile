// Formulário CRUD de Lavoura — cria ou edita.
// Se recebe ?id=xxx via search params, carrega dados existentes (modo edição).
// Usa Input reutilizável + validação i18n + useMutation do React Query.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppBackground } from "@/components/ui/AppBackground";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/context/ThemeContext";
import {
  useCriarLavoura,
  useAtualizarLavoura,
  useLavoura,
} from "@/hooks/useQueries";
import { useShake } from "@/hooks/useShake";
import { haptic } from "@/lib/haptics";
import { CULTURA_LABELS } from "@/lib/mock-data";
import {
  fontFamily,
  radius,
  spacing,
  typography,
  type ThemeColors,
} from "@/lib/theme";
import type { CriarLavouraRequest, CulturaTipo } from "@/lib/types";
import {
  validateArea,
  validateIdentificador,
  type ValidationResult,
} from "@/lib/validation";

const CULTURAS: { key: CulturaTipo; label: string }[] = (
  Object.entries(CULTURA_LABELS) as [CulturaTipo, string][]
).map(([key, label]) => ({ key, label }));

export default function LavouraFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Dados existentes (modo edição)
  const { data: lavouraExistente } = useLavoura(id ?? "", { enabled: isEdit });

  // Estado do formulário
  const [cultura, setCultura] = useState<CulturaTipo | null>(null);
  const [identificador, setIdentificador] = useState("");
  const [area, setArea] = useState("");
  const [culturaError, setCulturaError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const idShake = useShake();
  const areaShake = useShake();

  // Pre-popular no modo edição
  useEffect(() => {
    if (lavouraExistente) {
      setCultura(lavouraExistente.cultura);
      setIdentificador(lavouraExistente.identificador);
      setArea(String(lavouraExistente.areaHectares));
    }
  }, [lavouraExistente]);

  // Mutations
  const criarMutation = useCriarLavoura();
  const atualizarMutation = useAtualizarLavoura();
  const loading = criarMutation.isPending || atualizarMutation.isPending;

  function resolveError(result: ValidationResult): string | null {
    if (!result) return null;
    return t(result.key, result.vars ?? {});
  }

  const onSubmit = useCallback(async () => {
    // Validar
    const cErr = !cultura ? t("validation.cultura_required") : null;
    const iErr = resolveError(validateIdentificador(identificador));
    const aErr = resolveError(validateArea(area));

    setCulturaError(cErr);
    setIdError(iErr);
    setAreaError(aErr);
    setSubmitError(null);

    if (iErr) idShake.shake();
    if (aErr) areaShake.shake();
    if (cErr || iErr || aErr) {
      haptic.warning();
      return;
    }

    const payload: CriarLavouraRequest = {
      propriedadeId: "prop-1",
      cultura: cultura!,
      identificador: identificador.trim(),
      areaHectares: parseFloat(area.replace(",", ".")),
    };

    try {
      if (isEdit && id) {
        await atualizarMutation.mutateAsync({ id, data: payload });
      } else {
        await criarMutation.mutateAsync(payload);
      }
      haptic.success();
      router.back();
    } catch {
      setSubmitError(t("lavoura_form.erro"));
      haptic.warning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cultura, identificador, area, isEdit, id]);

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing["6xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Voltar */}
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

        {/* Título */}
        <Text style={styles.title}>
          {isEdit ? t("lavoura_form.title_editar") : t("lavoura_form.title_criar")}
        </Text>

        {/* Cultura selector */}
        <Text style={styles.sectionLabel}>{t("lavoura_form.cultura_label")}</Text>
        <View style={styles.culturaGrid}>
          {CULTURAS.map(({ key, label }) => {
            const selected = cultura === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setCultura(key);
                  if (culturaError) setCulturaError(null);
                  haptic.selection();
                }}
                style={[
                  styles.culturaChip,
                  selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.culturaChipLabel,
                    selected && { color: colors.text, fontFamily: fontFamily.semibold },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {culturaError ? <Text style={styles.errorText}>{culturaError}</Text> : null}

        {/* Identificador */}
        <Input
          label={t("lavoura_form.identificador_label")}
          placeholder={t("lavoura_form.identificador_placeholder")}
          value={identificador}
          onChangeText={(v) => {
            setIdentificador(v);
            if (idError) setIdError(null);
          }}
          error={idError}
          icon="pricetag-outline"
          shakeAnim={idShake.translateX}
          autoCapitalize="characters"
          returnKeyType="next"
          editable={!loading}
        />

        {/* Área */}
        <Input
          label={t("lavoura_form.area_label")}
          placeholder={t("lavoura_form.area_placeholder")}
          value={area}
          onChangeText={(v) => {
            setArea(v);
            if (areaError) setAreaError(null);
          }}
          error={areaError}
          icon="resize-outline"
          shakeAnim={areaShake.translateX}
          keyboardType="decimal-pad"
          returnKeyType="done"
          editable={!loading}
        />

        {/* Erro geral */}
        {submitError ? (
          <Text style={styles.submitError}>{submitError}</Text>
        ) : null}

        {/* Botão salvar */}
        <Pressable
          onPress={() => void onSubmit()}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t("lavoura_form.salvar")}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            loading && styles.saveBtnDisabled,
          ]}
        >
          <Text style={styles.saveBtnLabel}>
            {loading ? t("lavoura_form.salvando") : t("lavoura_form.salvar")}
          </Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: spacing["2xl"] },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    backLabel: {
      ...typography.body,
      fontFamily: fontFamily.medium,
      color: c.text,
    },
    title: {
      fontFamily: fontFamily.bold,
      fontSize: 28,
      color: c.text,
      marginTop: spacing.md,
      marginBottom: spacing["2xl"],
    },
    sectionLabel: {
      ...typography.caption,
      fontWeight: "600",
      color: c.textMuted,
      marginBottom: spacing.sm,
    },
    culturaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    culturaChip: {
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: "transparent",
    },
    culturaChipLabel: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: c.textMuted,
    },
    errorText: {
      ...typography.caption,
      fontWeight: "500",
      color: c.error,
      marginBottom: spacing.md,
    },
    submitError: {
      ...typography.caption,
      fontWeight: "500",
      color: c.error,
      textAlign: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    saveBtn: {
      backgroundColor: c.primary,
      borderRadius: radius.pill,
      paddingVertical: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.xl,
    },
    saveBtnPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnLabel: {
      ...typography.bodyLg,
      fontFamily: fontFamily.semibold,
      color: c.primaryText,
    },
  });
}
