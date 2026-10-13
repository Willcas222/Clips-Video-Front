import { useState } from 'react'

// Cualquier enlace http(s): el backend (yt-dlp) decide si el sitio es compatible
const URL_RE = /^https?:\/\/[^\s/]+\.[^\s/]+/i
const CLIP_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1)

export default function UrlInput({ onSubmit, disabled }) {
  const [url, setUrl] = useState('')
  // Desmarcado por defecto: se asume riesgo de copyright y se aplica el procesado completo
  const [isStreamerFriendly, setIsStreamerFriendly] = useState(false)
  const [numClips, setNumClips] = useState(3)
  const valid = URL_RE.test(url.trim())

  const submit = (e) => {
    e.preventDefault()
    if (valid && !disabled) onSubmit(url.trim(), isStreamerFriendly, numClips)
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Pega el enlace: YouTube, Kick, Twitch, TikTok…"
          disabled={disabled}
          autoFocus
          className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-lg outline-none transition placeholder:text-zinc-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!valid || disabled}
          className="rounded-2xl bg-yellow-400 px-7 py-4 font-display text-lg font-black uppercase tracking-tight text-zinc-950 transition hover:bg-yellow-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          Generar Shorts
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 has-[:disabled]:opacity-50">
        <span className="text-sm font-semibold">Clips a generar</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Clips a generar">
          {CLIP_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={numClips === n}
              onClick={() => setNumClips(n)}
              disabled={disabled}
              className={`size-10 rounded-xl font-display font-black transition disabled:cursor-not-allowed ${
                numClips === n ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-400">
          Más clips no alargan mucho el análisis; cada clip extra añade ~1 min de render.
        </span>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
        <input
          type="checkbox"
          role="switch"
          checked={isStreamerFriendly}
          onChange={(e) => setIsStreamerFriendly(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        {/* Interruptor visual */}
        <span
          aria-hidden="true"
          className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-zinc-700 transition peer-checked:bg-yellow-400 peer-focus-visible:ring-4 peer-focus-visible:ring-yellow-400/30 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"
        />
        <span className="text-sm">
          <span className="font-semibold">Streamer permite clips (Sin riesgo de Copyright)</span>
          <span className="mt-0.5 block text-zinc-400">
            {isStreamerFriendly
              ? 'Edición ligera: video a pantalla completa y audio original, sin fondo de gameplay.'
              : 'Edición completa: pantalla dividida con gameplay y tono de audio ligeramente modificado.'}
          </span>
        </span>
      </label>
    </form>
  )
}
