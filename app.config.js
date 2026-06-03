// Config dinamica do Expo: envolve o app.json para que `extra` seja
// sobrescrito por variaveis EXPO_PUBLIC_* no build. Default aponta pro
// .NET API local em dev — Sprint 1 usa mock data, var fica preparada.
// Config dinamica: apiBaseUrl override por env var no build.

const DEFAULT_API_URL = "http://localhost:5001"; // .NET API local em dev

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
    useMock: process.env.EXPO_PUBLIC_USE_MOCK ?? "true",
  },
});
