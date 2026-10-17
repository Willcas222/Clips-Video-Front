"use client";

import { useState } from "react";
import { contentService } from "@/services/contentService";
import { getErrorMessage } from "@/services/apiClient";
import type { OfficialTrends } from "@/services/types";

const CREATIVE_CENTER_URL = "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/es";
const REGIONS = ["Colombia", "México", "España", "Argentina", "Chile", "Perú", "Ecuador", "Venezuela", "Estados Unidos", "Global"];

interface Props {
  trends: OfficialTrends | null;
  onClose: () => void;
  onChange: (trends: OfficialTrends | null) => void;
}

export function daysSince(iso: string | null | undefined) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function ageText(iso: string | null | undefined) {
  const d = daysSince(iso);
  if (d === null) return "";
  return d === 0 ? "hoy" : `hace ${d} día${d === 1 ? "" : "s"}`;
}

/** Hay datos útiles si se importaron canciones o hashtags. */
export function hasTrends(t: OfficialTrends | null): t is OfficialTrends {
  return Boolean(t && (t.songs.length || t.hashtags?.length));
}

/**
 * Importa lo que el Creative Center de TikTok muestra con la sesión del usuario:
 * la tabla de Hashtags (disponible en todos los países) y, donde exista, la de Música.
 */
export function TrendsPanel({ trends, onClose, onChange }: Props) {
  const [text, setText] = useState("");
  const [region, setRegion] = useState(trends?.region || "Colombia");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const hashtags = trends?.hashtags ?? [];
  const songs = trends?.songs ?? [];
  const hashtagsAge = daysSince(trends?.hashtagsUpdatedAt);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await contentService.importTrends(text, region);
      onChange(result);
      setText("");
      setMessage(
        result.imported === "hashtags"
          ? `✓ ${result.hashtags?.length ?? 0} hashtags en tendencia importados.`
          : `✓ ${result.songs.length} canciones en tendencia importadas.`,
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setError(null);
    setMessage(null);
    try {
      await contentService.clearTrends();
      onChange(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trends-title"
        className="my-8 w-full max-w-3xl space-y-5 rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="trends-title" className="text-xl font-bold text-white">
              📈 Tendencias oficiales de TikTok
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Copia lo que te muestra el Creative Center con tu cuenta. Los <b>hashtags en tendencia</b> se añaden a tus publicaciones cuando encajan con el
              contenido; la música en tendencia se busca sola en listas de TikTok.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white">
            ✕
          </button>
        </header>

        <ol className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
          <li className="rounded-xl bg-zinc-950/60 p-3 ring-1 ring-white/5">
            <span className="font-semibold text-brand-cyan">1.</span>{" "}
            <a href={CREATIVE_CENTER_URL} target="_blank" rel="noreferrer" className="text-brand-cyan underline">
              Abre el Creative Center
            </a>{" "}
            con tu cuenta y elige tu país (ej. Colombia).
          </li>
          <li className="rounded-xl bg-zinc-950/60 p-3 ring-1 ring-white/5">
            <span className="font-semibold text-brand-cyan">2.</span> Pulsa <b>Hashtag</b>, deja <b>Todo</b> y <b>Last 7 days</b>.
          </li>
          <li className="rounded-xl bg-zinc-950/60 p-3 ring-1 ring-white/5">
            <span className="font-semibold text-brand-cyan">3.</span> Baja hasta el final de la lista (para que cargue completa), selecciónala con el ratón desde el #1 y
            cópiala con <b>Ctrl+C</b>.
          </li>
          <li className="rounded-xl bg-zinc-950/60 p-3 ring-1 ring-white/5">
            <span className="font-semibold text-brand-cyan">4.</span> Pégala aquí (<b>Ctrl+V</b>) y guarda. Repítelo cada semana. Si tu país tiene la sección <b>Música</b>,
            puedes pegarla también.
          </li>
        </ol>

        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={saving}
            placeholder={"Pega aquí la tabla copiada del Creative Center.\nEj. hashtags:  1  #rockalparque  Noticias y entretenimiento  10.7K …\nEj. canciones:  1. Te Estoy Correteando - Latin Mafia"}
            className="min-h-40 w-full resize-y rounded-xl bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              País
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={saving}
                className="rounded-lg bg-zinc-950 px-2 py-1.5 text-zinc-100 ring-1 ring-white/10"
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={save}
              disabled={saving || text.trim().length < 3}
              className="ml-auto rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-40"
            >
              {saving ? "Reconociendo…" : "Guardar"}
            </button>
          </div>
          {message && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300 ring-1 ring-emerald-500/20">{message}</p>}
          {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300 ring-1 ring-red-500/20">{error}</p>}
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-200"># Hashtags en tendencia {hashtags.length ? `· ${hashtags.length}` : ""}</h3>
            {hashtags.length ? (
              <>
                <p className={`text-xs ${hashtagsAge !== null && hashtagsAge > 7 ? "text-amber-400" : "text-zinc-500"}`}>
                  {trends?.region} · actualizados {ageText(trends?.hashtagsUpdatedAt)}
                  {hashtagsAge !== null && hashtagsAge > 7 ? " — conviene actualizarlos." : ""}
                </p>
                <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  {hashtags.map((h) => (
                    <li key={h.tag} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                      <span className="w-7 shrink-0 text-right tabular-nums text-zinc-500">#{h.rank}</span>
                      <span className="truncate text-brand-cyan">{h.tag}</span>
                      {h.category && <span className="ml-auto truncate text-xs text-zinc-500">{h.category}</span>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Aún no hay hashtags oficiales.</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-200">♪ Música oficial {songs.length ? `· ${songs.length}` : ""}</h3>
            {songs.length ? (
              <>
                <p className="text-xs text-zinc-500">Actualizada {ageText(trends?.updatedAt)}</p>
                <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto rounded-xl bg-zinc-950/60 ring-1 ring-white/5">
                  {songs.map((s) => (
                    <li key={`${s.rank}-${s.title}`} className="space-y-1 px-3 py-2 text-sm">
                      <p className="truncate text-zinc-100">
                        <span className="text-zinc-500">#{s.rank}</span> {s.title} <span className="text-zinc-500">· {s.artist}</span>
                      </p>
                      {s.previewUrl && <audio controls preload="none" src={s.previewUrl} className="h-7 w-full" />}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Tu país no muestra “Música” en el Creative Center: no pasa nada, la música en tendencia se obtiene sola de listas de TikTok (Deezer), según el
                tema de tu foto o video.
              </p>
            )}
          </div>
        </section>

        {hasTrends(trends) && (
          <div className="flex justify-end">
            <button type="button" onClick={clear} className="text-xs text-zinc-500 hover:text-red-400">
              Borrar todas las tendencias importadas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
