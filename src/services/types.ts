// Contratos de la API local (espejo de las entidades del backend).

export type MediaKind = "image" | "video";
export type SocialPlatform = "tiktok" | "reels" | "stories" | "post";
export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface MusicSuggestion {
  title: string;
  artist: string;
  reason: string;
  segment?: string;
  segmentStart?: number;
  segmentEnd?: number;
  hookLyric?: string;
  durationSeconds?: number;
  source?: string;
  previewUrl?: string;
  link?: string;
  addedAt?: string;
}

export interface ContentStrategy {
  copy: string;
  hashtags: string[];
  trendingHashtags?: string[];
  music: MusicSuggestion[];
  onScreenText: string[];
  tips: string[];
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Transcript {
  language: string;
  text: string;
  segments: TranscriptSegment[];
}

export interface GeneratedClip {
  url: string;
  thumbnailUrl: string;
  start: number;
  end: number;
  score: number;
  reason: string;
  audio?: ClipAudioMode;
}

export interface ImageQualityReport {
  issues: string[];
  adjustments: string[];
  metrics: Record<string, number>;
  score?: { before: QualityScore; after: QualityScore };
  notes?: string[];
}

export interface QualityScore {
  total: number;
  [part: string]: number;
}

export interface ProcessedImageContent {
  kind: "image";
  originalUrl: string;
  processedUrl: string;
  appliedSteps: string[];
  quality?: ImageQualityReport;
  visualDescription: string;
  strategy: ContentStrategy;
}

export interface ProcessedVideoContent {
  kind: "video";
  originalUrl: string;
  durationSeconds: number;
  clips: GeneratedClip[];
  visualDescription: string;
  transcript?: Transcript;
  strategy: ContentStrategy;
}

export type ProcessedContent = ProcessedImageContent | ProcessedVideoContent;

export interface Job {
  id: string;
  kind: MediaKind;
  status: JobStatus;
  step: string;
  progress: number;
  warnings: string[];
  result?: ProcessedContent;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobSummary = Omit<Job, "result"> & { hasResult: boolean };

export interface JobCreated {
  jobId: string;
  status: JobStatus;
  statusUrl: string;
}

export type PortraitBlur = "off" | "suave" | "medio" | "fuerte";

export interface ImageOptions {
  platform: SocialPlatform;
  tone: string;
  context: string;
  musicStyle: string;
  language: string;
  removeObject: string;
  removeReflections: boolean;
  enhance: boolean;
  proFinish: boolean;
  portraitBlur: PortraitBlur;
  straighten: boolean;
  upscale: boolean;
  upscaleFactor: 2 | 4;
}

export interface VideoOptions {
  platform: SocialPlatform;
  tone: string;
  context: string;
  musicStyle: string;
  language: string;
  maxClips: number;
  clipDuration: number;
  verticalCrop: boolean;
  transcribe: boolean;
  audioMode: ClipAudioMode;
}

export type ClipAudioMode = "mute" | "voice" | "original";

export interface ServiceHealth {
  ok: boolean;
  detail?: string;
  models?: { text: string; vision: string };
}

export interface HealthReport {
  ok: boolean;
  services: {
    ollama: ServiceHealth;
    python: ServiceHealth;
    ffmpeg: ServiceHealth;
  };
}

export interface OfficialTrendSong {
  rank: number;
  title: string;
  artist: string;
  previewUrl?: string;
  link?: string;
}

export interface OfficialTrendHashtag {
  rank: number;
  tag: string;
  category?: string;
}

export interface OfficialTrends {
  region: string;
  updatedAt: string | null;
  songs: OfficialTrendSong[];
  hashtags?: OfficialTrendHashtag[];
  hashtagsUpdatedAt?: string;
  /** Solo en la respuesta de importar: qué se actualizó. */
  imported?: "songs" | "hashtags";
}
