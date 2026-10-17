"use client";

import type { UploadPhase } from "@/hooks/useUpload";
import type { Job } from "@/services/types";

interface Props {
  phase: UploadPhase;
  uploadProgress: number;
  job: Job | null;
  error: string | null;
  onReset: () => void;
}

const STAGES: Array<{ key: Exclude<UploadPhase, "idle" | "failed">; label: string }> = [
  { key: "uploading", label: "Subiendo" },
  { key: "processing", label: "Procesando con IA" },
  { key: "completed", label: "Finalizado" },
];

/** Visualizador de estado: subida -> procesamiento IA -> finalizado (o error). */
export function StatusTracker({ phase, uploadProgress, job, error, onReset }: Props) {
  if (phase === "idle") return null;

  const activeIndex = phase === "failed" ? -1 : STAGES.findIndex((s) => s.key === phase);
  const progress = phase === "uploading" ? uploadProgress : phase === "completed" ? 100 : (job?.progress ?? 0);
  const label =
    phase === "uploading"
      ? `Subiendo archivo… ${uploadProgress}%`
      : phase === "processing"
        ? job?.status === "queued"
          ? "En cola, esperando a que termine otro trabajo…"
          : (job?.step ?? "Iniciando…")
        : phase === "completed"
          ? "¡Listo! Revisa los resultados abajo."
          : "Ocurrió un error";

  return (
    <div className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/5" aria-live="polite">
      <ol className="mb-4 flex items-center gap-2 text-xs">
        {STAGES.map((stage, i) => {
          const done = activeIndex > i || phase === "completed";
          const current = activeIndex === i && phase !== "completed";
          return (
            <li key={stage.key} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold
                  ${done ? "bg-emerald-500 text-zinc-950" : current ? "bg-brand-pink text-white" : "bg-zinc-800 text-zinc-500"}`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={current ? "text-zinc-100" : "text-zinc-500"}>{stage.label}</span>
              {i < STAGES.length - 1 && <span className="h-px flex-1 bg-zinc-800" />}
            </li>
          );
        })}
      </ol>

      {phase !== "failed" && (
        <>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink transition-[width] duration-700 ${phase === "processing" ? "animate-pulse" : ""}`}
              style={{ width: `${Math.max(3, progress)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-zinc-300">
              {phase !== "completed" && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-cyan" />}
              {label}
            </span>
            <span className="tabular-nums text-zinc-500">{progress}%</span>
          </div>
          {phase === "processing" && <p className="mt-2 text-xs text-zinc-500">La IA corre en tu equipo: en CPU puede tardar varios minutos.</p>}
        </>
      )}

      {job?.warnings?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-amber-300">
          {job.warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}

      {phase === "failed" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-red-500/10 p-3 text-sm break-words text-red-300 ring-1 ring-red-500/20">{error}</p>
          <button type="button" onClick={onReset} className="rounded-lg px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white/5">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
