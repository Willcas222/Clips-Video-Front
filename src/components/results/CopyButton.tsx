"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-lg px-2.5 py-1 text-xs text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/5"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
