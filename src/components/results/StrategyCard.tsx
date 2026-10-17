import type { ContentStrategy, MusicSuggestion } from "@/services/types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Tramo exacto de la canción a usar en el video (coro), explicado de forma sencilla. */
function SongSection({ song }: { song: MusicSuggestion }) {
  if (song.segmentStart === undefined || song.segmentEnd === undefined) {
    return <p className="text-xs text-zinc-500">⏱ No encontré la letra de esta canción: usa la parte que más te guste (el coro suele funcionar mejor).</p>;
  }
  const length = song.segmentEnd - song.segmentStart;
  return (
    <div className="rounded-lg bg-brand-pink/10 px-3 py-2 text-sm ring-1 ring-brand-pink/20">
      <p className="font-semibold text-brand-pink">
        ⏱ Usa del minuto {fmt(song.segmentStart)} al {fmt(song.segmentEnd)}{" "}
        <span className="font-normal text-zinc-400">
          ({length} s{song.durationSeconds ? ` de una canción de ${fmt(song.durationSeconds)}` : ""})
        </span>
      </p>
      {song.hookLyric && (
        <p className="text-xs text-zinc-300">
          Es el coro, empieza cuando dice: <i>“{song.hookLyric}”</i>
        </p>
      )}
    </div>
  );
}
import { CopyButton } from "./CopyButton";

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-white/5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Copy, hashtags, música sugerida, textos en pantalla y consejos generados por la IA. */
export function StrategyCard({ strategy }: { strategy: ContentStrategy }) {
  const hashtags = strategy.hashtags.join(" ");
  const fullPost = [strategy.copy, hashtags].filter(Boolean).join("\n\n");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="✍️ Copy" action={<CopyButton text={fullPost} label="Copiar con hashtags" />}>
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-zinc-100">{strategy.copy}</p>
      </Card>

      <Card title="#️⃣ Hashtags" action={<CopyButton text={hashtags} />}>
        <div className="flex flex-wrap gap-2">
          {strategy.hashtags.map((tag) => {
            const trending = strategy.trendingHashtags?.some((t) => t.toLowerCase() === tag.toLowerCase());
            return (
              <span
                key={tag}
                title={trending ? "En tendencia oficial en TikTok esta semana" : undefined}
                className={`rounded-full px-3 py-1 text-sm ring-1 ${
                  trending ? "bg-brand-pink/15 text-brand-pink ring-brand-pink/40" : "bg-brand-cyan/10 text-brand-cyan ring-brand-cyan/20"
                }`}
              >
                {trending ? "🔥 " : ""}
                {tag}
              </span>
            );
          })}
        </div>
      </Card>

      <Card title="🎵 Música sugerida">
        <ul className="space-y-3">
          {strategy.music.map((song) => (
            <li key={`${song.title}-${song.artist}`} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink/30 to-brand-cyan/30 text-lg">♪</span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-zinc-100">
                  {song.title} <span className="font-normal text-zinc-400">· {song.artist}</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {song.source && (
                    <span
                      className={`rounded-full px-2 py-0.5 ring-1 ${
                        song.source.startsWith("Tendencia")
                          ? "bg-brand-pink/15 text-brand-pink ring-brand-pink/30"
                          : "bg-zinc-800 text-zinc-300 ring-white/10"
                      }`}
                    >
                      {song.source.startsWith("Tendencia") ? "🔥 " : ""}
                      {song.source}
                    </span>
                  )}
                </div>
                <SongSection song={song} />
                <p className="text-sm text-zinc-400">{song.reason}</p>
                {song.previewUrl && <audio controls preload="none" src={song.previewUrl} className="h-8 w-full max-w-xs" />}
                {song.link && (
                  <a href={song.link} target="_blank" rel="noreferrer" className="inline-block text-xs text-brand-cyan hover:underline">
                    Escuchar completa ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-zinc-600">
          {strategy.music.some((m) => m.previewUrl)
            ? "Canciones reales sacadas hoy de listas de tendencias de TikTok, elegidas por la IA según tu contenido. Búscalas en la biblioteca de sonidos de TikTok."
            : "Sin conexión a tendencias: elegidas del catálogo local (backend/data/music-catalog.json)."}
        </p>
      </Card>

      <Card title="💡 Textos en pantalla y consejos">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {strategy.onScreenText.map((t) => (
              <span key={t} className="rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-zinc-900">
                {t}
              </span>
            ))}
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
            {strategy.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
