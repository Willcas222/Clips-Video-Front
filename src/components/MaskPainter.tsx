"use client";

import { useRef, useState } from "react";

interface Props {
  imageUrl: string;
  enabled: boolean;
  /** Se llama con la máscara (PNG con alfa: trazo opaco = zona a borrar) o null si está vacía. */
  onMaskChange: (mask: Blob | null) => void;
}

/**
 * Imagen con un lienzo superpuesto a resolución real donde el usuario pinta
 * la zona que la IA debe borrar (inpainting). El padre lo remonta (key) al
 * cambiar de imagen o de modo, lo que limpia el lienzo.
 */
export function MaskPainter({ imageUrl, enabled, onMaskChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [brush, setBrush] = useState(4);
  const [hasStrokes, setHasStrokes] = useState(false);

  const syncCanvasSize = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onMaskChange(null);
  };

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const drawTo = (canvas: HTMLCanvasElement, point: { x: number; y: number }) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const from = last.current ?? point;
    ctx.strokeStyle = "#ff2d55";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = (brush / 100) * Math.max(canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
  };

  const finishStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    setHasStrokes(true);
    canvasRef.current?.toBlob((blob) => onMaskChange(blob), "image/png");
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/10">
        {/* El contenedor toma el tamaño exacto de la imagen para que el lienzo coincida píxel a píxel. */}
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob local, no optimizable */}
          <img
            src={imageUrl}
            alt="Vista previa"
            className="block max-h-[60vh] max-w-full select-none"
            onLoad={(e) => syncCanvasSize(e.currentTarget)}
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full opacity-55 ${enabled ? "cursor-crosshair touch-none" : "pointer-events-none"}`}
          onPointerDown={(e) => {
            if (!enabled) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            drawTo(e.currentTarget, toCanvasPoint(e));
          }}
          onPointerMove={(e) => drawing.current && drawTo(e.currentTarget, toCanvasPoint(e))}
          onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
          />
        </div>
      </div>

      {enabled && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-zinc-900/70 px-4 py-3 text-sm ring-1 ring-white/5">
          <span className="text-zinc-300">Pinta sobre lo que quieres borrar</span>
          <label className="flex items-center gap-2 text-zinc-400">
            Pincel
            <input type="range" min={1} max={12} value={brush} onChange={(e) => setBrush(Number(e.target.value))} className="accent-brand-pink" />
          </label>
          <button type="button" onClick={clear} disabled={!hasStrokes} className="ml-auto rounded-lg px-3 py-1.5 text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-40">
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
