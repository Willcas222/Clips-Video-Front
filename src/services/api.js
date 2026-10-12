// Llamadas HTTP/WebSocket al backend (vía el proxy de Vite: mismo origen).

async function request(path, options) {
  const res = await fetch(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg.replace(/^Value error, /, '')).join('. ')
      : data.detail
    throw new Error(detail || `Error ${res.status}`)
  }
  return data
}

const postJson = (path, body) =>
  request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

/** isStreamerFriendly: el streamer permite clips → edición ligera sin procesado anti-copyright. */
export const startProcessing = (url, isStreamerFriendly = false) =>
  postJson('/api/process', { url, is_streamer_friendly: isStreamerFriendly })

export const getStatus = (taskId) => request(`/api/status/${taskId}`)
export const getClips = (taskId) => request(`/api/clips/${taskId}`)
export const getHealth = () => request('/api/health')

/**
 * Sigue el progreso de una tarea por WebSocket. Si el socket no se puede abrir
 * o se corta antes de terminar, cae a polling sobre /api/status.
 * Devuelve una función para cancelar el seguimiento.
 */
export function watchTask(taskId, onUpdate) {
  let stopped = false
  let pollTimer = null
  let finished = false

  const handle = (data) => {
    if (stopped) return
    onUpdate(data)
    if (data.status === 'completed' || data.status === 'error') finished = true
  }

  const poll = async () => {
    if (stopped || finished) return
    try {
      handle(await getStatus(taskId))
    } catch {
      /* reintento en el siguiente tick */
    }
    if (!finished) pollTimer = setTimeout(poll, 1500)
  }

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${window.location.host}/api/ws/${taskId}`)
  ws.onmessage = (e) => handle(JSON.parse(e.data))
  ws.onclose = () => {
    if (!stopped && !finished) poll()
  }

  return () => {
    stopped = true
    clearTimeout(pollTimer)
    ws.close()
  }
}
