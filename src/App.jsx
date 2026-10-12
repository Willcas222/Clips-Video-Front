import { useEffect, useRef, useState } from 'react'
import ClipCard from './components/ClipCard.jsx'
import ProgressPanel from './components/ProgressPanel.jsx'
import UrlInput from './components/UrlInput.jsx'
import { getClips, getHealth, getStatus, startProcessing, watchTask } from './services/api.js'

export default function App() {
  const [task, setTask] = useState(null)
  const [clips, setClips] = useState([])
  const [error, setError] = useState(null)
  const [warnings, setWarnings] = useState([])
  const stopWatch = useRef(null)

  // Sigue una tarea (nueva o reabierta desde ?task=) hasta que termina
  const follow = (taskId) => {
    stopWatch.current?.()
    stopWatch.current = watchTask(taskId, async (data) => {
      setTask(data)
      if (data.status === 'completed') {
        try {
          setClips((await getClips(taskId)).clips)
        } catch (e) {
          setError(e.message)
        }
      } else if (data.status === 'error') {
        setError(data.error || data.message)
      }
    })
  }

  const setTaskInUrl = (taskId) => {
    const url = new URL(window.location.href)
    if (taskId) url.searchParams.set('task', taskId)
    else url.searchParams.delete('task')
    window.history.replaceState(null, '', url)
  }

  useEffect(() => {
    getHealth()
      .then((h) => setWarnings(Object.values(h).filter((d) => !d.ok).map((d) => d.error)))
      .catch(() => setWarnings(['No se puede conectar con el backend en el puerto 8000. ¿Está en ejecución?']))

    // Reabrir resultados al recargar la página o al abrir un enlace con ?task=
    const taskId = new URLSearchParams(window.location.search).get('task')
    if (taskId) {
      getStatus(taskId)
        .then((data) => {
          setTask(data)
          follow(taskId)
        })
        .catch(() => setTaskInUrl(null)) // tarea de una sesión anterior del backend
    }
    return () => stopWatch.current?.()
  }, [])

  const running = task && task.status !== 'completed' && task.status !== 'error'

  // El backend procesa el video completo (también streams de horas): solo hace falta la URL
  const handleSubmit = async (url, isStreamerFriendly) => {
    stopWatch.current?.()
    setError(null)
    setClips([])
    setTask(null)
    try {
      const { task_id } = await startProcessing(url, isStreamerFriendly)
      setTask({ id: task_id, status: 'queued', stage: 'queued', message: 'En cola…', progress: 0 })
      setTaskInUrl(task_id)
      follow(task_id)
    } catch (e) {
      setError(e.message)
    }
  }

  const reset = () => {
    stopWatch.current?.()
    setTaskInUrl(null)
    setTask(null)
    setClips([])
    setError(null)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
          Generador de <span className="text-yellow-400">Shorts</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Pega un video de YouTube, Kick, Twitch, TikTok u otra plataforma. Lo transcribimos, una IA local elige los mejores momentos y los convertimos en
          shorts verticales con subtítulos.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        {warnings.length > 0 && (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-200">
            {warnings.map((w) => (
              <p key={w}>⚠ {w}</p>
            ))}
          </div>
        )}

        <UrlInput onSubmit={handleSubmit} disabled={running} />

        {task && task.status !== 'error' && <ProgressPanel task={task} />}

        {error && (
          <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200" role="alert">
            <p className="font-semibold">No se pudo completar el proceso</p>
            <p className="mt-1 text-sm">{error}</p>
            <button onClick={reset} className="mt-3 text-sm font-semibold underline underline-offset-4">
              Intentar con otro video
            </button>
          </div>
        )}
      </main>

      {clips.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-black uppercase">Tus clips</h2>
            <button onClick={reset} className="text-sm text-zinc-400 hover:text-zinc-100">
              Nuevo video
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((c) => (
              <ClipCard key={c.filename} clip={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
