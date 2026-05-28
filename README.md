# 📱 2f-agro-mobile

> App mobile **acessível** do 2F-AGRO — dashboard central que conecta todas as disciplinas.
> Matéria: **Mobile Development & IoT** · FIAP 3ES · GS 2026.1

[![Hub](https://img.shields.io/badge/hub-2f--agro-success)](https://github.com/GS-SPACE-CONNECT/2f-agro)

## 🎯 Objetivo
App React Native + Expo como dashboard central do 2F-AGRO, voltado a pequenos agricultores familiares com foco em acessibilidade radical.

## 👥 Owner
[@jota0802](https://github.com/jota0802) · Team [`mobile`](https://github.com/orgs/GS-SPACE-CONNECT/teams/mobile)

## 🧩 Stack
Expo SDK 51+ · React Native (TS) · React Navigation 6 · React Query + Zustand · expo-camera · expo-location · expo-notifications · expo-speech (TTS) · react-native-maps · AsyncStorage

## ♿ Acessibilidade
- Android 7.0+ · Fonte mín. 16pt · Contraste WCAG AA · Cores semafóricas + ícones
- Botão 🔊 Ouvir em todo alerta (TTS) · Offline-first · < 5 MB/mês · PT-BR simples

## 🗺️ Telas
1. Home — "Sua roça hoje"
2. Câmera — "Olho na Folha" (integração com CV)
3. Detalhes da Lavoura (NDVI + cluster)
4. Mapa da Região (Leaflet)
5. Cooperativa
6. Configurações

## 🚀 Setup local
```bash
npm install
npx expo start
```

## 🔗 Links
- [Spec § 4.4 Mobile](https://github.com/GS-SPACE-CONNECT/2f-agro/blob/main/docs/specs/2026-05-27-2f-agro-design.md)
- [Backend](https://github.com/GS-SPACE-CONNECT/2f-agro-backend) · [Visão Computacional](https://github.com/GS-SPACE-CONNECT/2f-agro-iot)
