"use client";

import type { HealthReport, JobSummary, MediaKind } from "@/services/types";

interface Props {
  mode: MediaKind;
  onModeChange: (mode: MediaKind) => void;
  health: HealthReport | null;
  healthError: string | null;
  onRefreshHealth: (fresh?: boolean) => void;
  jobs: JobSummary[];
  activeJobId: string | null;
  onOpenJob: (jobId: string) => void;
  onOpenTrends: () => void;
  trendsSummary: string;
  trendsStale: boolean;
  disabled?: boolean;
}

const MODES: Array<{ value: MediaKind; label: string; hint: string; icon: string }> = [
  { value: "image", label: "Imagen", hint: "Historias y posts", icon: "🖼️" },
  { value: "video", label: "Video", hint: "Reels y TikToks", icon: "🎬" },
];

const STATUS_STYLE: Record<JobSummary["status"], string> = {
  queued: "bg-zinc-500",
  processing: "bg-amber-400 animate-pulse",
  completed: "bg-emerald-400",
  failed: "bg-red-500",
};

function ServiceDot({ name, ok, detail }: { name: string; ok: boolean | undefined; detail?: string }) {
  return (
    <li className="flex items-center gap-2" title={detail}>
      <span className={`h-2 w-2 rounded-full ${ok === undefined ? "bg-zinc-600" : ok ? "bg-emerald-400" : "bg-red-500"}`} />
      <span className="text-zinc-300">{name}</span>
      {ok === false && detail && <span className="truncate text-xs text-red-400">{detail}</span>}
    </li>
  );
}

export function Sidebar({
  mode,
  onModeChange,
  health,
  healthError,
  onRefreshHealth,
  jobs,
  activeJobId,
  onOpenJob,
  onOpenTrends,
  trendsSummary,
  trendsStale,
  disabled,
}: Props) {
  const s = health?.services;
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 border-b border-white/5 bg-zinc-950 p-5 lg:h-screen lg:w-72 lg:border-r lg:border-b-0 lg:overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-pink text-lg font-black text-zinc-950">♪</div>
        <div>
          <p className="font-bold leading-tight text-white">Asistente de Contenido</p>
          <p className="text-xs text-zinc-500">IA 100% local</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        <p className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">Crear</p>
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(m.value)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:opacity-50
              ${mode === m.value ? "bg-zinc-800 text-white ring-1 ring-white/10" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}
          >
            <span className="text-lg">{m.icon}</span>
            <span>
              <span className="block text-sm font-medium">{m.label}</span>
              <span className="block text-xs text-zinc-500">{m.hint}</span>
            </span>
          </button>
        ))}
      </nav>

      <section className="space-y-2">
        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Música</p>
        <button
          type="button"
          onClick={onOpenTrends}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-zinc-300 ring-1 ring-white/10 transition hover:bg-zinc-900"
        >
          <span className="text-lg">📈</span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">Tendencias oficiales TikTok</span>
            <span className={`block truncate text-xs ${trendsStale ? "text-amber-400" : "text-zinc-500"}`}>{trendsSummary}</span>
          </span>
        </button>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Servicios locales</p>
          <button type="button" onClick={() => onRefreshHealth(true)} title="Volver a comprobar" className="text-xs text-zinc-500 hover:text-zinc-300">
            ↻
          </button>
        </div>
        {(health || !healthError) && (
          <ul className="space-y-1.5 text-sm">
            <ServiceDot name="Ollama" ok={s?.ollama.ok} detail={s?.ollama.detail} />
            <ServiceDot name="Python workers" ok={s?.python.ok} detail={s?.python.ok ? undefined : s?.python.detail} />
            <ServiceDot name="FFmpeg" ok={s?.ffmpeg.ok} />
          </ul>
        )}
        {healthError && (
          <p className="text-xs text-amber-400">
            {health ? "No se pudo actualizar el estado (¿la IA está ocupada?). Se muestra el último conocido." : healthError}
          </p>
        )}
        {s?.ollama.models && (
          <p className="text-xs text-zinc-600">
            {s.ollama.models.text} · {s.ollama.models.vision}
          </p>
        )}
      </section>

      <section className="min-h-0 flex-1 space-y-2">
        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Historial</p>
        {jobs.length === 0 ? (
          <p className="text-xs text-zinc-600">Aún no hay trabajos.</p>
        ) : (
          <ul className="space-y-1">
            {jobs.map((job) => (
              <li key={job.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onOpenJob(job.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-zinc-900 disabled:opacity-50 ${activeJobId === job.id ? "bg-zinc-900" : ""}`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLE[job.status]}`} />
                  <span className="text-zinc-300">{job.kind === "image" ? "Imagen" : "Video"}</span>
                  <span className="ml-auto text-xs tabular-nums text-zinc-600">
                    {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
