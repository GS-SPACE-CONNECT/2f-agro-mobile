import {
  toFriendlyFirstName,
  friendlyDisplayName,
  toFullName,
  friendlyFullName,
} from "@/lib/displayName";

// ─── toFriendlyFirstName ────────────────────────────────────────────
describe("toFriendlyFirstName", () => {
  it("capitaliza primeiro nome simples", () => {
    expect(toFriendlyFirstName("joao")).toBe("Joao");
  });

  it("pega só o primeiro nome de string com vários nomes", () => {
    expect(toFriendlyFirstName("joao victor franco")).toBe("Joao");
  });

  it("remove dígitos finais (ex.: username123)", () => {
    expect(toFriendlyFirstName("joao02")).toBe("Joao");
  });

  it("remove pontos, underlines e hifens do username", () => {
    // A função remove separadores mas não divide — resultado concatenado
    expect(toFriendlyFirstName("joao_victor")).toBe("Joaovictor");
  });

  it("retorna string vazia para input vazio", () => {
    expect(toFriendlyFirstName("")).toBe("");
  });

  it("retorna vazio se input for só números", () => {
    expect(toFriendlyFirstName("1234")).toBe("");
  });
});

// ─── friendlyDisplayName ────────────────────────────────────────────
describe("friendlyDisplayName", () => {
  it("prioriza fullName quando ambos estão presentes", () => {
    expect(
      friendlyDisplayName({
        fullName: "João Victor Franco",
        email: "jota@email.com",
      }),
    ).toBe("João");
  });

  it("usa e-mail como fallback quando fullName é null", () => {
    expect(friendlyDisplayName({ email: "joao@fazenda.com" })).toBe("Joao");
  });

  it("retorna null quando não há nada utilizável", () => {
    expect(friendlyDisplayName({})).toBeNull();
  });

  it("retorna null para fullName vazia e email nulo", () => {
    expect(friendlyDisplayName({ fullName: "", email: null })).toBeNull();
  });
});

// ─── toFullName ─────────────────────────────────────────────────────
describe("toFullName", () => {
  it("capitaliza todas as palavras", () => {
    expect(toFullName("joao victor")).toBe("Joao Victor");
  });

  it("mantém preposições PT-BR em minúscula", () => {
    expect(toFullName("joao da silva")).toBe("Joao da Silva");
    expect(toFullName("maria das gracas")).toBe("Maria das Gracas");
    expect(toFullName("pedro de souza")).toBe("Pedro de Souza");
  });

  it("capitaliza preposição se for a primeira palavra", () => {
    // Caso edge: preposição como primeiro token é capitalizada
    expect(toFullName("da silva")).toBe("Da Silva");
  });

  it("trima espaços extras", () => {
    expect(toFullName("  joao   victor  ")).toBe("Joao Victor");
  });
});

// ─── friendlyFullName ───────────────────────────────────────────────
describe("friendlyFullName", () => {
  it("retorna nome completo formatado quando fullName está presente", () => {
    expect(friendlyFullName({ fullName: "joao da silva" })).toBe(
      "Joao da Silva",
    );
  });

  it("usa primeiro nome do e-mail como fallback", () => {
    // toFriendlyFirstName remove o ponto: "joao.silva" → "Joaosilva"
    expect(friendlyFullName({ email: "joao.silva@email.com" })).toBe("Joaosilva");
  });

  it("retorna null quando nada está disponível", () => {
    expect(friendlyFullName({})).toBeNull();
  });
});
