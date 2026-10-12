import { useState } from 'react'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback para contextos sin permiso de portapapeles
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export default function BackgroundCredit({ background }) {
  const [copied, setCopied] = useState(false)
  if (!background) return null

  // Fondo añadido a mano sin entrada en credits.json
  if (!background.attribution) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        Fondo: <span className="font-mono">{background.file}</span> — sin créditos registrados. Comprueba su licencia
        antes de publicar.
      </div>
    )
  }

  const copy = async () => {
    if (await copyText(background.attribution)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl bg-zinc-800/60 p-3 text-xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-semibold uppercase tracking-wide text-zinc-500">Atribución del fondo</span>
        <button
          onClick={copy}
          className="rounded-md px-2 py-1 font-semibold text-yellow-400 transition hover:bg-zinc-700"
          aria-label="Copiar texto de atribución"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <p className="leading-relaxed text-zinc-300">
        <a href={background.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          {background.title}
        </a>{' '}
        por{' '}
        <a
          href={background.author_url || background.url}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline-offset-2 hover:underline"
        >
          {background.author}
        </a>
        {background.license && <span className="text-zinc-500"> · {background.license}</span>}
      </p>
    </div>
  )
}
