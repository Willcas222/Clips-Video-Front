import { formatTime } from '../utils/time.js'
import BackgroundCredit from './BackgroundCredit.jsx'

// Encuadre elegido automáticamente en el modo ligero
const LAYOUTS = { follow: 'sigue la cara', cam_game: 'webcam + juego', center: 'centrado' }


export default function ClipCard({ clip }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
      <video
        src={`${clip.url}#t=0.5`}
        controls
        preload="metadata"
        playsInline
        className="aspect-[9/16] w-full bg-black object-contain"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">#{clip.index}</span>
          {clip.mode === 'light' && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
              Edición ligera{LAYOUTS[clip.layout] ? ` · ${LAYOUTS[clip.layout]}` : ''}
            </span>
          )}
          <span>
            {formatTime(clip.start_time)} – {formatTime(clip.end_time)} · {Math.round(clip.duration)} s
          </span>
        </div>
        <h3 className="font-display text-lg font-extrabold leading-snug">{clip.title}</h3>
        {clip.reason && <p className="text-sm leading-relaxed text-zinc-400">{clip.reason}</p>}
        <BackgroundCredit background={clip.background} />
        <a
          href={clip.url}
          download={clip.filename}
          className="mt-auto rounded-xl bg-yellow-400 py-3 text-center font-display font-black uppercase tracking-tight text-zinc-950 transition hover:bg-yellow-300"
        >
          Descargar MP4
        </a>
      </div>
    </article>
  )
}
