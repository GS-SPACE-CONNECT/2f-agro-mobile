// Globe.dom.tsx — Expo DOM Component que renderiza o globo pontilhado
// estilo MagicUI (cobe.js + WebGL). Diretiva 'use dom' empacota como
// webview transparente nativa (Expo 50+).
//
// Interativo: drag horizontal (touch ou mouse) rotaciona o globo no eixo
// phi. Theta (inclinacao N-S) fica fixo. Marker laranja apontado pra
// coordenadas do usuario (default Sao Paulo).
// Globo 3D draggable: drag horizontal gira no eixo phi.

"use dom";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export interface GlobeProps {
  size?: number;
  /** Latitude do marker laranja (cidade do usuario). Default SP. */
  markerLat?: number;
  /** Longitude do marker laranja (cidade do usuario). Default SP. */
  markerLng?: number;
}

const INITIAL_PHI = 5.5;
const INITIAL_THETA = 0.3;
const DRAG_SENSITIVITY = 200;

export default function Globe({
  size = 324,
  markerLat = -23.55,
  markerLng = -46.63,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Phi acumulado entre dragdrag: state.phi = phi + activeMovement.
  // Mantemos em refs pra mutar dentro do onRender sem re-render.
  const phiRef = useRef(INITIAL_PHI);
  // Posicao inicial do clientX no inicio do drag. null = nao dragging.
  const pointerStartRef = useRef<number | null>(null);
  // Movimento ativo durante o drag (delta clientX / sensitivity).
  // Quando o drag termina, este valor eh acumulado em phiRef.
  const activeMovementRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      // Pose centralizando America do Sul (Brasil ao centro).
      phi: INITIAL_PHI,
      theta: INITIAL_THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [249 / 255, 115 / 255, 22 / 255], // #f97316 laranja
      glowColor: [0.6, 0.6, 0.6],
      markers: [
        { location: [markerLat, markerLng] as [number, number], size: 0.07 },
      ],
      // onRender lê de refs — phi atual = base + movimento ativo do drag.
      // Theta fixo (sem rotacao vertical).
      onRender: (state) => {
        state.phi = phiRef.current + activeMovementRef.current;
        state.theta = INITIAL_THETA;
      },
    });
    return () => {
      globe.destroy();
    };
  }, [size, markerLat, markerLng]);

  // Handlers de drag horizontal:
  // - pointerdown: marca o ponto inicial e muda cursor pra "grabbing".
  // - pointermove: calcula delta clientX / sensitivity, atualiza ref.
  // - pointerup/leave: commita o movimento em phiRef, reseta active.
  const handlePointerDown = (clientX: number) => {
    pointerStartRef.current = clientX;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };

  const handlePointerMove = (clientX: number) => {
    if (pointerStartRef.current === null) return;
    const delta = clientX - pointerStartRef.current;
    activeMovementRef.current = delta / DRAG_SENSITIVITY;
  };

  const handlePointerEnd = () => {
    if (pointerStartRef.current === null) return;
    // Commit do movimento ativo em phiRef pra proximo drag comecar daqui.
    phiRef.current += activeMovementRef.current;
    activeMovementRef.current = 0;
    pointerStartRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => handlePointerDown(e.clientX)}
      onPointerMove={(e) => handlePointerMove(e.clientX)}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{
        width: size,
        height: size,
        background: "transparent",
        display: "block",
        cursor: "grab",
        touchAction: "none", // bloqueia scroll vertical quando drag no globo
      }}
    />
  );
}
