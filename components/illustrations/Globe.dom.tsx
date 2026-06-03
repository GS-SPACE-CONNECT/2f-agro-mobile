// Globe.dom.tsx — Expo DOM Component que renderiza o globo pontilhado
// estilo MagicUI (cobe.js + WebGL). Diretiva 'use dom' empacota como
// webview transparente nativa (Expo 50+).
//
// Interativo: drag horizontal (touch ou mouse) rotaciona o globo no eixo
// phi. Theta (inclinacao N-S) fica fixo. Marker laranja apontado pra
// coordenadas do usuario (default Sao Paulo).
//
// Inercia ao soltar: rastreia velocidade angular durante o drag (EMA pra
// evitar spike no ultimo frame) e continua girando com damping
// exponencial framerate-independent ate parar.
// Globo 3D draggable com inercia: drag gira no eixo phi e continua.

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
const DRAG_SENSITIVITY = 500;
// Inercia: damping por 16ms (1 frame @60fps). 0.96 = ~3s de spin
// suave; mais alto = gira mais longe; mais baixo = para rapido.
const INERTIA_DAMPING_PER_FRAME = 0.96;
// Velocidade angular (rad/ms) abaixo desse threshold conta como parado.
const INERTIA_MIN_VELOCITY = 0.00002;
// Peso da velocidade nova no EMA — 0.3 suaviza spikes do ultimo
// pointermove (comum em touch screens quando o dedo levanta).
const VELOCITY_SMOOTHING = 0.3;

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
  // Tracking de velocidade pra inercia: ultimo pointermove (x + t)
  // e velocidade angular suavizada via EMA durante o drag.
  const lastMoveXRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number | null>(null);
  const velocityRef = useRef(0); // rad/ms
  // Handle do rAF da inercia — usado pra cancelar se rolar novo drag
  // ou unmount durante o spin.
  const inertiaFrameRef = useRef<number | null>(null);

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
      // Cancela inercia em curso antes de destruir o globo pra evitar
      // que o tick rode em ref sem canvas montado.
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
        inertiaFrameRef.current = null;
      }
      globe.destroy();
    };
  }, [size, markerLat, markerLng]);

  // Cancela qualquer rAF de inercia em andamento — chamado ao iniciar
  // novo drag ou no unmount.
  const cancelInertia = () => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };

  // Anima o globo com damping exponencial framerate-independent.
  // Math.pow(damping, dt/16) garante que a desaceleracao seja igual
  // em 60fps, 120fps ou rAF irregular — sem isso, telas mais rapidas
  // parariam o globo antes.
  const startInertia = () => {
    let lastFrameTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      phiRef.current += velocityRef.current * dt;
      velocityRef.current *= Math.pow(INERTIA_DAMPING_PER_FRAME, dt / 16);

      if (Math.abs(velocityRef.current) > INERTIA_MIN_VELOCITY) {
        inertiaFrameRef.current = requestAnimationFrame(tick);
      } else {
        velocityRef.current = 0;
        inertiaFrameRef.current = null;
      }
    };
    inertiaFrameRef.current = requestAnimationFrame(tick);
  };

  // Handlers de drag horizontal:
  // - pointerdown: marca ponto inicial, cancela inercia anterior, prepara tracking.
  // - pointermove: atualiza activeMovement + suaviza velocidade (EMA).
  // - pointerup/leave/cancel: commita movimento em phi, dispara inercia.
  const handlePointerDown = (clientX: number) => {
    cancelInertia();
    pointerStartRef.current = clientX;
    lastMoveXRef.current = clientX;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };

  const handlePointerMove = (clientX: number) => {
    if (pointerStartRef.current === null) return;
    const delta = clientX - pointerStartRef.current;
    activeMovementRef.current = delta / DRAG_SENSITIVITY;

    // Atualiza velocidade angular via EMA — suaviza spikes do ultimo
    // pointermove e da uma sensacao mais natural de "peso" pro globo.
    const now = performance.now();
    if (lastMoveXRef.current !== null && lastMoveTimeRef.current !== null) {
      const dt = now - lastMoveTimeRef.current;
      if (dt > 0) {
        const dxAngular = (clientX - lastMoveXRef.current) / DRAG_SENSITIVITY;
        const instantVelocity = dxAngular / dt; // rad/ms
        velocityRef.current =
          velocityRef.current * (1 - VELOCITY_SMOOTHING) +
          instantVelocity * VELOCITY_SMOOTHING;
      }
    }
    lastMoveXRef.current = clientX;
    lastMoveTimeRef.current = now;
  };

  const handlePointerEnd = () => {
    if (pointerStartRef.current === null) return;
    phiRef.current += activeMovementRef.current;
    activeMovementRef.current = 0;
    pointerStartRef.current = null;
    lastMoveXRef.current = null;
    lastMoveTimeRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    if (Math.abs(velocityRef.current) > INERTIA_MIN_VELOCITY) {
      startInertia();
    }
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
