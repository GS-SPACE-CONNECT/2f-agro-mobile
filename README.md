# 2F-AGRO Mobile

> App mobile do **2F-AGRO** — plataforma de tecnologia espacial acessível pro pequeno agricultor familiar brasileiro.
> Global Solution FIAP 2026.1 — 3ES Engenharia de Software.

**Tagline:** *Tecnologia espacial acessível pra quem alimenta o Brasil.*

---

## Stack

- **Expo SDK 55** (managed workflow)
- **React Native 0.83** + **React 19**
- **TypeScript strict**
- **Expo Router** (file-based navigation)
- **Playfair Display** + **Manrope** (Google Fonts via @expo-google-fonts)
- **cobe** (globo 3D pontilhado)
- **i18next** + **react-i18next** (pt-BR no Sprint 1)
- **AsyncStorage** (persistência local)

## Rodando localmente

```bash
# Instalar dependências
npm install

# Iniciar dev server
npm start

# Abre Expo Go no celular (Android) ou Camera (iOS) e escaneia o QR code.
```

## Estrutura

```
app/             Expo Router pages (file-based routing)
  (tabs)/        5 abas: Home, Lavouras, Câmera, Cooperativa, Perfil
  lavoura/[id]/  Detalhe da lavoura (Sprint 2)
  alerta/[id]/   Detalhe do alerta (Sprint 2)
  login.tsx      Login mockado (Sprint 1)
components/
  domain/        Cards e badges do 2F-AGRO (Lavoura, Alerta)
  illustrations/ Globe 3D (cobe), RotatingClock
  ui/            Primitives reusáveis (Button, Card, AppBackground, etc.)
context/         Theme, Locale, UserLocation (Propriedade)
hooks/           useFadeIn, useShake
i18n/            pt-BR.json + bootstrap
lib/             api.ts (mockado), auth.ts (mockado), types, mock-data, theme
```

## Sprint atual: 1

**Entregue:**
- App rodando com dashboard "Sua roça hoje" (Greeting + AlertCardHero + Globe + grid de Lavouras).
- 5 telas navegáveis (Home, Lavouras, Câmera, Cooperativa, Perfil).
- Mock data realista (Sítio Boa Vista, Caruaru-PE, 6 lavouras, 3 alertas).
- Auth mockada — login com 1 toque.
- Theme light/dark, fontes editoriais, glass + mesh + gradient.

**Próximos sprints:**
- Sprint 2: integração com `.NET API` (`2f-agro-backend`), câmera + ONNX pra pragas (`2f-agro-iot`), TTS plena.
- Sprint 3: Mapa Leaflet (`react-native-maps`), notificações push, offline-first com React Query.

## Atribuição

Código portado e adaptado do projeto pessoal anterior do jota:
[`fwd-ford/forward-mobile`](https://github.com/fwd-ford/forward-mobile)
(FIAP — projeto anterior). Estética, layout primitives e theming
foram reaproveitados; domínio reescrito (Lead → Alerta/Lavoura);
backend trocado de Supabase pra `.NET` (Sprint 2).
Spec do port: [`docs/specs/2026-05-28-2f-agro-mobile-base-from-forward-design.md`](https://github.com/GS-SPACE-CONNECT/2f-agro/blob/main/docs/specs/2026-05-28-2f-agro-mobile-base-from-forward-design.md) no repo hub.

## Time

Líder técnico: [@jota0802](https://github.com/jota0802)
Apoio: [@brnleao](https://github.com/brnleao), [@DevRuanVieira](https://github.com/DevRuanVieira), [@lucksza](https://github.com/lucksza), [@roji-menez](https://github.com/roji-menez)
Organização: [GS-SPACE-CONNECT](https://github.com/GS-SPACE-CONNECT)

## Licença

MIT — uso acadêmico.
