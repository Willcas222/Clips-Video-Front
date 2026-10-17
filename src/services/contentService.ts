import { apiClient } from "./apiClient";
import type { HealthReport, ImageOptions, Job, JobCreated, JobSummary, OfficialTrends, VideoOptions } from "./types";

type UploadProgress = (percent: number) => void;

function toFormData(file: File, fields: Record<string, string | number | boolean>, extra?: Record<string, Blob>) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
  Object.entries(extra ?? {}).forEach(([key, blob]) => form.append(key, blob, `${key}.png`));
  return form;
}

const uploadConfig = (onProgress?: UploadProgress) => ({
  // Las subidas de video pueden ser grandes: sin timeout para la petición de subida.
  timeout: 0,
  onUploadProgress: (event: { loaded: number; total?: number }) => {
    if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
  },
});

export const contentService = {
  async processImage(file: File, options: ImageOptions, mask: Blob | null, onProgress?: UploadProgress) {
    const form = toFormData(
      file,
      {
        platform: options.platform,
        language: options.language,
        tone: options.tone,
        context: options.context,
        musicStyle: options.musicStyle,
        removeObject: mask ? "" : options.removeObject,
        removeReflections: options.removeReflections,
        enhance: options.enhance,
        proFinish: options.proFinish,
        portraitBlur: options.portraitBlur,
        straighten: options.straighten,
        upscale: options.upscale,
        upscaleFactor: options.upscaleFactor,
      },
      mask ? { mask } : undefined,
    );
    const { data } = await apiClient.post<JobCreated>("/content/image", form, uploadConfig(onProgress));
    return data;
  },

  async processVideo(file: File, options: VideoOptions, onProgress?: UploadProgress) {
    const form = toFormData(file, { ...options });
    const { data } = await apiClient.post<JobCreated>("/content/video", form, uploadConfig(onProgress));
    return data;
  },

  async getJob(jobId: string) {
    const { data } = await apiClient.get<Job>(`/jobs/${jobId}`);
    return data;
  },

  async listJobs() {
    const { data } = await apiClient.get<JobSummary[]>("/jobs");
    return data;
  },

  async getTrends() {
    const { data } = await apiClient.get<OfficialTrends>("/music/tiktok-trends");
    return data;
  },

  /** Importa la lista copiada del Creative Center (busca previews: puede tardar unos segundos). */
  async importTrends(text: string, region: string) {
    const { data } = await apiClient.put<OfficialTrends>("/music/tiktok-trends", { text, region }, { timeout: 120_000 });
    return data;
  },

  async clearTrends() {
    await apiClient.delete("/music/tiktok-trends");
  },

  async health(fresh = false) {
    // El endpoint responde 503 cuando algo falla, pero el cuerpo sigue siendo útil.
    const { data } = await apiClient.get<HealthReport>("/health", {
      params: fresh ? { fresh: 1 } : undefined,
      validateStatus: (status) => status === 200 || status === 503,
      timeout: 30_000,
    });
    return data;
  },
};
