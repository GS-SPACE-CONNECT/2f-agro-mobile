import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateName,
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  NAME_MIN_LENGTH,
} from "@/lib/validation";

// ─── validateEmail ──────────────────────────────────────────────────
describe("validateEmail", () => {
  it("retorna undefined para e-mail válido", () => {
    expect(validateEmail("joao@fazenda.com")).toBeUndefined();
  });

  it("retorna undefined para e-mail com espaços em volta (trima)", () => {
    expect(validateEmail("  joao@fazenda.com  ")).toBeUndefined();
  });

  it("retorna erro de obrigatório para string vazia", () => {
    expect(validateEmail("")).toEqual({ key: "validation.email_required" });
  });

  it("retorna erro de obrigatório para somente espaços", () => {
    expect(validateEmail("   ")).toEqual({ key: "validation.email_required" });
  });

  it("retorna erro de formato para e-mail sem @", () => {
    expect(validateEmail("joaofazenda.com")).toEqual({
      key: "validation.email_invalid",
    });
  });

  it("retorna erro de formato para e-mail sem domínio", () => {
    expect(validateEmail("joao@")).toEqual({ key: "validation.email_invalid" });
  });
});

// ─── validatePassword ───────────────────────────────────────────────
describe("validatePassword", () => {
  it("retorna undefined para senha válida (>= 6 chars)", () => {
    expect(validatePassword("abc123")).toBeUndefined();
  });

  it("retorna erro de obrigatório para string vazia", () => {
    expect(validatePassword("")).toEqual({
      key: "validation.password_required",
    });
  });

  it("retorna erro de tamanho mínimo para senha curta", () => {
    expect(validatePassword("abc")).toEqual({
      key: "validation.password_too_short",
      vars: { count: PASSWORD_MIN_LENGTH },
    });
  });

  it("aceita exatamente PASSWORD_MIN_LENGTH caracteres", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH))).toBeUndefined();
  });
});

// ─── validateRequired ───────────────────────────────────────────────
describe("validateRequired", () => {
  it("retorna undefined quando valor está preenchido", () => {
    expect(validateRequired("Caruaru", "cidade")).toBeUndefined();
  });

  it("retorna erro com campo referenciado para valor vazio", () => {
    expect(validateRequired("", "cidade")).toEqual({
      key: "validation.required",
      vars: { field: "cidade" },
    });
  });

  it("retorna erro para valor somente com espaços", () => {
    expect(validateRequired("   ", "nome")).toEqual({
      key: "validation.required",
      vars: { field: "nome" },
    });
  });
});

// ─── validateName ───────────────────────────────────────────────────
describe("validateName", () => {
  it("retorna undefined para nome válido", () => {
    expect(validateName("João")).toBeUndefined();
  });

  it("retorna erro de obrigatório para string vazia", () => {
    expect(validateName("")).toEqual({ key: "validation.name_required" });
  });

  it("retorna erro de tamanho para nome com 1 caractere", () => {
    expect(validateName("J")).toEqual({ key: "validation.name_short" });
  });

  it("aceita nome com exatamente NAME_MIN_LENGTH caracteres", () => {
    expect(validateName("Jo")).toBeUndefined();
  });
});

// ─── constantes exportadas ──────────────────────────────────────────
describe("constantes de validação", () => {
  it("EMAIL_REGEX aceita formato padrão", () => {
    expect(EMAIL_REGEX.test("a@b.co")).toBe(true);
  });

  it("EMAIL_REGEX rejeita sem domínio", () => {
    expect(EMAIL_REGEX.test("a@b")).toBe(false);
  });

  it("PASSWORD_MIN_LENGTH é 6", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(6);
  });

  it("NAME_MIN_LENGTH é 2", () => {
    expect(NAME_MIN_LENGTH).toBe(2);
  });
});
