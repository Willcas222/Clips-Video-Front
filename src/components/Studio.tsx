"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { contentService } from "@/services/contentService";
import type { ImageOptions, MediaKind, OfficialTrends, VideoOptions } from "@/services/types";
import { Sidebar } from "./Sidebar";
import { DragDropZone } from "./DragDropZone";
import { MediaPreview } from "./MediaPreview";
import { ConfigPanel, type MaskSource } from "./ConfigPanel";
import { StatusTracker } from "./StatusTracker";
import { ResultView } from "./results/ResultView";
import { TrendsPanel, daysSince, hasTrends } from "./TrendsPanel";

const DEFAULT_IMAGE: ImageOptions = { platform: "stories", tone: "", context: "", musicStyle: "", language: "es", removeObject: "", removeReflections: true, enhance: true, proFinish: true, portraitBlur: "suave", straighten: true, upscale: true, upscaleFactor: 2 };
const DEFAULT_VIDEO: VideoOptions = { platform: "tiktok", tone: "", context: "", musicStyle: "", language: "es", maxClips: 3, clipDuration: 15, verticalCrop: true, transcribe: true, audioMode: "mute" };

/** Pantalla principal: sidebar + panel central (subida, configuración, estado y resultados). */
export function Studio() {
  const [mode, setMode] = useState<MediaKind>("image");
  const [file, setFile] = useState<File | null>(null);
  const [imageOptions, setImageOptions] = useState(DEFAULT_IMAGE);
  const [videoOptions, setVideoOptions] = useState(DEFAULT_VIDEO);
  const [maskSource, setMaskSource] = useState<MaskSource>("none");
  const [mask, setMask] = useState<Blob | null>(null);
  const [trends, setTrends] = useState<OfficialTrends | null>(null);
  const [trendsOpen, setTrendsOpen] = useState(false);
  const upload = useUpload();

  useEffect(() => {
    contentService
      .getTrends()
      .then((t) => setTrends(hasTrends(t) ? t : null))
      .catch(() => setTrends(null));
  }, []);

  const trendsAge = daysSince(trends?.hashtagsUpdatedAt ?? trends?.updatedAt);
  const trendsSummary = trends
    ? [trends.hashtags?.length ? `${trends.hashtags.length} hashtags` : "", trends.songs.length ? `${trends.songs.length} canciones` : "", trends.region, trendsAge === 0 ? "hoy" : `hace ${trendsAge} d`]
        .filter(Boolean)
        .join(" · ")
    : "Pega los hashtags del Creative Center";
  const status = useBackendStatus(upload.job?.id ?? upload.phase);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const busy = upload.phase === "uploading" || upload.phase === "processing";

  const changeMode = (next: MediaKind) => {
    setMode(next);
    setFile(null);
    setMask(null);
    upload.reset();
  };

  const canSubmit =
    file !== null &&
    !busy &&
    (mode === "video" || maskSource !== "brush" || mask !== null) &&
    (mode === "video" || maskSource !== "text" || imageOptions.removeObject.trim().length > 0);

  const submit = () => {
    if (!file) return;
    if (mode === "image") {
      const options = { ...imageOptions, removeObject: maskSource === "text" ? imageOptions.removeObject : "" };
      upload.submit((onProgress) => contentService.processImage(file, options, maskSource === "brush" ? mask : null, onProgress));
    } else {
      upload.submit((onProgress) => contentService.processVideo(file, videoOptions, onProgress));
    }
  };

  const openJob = (jobId: string) => {
    setFile(null);
    upload.track(jobId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 lg:flex-row">
      <Sidebar
        mode={mode}
        onModeChange={changeMode}
        health={status.health}
        healthError={status.healthError}
        onRefreshHealth={status.refreshHealth}
        jobs={status.jobs}
        activeJobId={upload.job?.id ?? null}
        onOpenJob={openJob}
        onOpenTrends={() => setTrendsOpen(true)}
        trendsSummary={trendsSummary}
        trendsStale={trendsAge !== null && trendsAge > 7}
        disabled={busy}
      />
      {trendsOpen && <TrendsPanel trends={trends} onClose={() => setTrendsOpen(false)} onChange={(t) => setTrends(hasTrends(t) ? t : null)} />}

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-5 lg:p-10">
          <header>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {mode === "image" ? "Procesar imagen" : "Procesar video"}
            </h1>
            <p className="mt-1 text-zinc-400">
              {mode === "image"
                ? "Borra objetos, mejora la calidad y obtén copy, hashtags y música para tu historia o post."
                : "La IA encuentra los mejores momentos, recorta clips verticales y sugiere música y textos."}
            </p>
          </header>

          {upload.phase !== "completed" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                {file && previewUrl ? (
                  <MediaPreview
                    file={file}
                    previewUrl={previewUrl}
                    maskMode={mode === "image" && maskSource === "brush"}
                    disabled={busy}
                    onMaskChange={setMask}
                    onRemove={() => {
                      setFile(null);
                      setMask(null);
                      upload.reset();
                    }}
                  />
                ) : (
                  <DragDropZone kind={mode} disabled={busy} onFile={(f) => { setFile(f); setMask(null); upload.reset(); }} />
                )}
              </div>

              <div className="space-y-5 rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-white/5 xl:self-start">
                {mode === "image" ? (
                  <ConfigPanel kind="image" options={imageOptions} onChange={setImageOptions} maskSource={maskSource} onMaskSourceChange={(source) => { setMaskSource(source); setMask(null); }} disabled={busy} />
                ) : (
                  <ConfigPanel kind="video" options={videoOptions} onChange={setVideoOptions} disabled={busy} />
                )}
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={submit}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink py-3 font-semibold text-zinc-950 shadow-lg shadow-brand-pink/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {busy ? "Procesando…" : "✨ Procesar con IA"}
                </button>
                {!file && <p className="text-center text-xs text-zinc-500">Primero sube un archivo.</p>}
                {file && mode === "image" && maskSource === "brush" && !mask && <p className="text-center text-xs text-zinc-500">Pinta la zona a borrar en la vista previa.</p>}
              </div>
            </div>
          )}

          <StatusTracker phase={upload.phase} uploadProgress={upload.uploadProgress} job={upload.job} error={upload.error} onReset={upload.reset} />

          {upload.phase === "completed" && upload.job?.result && (
            <>
              <ResultView result={upload.job.result} />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setMask(null);
                  upload.reset();
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-white/5"
              >
                + Procesar otro archivo
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
