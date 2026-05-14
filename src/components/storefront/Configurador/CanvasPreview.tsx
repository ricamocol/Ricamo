"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from "react-konva";
import type { Stage as StageType } from "konva/lib/Stage";
import type { ConfigState } from "./ConfiguradorClient";

interface Props {
  config: ConfigState;
  shirtColor: string;
}

export interface CanvasPreviewHandle {
  toDataURL: () => string;
}

const CANVAS_W = 400;
const CANVAS_H = 500;

// Fuente → familia CSS compatible con Konva canvas
const FONT_MAP: Record<string, string> = {
  "Instrument Serif": "Georgia",
  "DM Sans": "Arial",
  "Caveat": "cursive",
  "Georgia": "Georgia",
  "Arial": "Arial",
};

function useImage(src: string | null): [HTMLImageElement | undefined] {
  const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    if (!src) { setImg(undefined); return; }
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.onerror = () => setImg(undefined);
    image.src = src;
  }, [src]);

  return [img];
}

// Flechas que simulan una camiseta simple (forma con Rect + corte cuello)
function ShirtShape({ color }: { color: string }) {
  const strokeColor = color === "#F5F5F0" ? "#d8cfbb" : "transparent";
  return (
    <Group>
      {/* Cuerpo */}
      <Rect
        x={80}
        y={80}
        width={240}
        height={280}
        fill={color}
        stroke={strokeColor}
        strokeWidth={1}
        cornerRadius={4}
      />
      {/* Hombro izquierdo */}
      <Rect x={30} y={80} width={70} height={90} fill={color} stroke={strokeColor} strokeWidth={1} />
      {/* Hombro derecho */}
      <Rect x={300} y={80} width={70} height={90} fill={color} stroke={strokeColor} strokeWidth={1} />
      {/* Cuello — recorte visual */}
      <Rect x={155} y={60} width={90} height={40} fill="#e8e0c8" />
      {/* Línea cuello redondo (elipse simulada) */}
      <Rect x={150} y={75} width={100} height={30} fill={color} cornerRadius={50} />
    </Group>
  );
}

const CanvasPreview = forwardRef<CanvasPreviewHandle, Props>(function CanvasPreview(
  { config, shirtColor },
  ref
) {
  const stageRef = useRef<StageType>(null);
  const [designImage] = useImage(config.design?.image_url ?? null);

  useImperativeHandle(ref, () => ({
    toDataURL: () => stageRef.current?.toDataURL({ pixelRatio: 1.5 }) ?? "",
  }));

  const fontFamily = FONT_MAP[config.fuente] ?? "Arial";
  const hasDesign = !!designImage;
  const hasText = config.texto.trim().length > 0;

  // Área de estampado en la camiseta (centro del pecho)
  const STAMP_X = 130;
  const STAMP_Y = 140;
  const STAMP_W = 140;
  const STAMP_H = 120;

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: "block", margin: "auto" }}
    >
      <Layer>
        {/* Fondo */}
        <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#e8e0c8" />

        {/* Silueta de la camiseta */}
        <ShirtShape color={shirtColor} />

        {/* Diseño del catálogo — en área de estampado */}
        {hasDesign && designImage && (
          <KonvaImage
            image={designImage}
            x={STAMP_X}
            y={STAMP_Y}
            width={STAMP_W}
            height={STAMP_H}
            opacity={0.85}
          />
        )}

        {/* Texto personalizado */}
        {hasText && (
          <Text
            text={config.texto}
            x={80}
            y={hasDesign ? STAMP_Y + STAMP_H + 8 : STAMP_Y + 40}
            width={240}
            align="center"
            fontSize={22}
            fontFamily={fontFamily}
            fill={config.colorTexto}
          />
        )}

        {/* Watermark sutil */}
        <Text
          text="Ricamo — preview"
          x={0}
          y={CANVAS_H - 20}
          width={CANVAS_W}
          align="center"
          fontSize={10}
          fontFamily="Arial"
          fill="#6a6356"
          opacity={0.5}
        />
      </Layer>
    </Stage>
  );
});

export default CanvasPreview;
