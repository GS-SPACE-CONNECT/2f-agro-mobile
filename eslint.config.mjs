// ESLint flat config (v9+). Regras como warning — CI soft conforme CLAUDE.md.
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "babel.config.js",
      "metro.config.js",
      "dist/",
      "android/",
      "ios/",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Tudo warning (CI soft) — não bloqueia build
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
