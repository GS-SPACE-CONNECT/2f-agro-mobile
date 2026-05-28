// LocalePicker simplificado Sprint 1 — so pt-BR ativo, renderiza SettingRow
// estatico. Sprint 3 reabre dropdown (Modal) se reativarmos EN.
// LocalePicker: pt-BR only Sprint 1.

import { useTranslation } from "react-i18next";

import { SettingRow } from "@/components/ui/SettingRow";

export function LocalePicker() {
  const { t } = useTranslation();
  return (
    <SettingRow
      icon="language"
      label={t("settings.language")}
      value={t("settings.language_value_pt_br")}
    />
  );
}
