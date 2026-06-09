import { formatBRL } from "@/lib/format";

describe("formatBRL", () => {
  // ─── modo padrão (moeda completa) ─────────────────────────────────
  it("formata valor inteiro em reais", () => {
    // Intl pode usar ponto ou separador de milhar conforme locale
    const result = formatBRL(1500);
    expect(result).toContain("R$");
    expect(result).toContain("1.500");
  });

  it("formata zero sem erro", () => {
    const result = formatBRL(0);
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  // ─── modo compact ─────────────────────────────────────────────────
  it("usa sufixo k para valores >= 1000 em modo compact", () => {
    expect(formatBRL(5000, { compact: true })).toBe("R$ 5.0k");
  });

  it("mantém formato normal para valores < 1000 em modo compact", () => {
    const result = formatBRL(500, { compact: true });
    expect(result).toContain("R$");
    expect(result).toContain("500");
  });

  it("arredonda k >= 10 sem decimal", () => {
    expect(formatBRL(12000, { compact: true })).toBe("R$ 12k");
  });

  it("mostra 1 decimal para k < 10", () => {
    expect(formatBRL(2500, { compact: true })).toBe("R$ 2.5k");
  });

  // ─── omitCurrency ─────────────────────────────────────────────────
  it("omite R$ quando omitCurrency é true", () => {
    const result = formatBRL(3000, { omitCurrency: true });
    expect(result).not.toContain("R$");
    expect(result).toBe("3.000");
  });

  it("omite R$ no modo compact com omitCurrency", () => {
    expect(formatBRL(5000, { compact: true, omitCurrency: true })).toBe(
      "5.0k",
    );
  });
});
