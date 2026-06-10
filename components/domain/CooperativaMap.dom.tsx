// CooperativaMap.dom.tsx — Expo DOM Component que renderiza o mapa da
// cooperativa com Leaflet + tiles CARTO (base OpenStreetMap).
//
// Por que DOM component e não react-native-maps: no Expo Go Android o SDK
// do Google Maps exige API key e sem ela não desenha NADA (nem tiles, nem
// markers, nem overlays). Leaflet num webview funciona em qualquer lugar,
// igual ao Globe.dom — e tiles raster abertos não pedem chave.
//
// Pinos: circleMarker com a cor semafórica da saúde da propriedade.
// Popup: nome, dono · área, saúde e alerta ativo (se houver), com estilo
// inline coerente com o tema claro/escuro do app.

"use dom";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Subconjunto serializável da propriedade — DOM components só recebem props serializáveis. */
export interface MapPin {
  id: string;
  nome: string;
  dono: string;
  areaHa: number;
  lat: number;
  lng: number;
  /** Cor semafórica da saúde (hex). */
  cor: string;
  saudeLabel: string;
  alertaLabel?: string;
  alertaReco?: string;
  alertaCor?: string;
}

export interface CooperativaMapProps {
  pins: MapPin[];
  dark: boolean;
  centerLat: number;
  centerLng: number;
  zoom?: number;
  /** Props do webview nativo (injetado pelo transform do Expo no consumer). */
  dom?: import("expo/dom").DOMProps;
}

const TILE_LIGHT = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const TILE_DARK = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

function popupHtml(pin: MapPin, dark: boolean): string {
  const bg = dark ? "#1c1c1e" : "#ffffff";
  const text = dark ? "#f2f2f2" : "#1a1a1a";
  const muted = dark ? "#9a9a9a" : "#6b6b6b";
  const alerta = pin.alertaLabel
    ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${dark ? "#333" : "#eee"};">
         <span style="color:${pin.alertaCor ?? text};font-weight:600;font-size:11px;letter-spacing:0.8px;">${pin.alertaLabel}</span>
         <div style="color:${muted};font-size:11px;line-height:1.35;margin-top:2px;">${pin.alertaReco ?? ""}</div>
       </div>`
    : "";
  return `<div style="background:${bg};color:${text};border-radius:12px;padding:10px 12px;min-width:180px;font-family:system-ui,sans-serif;">
    <div style="font-weight:600;font-size:13px;">${pin.nome}</div>
    <div style="color:${muted};font-size:11px;margin-bottom:5px;">${pin.dono} · ${pin.areaHa} ha</div>
    <div style="display:flex;align-items:center;gap:5px;">
      <span style="width:7px;height:7px;border-radius:4px;background:${pin.cor};display:inline-block;"></span>
      <span style="color:${muted};font-size:11px;">${pin.saudeLabel}</span>
    </div>
    ${alerta}
  </div>`;
}

export default function CooperativaMap({
  pins,
  dark,
  centerLat,
  centerLng,
  zoom = 14,
}: CooperativaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Cria o mapa uma única vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
      // A atribuição fica no overlay RN da tela (estilo glass, minimal).
      attributionControl: false,
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      markersRef.current = null;
    };
    // Centro/zoom iniciais — mudanças posteriores são responsabilidade do usuário (pan/zoom).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Troca os tiles quando o tema muda.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) tileRef.current.remove();
    tileRef.current = L.tileLayer(dark ? TILE_DARK : TILE_LIGHT, {
      maxZoom: 19,
    }).addTo(map);
  }, [dark]);

  // Reconstrói os pinos quando a lista filtrada (ou tema do popup) muda.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markersRef.current) markersRef.current.remove();
    const group = L.layerGroup();
    for (const pin of pins) {
      L.circleMarker([pin.lat, pin.lng], {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: pin.cor,
        fillOpacity: 1,
      })
        .bindPopup(popupHtml(pin, dark), {
          closeButton: false,
          className: "coop-popup",
        })
        .addTo(group);
    }
    group.addTo(map);
    markersRef.current = group;
  }, [pins, dark]);

  return (
    <>
      {/* Popup do Leaflet vem com chrome branco — zera pra usar só o nosso HTML. */}
      <style>{`
        html, body { margin: 0; padding: 0; }
        .coop-popup .leaflet-popup-content-wrapper { background: transparent; box-shadow: none; padding: 0; }
        .coop-popup .leaflet-popup-content { margin: 0; }
        .coop-popup .leaflet-popup-tip { display: none; }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: "100vw", height: "100vh", background: dark ? "#141414" : "#e8e6df" }}
      />
    </>
  );
}
