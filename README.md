# Frontend — Asistente de Contenido IA

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Axios. Consume la API local de `../backend`.

```bash
npm install
npm run dev        # http://localhost:3000
```

La URL del backend se configura en `.env.local` (`NEXT_PUBLIC_API_URL`, por defecto `http://localhost:3001`).

## Estructura

```
src/
├── app/            layout.tsx, page.tsx, globals.css (Tailwind + tailwind.config.js vía @config)
├── components/     Studio (pantalla), Sidebar, DragDropZone, MediaPreview, MaskPainter,
│                   ConfigPanel, StatusTracker, results/ (ResultView, BeforeAfter, StrategyCard)
├── hooks/          useUpload (subida + polling del trabajo), useBackendStatus (salud e historial)
└── services/       apiClient (Axios), contentService, types (contratos de la API)
```
