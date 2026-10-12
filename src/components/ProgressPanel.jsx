// Fases del backend: A audio completo → B transcripción → C IA por bloques → D clips de video
const STAGES = [
  { key: 'download', label: 'Audio del stream' },
  { key: 'transcribe', label: 'Transcripción' },
  { key: 'analyze', label: 'Análisis IA' },
  { key: 'render', label: 'Clips y render' },
]

export default function ProgressPanel({ task }) {
  const current = STAGES.findIndex((s) => s.key === task.stage)
  const done = task.status === 'completed'

  return (
    <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
      {task.title && <p className="mb-1 truncate text-sm text-zinc-400">{task.title}</p>}
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="text-lg font-semibold" aria-live="polite">{task.message}</p>
        <span className="font-display text-2xl font-black tabular-nums text-yellow-400">{task.progress}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-valuenow={task.progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-yellow-400 transition-[width] duration-700 ease-out"
          style={{ width: `${task.progress}%` }}
        />
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAGES.map((s, i) => {
          const state = done || i < current ? 'done' : i === current ? 'active' : 'pending'
          return (
            <li
              key={s.key}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                state === 'active' ? 'bg-yellow-400/10 text-yellow-300' : state === 'done' ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  state === 'done' ? 'bg-yellow-400 text-zinc-950' : state === 'active' ? 'animate-pulse bg-yellow-400/30' : 'bg-zinc-800'
                }`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              {s.label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
