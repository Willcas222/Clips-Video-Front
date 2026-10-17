"use client";

import { toDownloadUrl } from "@/services/apiClient";
import type { ImageQualityReport, ProcessedContent, ProcessedImageContent, ProcessedVideoContent } from "@/services/types";
import { BeforeAfter } from "./BeforeAfter";
import { StrategyCard } from "./StrategyCard";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function DownloadLink({ href, children }: { href: string; children: React.ReactNode }) {
  // El backend responde con Content-Disposition: attachment, así que el navegador descarga
  // el archivo sin salir de la página.
  return (
    <a
      href={toDownloadUrl(href)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-pink px-3 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
    >
      ↓ {children}
    </a>
  );
}

function ImageResult({ result }: { result: ProcessedImageContent }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {result.appliedSteps.length ? (
            result.appliedSteps.map((s) => (
              <span key={s} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-500/20">
                ✓ {s}
              </span>
            ))
          ) : (
            <span className="text-sm text-zinc-500">Sin edición de imagen: solo análisis y copy.</span>
          )}
        </div>
        <DownloadLink href={result.processedUrl}>Descargar imagen</DownloadLink>
      </div>
      {result.appliedSteps.length ? (
        <BeforeAfter before={result.originalUrl} after={result.processedUrl} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- archivo servido por la API local
        <img src={result.processedUrl} alt="Imagen" className="mx-auto max-h-[65vh] rounded-xl ring-1 ring-white/10" />
      )}
      {result.quality && <QualityCard quality={result.quality} />}
    </div>
  );
}

/** Diagnóstico técnico de la foto (luz, reflejos, color) y lo que se corrigió. */
const SCORE_LABELS: Record<string, string> = {
  exposicion: "Exposición",
  color: "Color",
  contraste: "Contraste",
  nitidez: "Nitidez de la persona",
  ruido: "Limpieza (sin ruido)",
  luces_limpias: "Luces sin destellos",
  separacion_fondo: "Separación del fondo",
};

const scoreColor = (n: number) => (n >= 85 ? "text-emerald-300" : n >= 65 ? "text-amber-300" : "text-red-300");

/** Puntuación técnica estimada de la foto original vs. la final. */
function ScoreCard({ score }: { score: NonNullable<ImageQualityReport["score"]> }) {
  const parts = Object.keys(SCORE_LABELS).filter((k) => k in score.after);
  return (
    <section className="space-y-4 rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">🏆 Calidad profesional</h3>
          <p className="text-xs text-zinc-500">Puntuación técnica estimada (exposición, color, nitidez, luces y separación del fondo)</p>
        </div>
        <p className="flex items-baseline gap-3 tabular-nums">
          <span className={`text-2xl font-bold ${scoreColor(score.before.total)}`}>{score.before.total}</span>
          <span className="text-zinc-500">→</span>
          <span className={`text-4xl font-black ${scoreColor(score.after.total)}`}>{score.after.total}</span>
          <span className="text-sm text-zinc-500">/ 100</span>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {parts.map((k) => (
          <li key={k} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">{SCORE_LABELS[k]}</span>
              <span className="tabular-nums text-zinc-500">
                {score.before[k]} → <span className={scoreColor(score.after[k])}>{score.after[k]}</span>
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="absolute inset-y-0 left-0 rounded-full bg-zinc-600" style={{ width: `${score.before[k]}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink opacity-80" style={{ width: `${score.after[k]}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QualityCard({ quality }: { quality: ImageQualityReport }) {
  return (
    <>
    {quality.score && <ScoreCard score={quality.score} />}
    <section className="grid gap-4 rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/5 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-200">📊 Análisis de la foto</h3>
        {quality.issues.length ? (
          <ul className="space-y-1.5 text-sm text-amber-200/90">
            {quality.issues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-300">Buena exposición y color: no se detectaron problemas.</p>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-200">🛠️ Correcciones aplicadas</h3>
        {quality.adjustments.length ? (
          <ul className="space-y-1.5 text-sm text-zinc-300">
            {quality.adjustments.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">Activa “Mejorar aspecto” para corregir la luz y el color automáticamente.</p>
        )}
        {quality.notes?.map((n) => (
          <p key={n} className="mt-2 text-xs text-amber-300/80">
            ℹ {n}
          </p>
        ))}
        <p className="mt-3 text-xs text-zinc-600">
          La persona no se deforma ni se redibuja: solo se ajustan luz, color y nitidez, y se desenfoca el fondo.
        </p>
      </div>
    </section>
    </>
  );
}

function VideoResult({ result }: { result: ProcessedVideoContent }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Video de {fmt(result.durationSeconds)} · {result.clips.length} clip(s) seleccionados por la IA
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {result.clips.map((clip, i) => (
          <article key={clip.url} className="overflow-hidden rounded-2xl bg-zinc-900/70 ring-1 ring-white/5">
            <video src={clip.url} poster={clip.thumbnailUrl} controls preload="metadata" className="aspect-[9/16] max-h-[520px] w-full bg-black object-contain" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-100">Clip {i + 1}</span>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs tabular-nums text-zinc-300">
                  {fmt(clip.start)} – {fmt(clip.end)} · ⭐ {clip.score.toFixed(1)}
                </span>
              </div>
              {clip.audio && (
                <p className="text-xs text-zinc-400">
                  {clip.audio === "mute" ? "🔇 Sin audio: añádele la canción al subirlo" : clip.audio === "voice" ? "🎙️ Solo voz: sin música ni ruido de fondo" : "🔊 Audio original"}
                </p>
              )}
              {clip.reason && <p className="text-sm text-zinc-400">{clip.reason}</p>}
              <DownloadLink href={clip.url}>Descargar</DownloadLink>
            </div>
          </article>
        ))}
      </div>

      {result.transcript?.segments.length ? (
        <details className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/5">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-200">🗣️ Transcripción ({result.transcript.segments.length} segmentos)</summary>
          <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto text-sm">
            {result.transcript.segments.map((seg) => (
              <li key={`${seg.start}-${seg.text}`} className="flex gap-3">
                <span className="w-24 shrink-0 tabular-nums text-zinc-500">
                  {fmt(seg.start)}–{fmt(seg.end)}
                </span>
                <span className="text-zinc-300">{seg.text}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function ResultView({ result }: { result: ProcessedContent }) {
  return (
    <div className="space-y-6">
      {result.kind === "image" ? <ImageResult result={result} /> : <VideoResult result={result} />}
      <StrategyCard strategy={result.strategy} />
      {result.visualDescription && (
        <details className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-white/5">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-400">👁️ Lo que vio la IA</summary>
          <p className="mt-3 text-sm whitespace-pre-line text-zinc-400">{result.visualDescription}</p>
        </details>
      )}
    </div>
  );
}
