# Generador de Shorts con IA — Frontend

Interfaz web (React + Vite + Tailwind) del generador de shorts. Necesita el backend en marcha:
[Clips-Video-backend](https://github.com/Willcas222/Clips-Video-backend), donde está la
documentación completa.

## Instalación
```bat
git clone https://github.com/Willcas222/Clips-Video-Front.git frontend
cd frontend
instalar.bat
```

## Uso
1. Arranca el backend (`backend\iniciar.bat`, puerto 8000).
2. `iniciar.bat` y abre http://localhost:5173

Vite hace de proxy de `/api` y `/static` hacia `http://127.0.0.1:8000` (mismo origen para el
WebSocket de progreso y la descarga de MP4). Si el backend está en otra dirección:
`set VITE_BACKEND_URL=http://otra-ip:8000` antes de `iniciar.bat`.

## Estructura
```
src/
  App.jsx                  Flujo principal y reapertura de resultados (?task=...)
  components/
    UrlInput.jsx           URL + interruptor "Streamer permite clips"
    ProgressPanel.jsx      Barra de progreso por fases (audio, transcripción, IA, clips)
    ClipCard.jsx           Reproductor, título/motivo de la IA, descarga y encuadre
    BackgroundCredit.jsx   Atribución del gameplay de fondo (CC BY) con botón Copiar
  services/api.js          HTTP + WebSocket (con fallback a polling)
  utils/time.js            Formato de tiempos
```
