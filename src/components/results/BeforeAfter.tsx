"use client";

import { useState } from "react";

/** Comparador antes/después con un deslizador. */
export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/10 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element -- archivo servido por la API local */}
      <img src={after} alt="Después" className="block max-h-[65vh] max-w-full" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- archivo servido por la API local */}
        <img src={before} alt="Antes" className="h-full w-full object-fill" draggable={false} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,.6)]" style={{ left: `${position}%` }} />
      <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">Antes</span>
      <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">Después</span>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Comparar antes y después"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
