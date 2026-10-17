"use client";

import type { ReactNode } from "react";
import type { ClipAudioMode, ImageOptions, PortraitBlur, SocialPlatform, VideoOptions } from "@/services/types";

const PLATFORMS: Array<{ value: SocialPlatform; label: string }> = [
  { value: "tiktok", label: "TikTok" },
  { value: "reels", label: "Reels" },
  { value: "stories", label: "Historias" },
  { value: "post", label: "Post" },
];

const MUSIC_STYLES = ["Reggaetón", "Pop", "Pop en inglés", "Electrónica", "Romántica", "Salsa / Bachata", "Cumbia", "Rap / Trap", "Regional mexicano", "Rock", "Lo-fi / Chill", "Motivacional"];

export type MaskSource = "none" | "text" | "brush";

interface CommonProps {
  disabled?: boolean;
}

interface ImageProps extends CommonProps {
  kind: "image";
  options: ImageOptions;
  onChange: (options: ImageOptions) => void;
  maskSource: MaskSource;
  onMaskSourceChange: (source: MaskSource) => void;
}

interface VideoProps extends CommonProps {
  kind: "video";
  options: VideoOptions;
  onChange: (options: VideoOptions) => void;
}

type Props = ImageProps | VideoProps;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-start justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <span>
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-zinc-700 transition peer-checked:bg-brand-pink peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

function Segmented<T extends string | number>({ value, options, onChange, disabled }: { value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-zinc-900 p-1 ring-1 ring-white/5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-2 py-1.5 text-sm transition ${o.value === value ? "bg-zinc-700 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-cyan focus:outline-none disabled:opacity-50";

/** Opciones de procesamiento para imagen o video. */
export function ConfigPanel(props: Props) {
  const { disabled } = props;

  // Campos compartidos por imagen y video.
  type Shared = Pick<ImageOptions, "platform" | "tone" | "context" | "musicStyle">;
  const update = (patch: Partial<Shared>) =>
    props.kind === "image" ? props.onChange({ ...props.options, ...patch }) : props.onChange({ ...props.options, ...patch });

  const brief = (
    <Section title="Contexto (mejora el copy y la música)">
      <textarea
        className={`${inputClass} min-h-24 resize-y`}
        placeholder={
          props.kind === "image"
            ? "¿Qué está pasando y qué quieres transmitir? Ej.: Selfie antes de salir con amigas, quiero algo seguro y empoderador."
            : "¿De qué trata el video? Ej.: Receta rápida de tacos para gente sin tiempo, quiero que sea divertido."
        }
        value={props.options.context}
        disabled={disabled}
        maxLength={600}
        onChange={(e) => update({ context: e.target.value })}
      />
      <input
        className={inputClass}
        placeholder="Tipo de música (ej. reggaetón, pop en inglés…)"
        value={props.options.musicStyle}
        disabled={disabled}
        maxLength={120}
        onChange={(e) => update({ musicStyle: e.target.value })}
      />
      <div className="flex flex-wrap gap-1.5">
        {MUSIC_STYLES.map((style) => {
          const active = props.options.musicStyle.toLowerCase() === style.toLowerCase();
          return (
            <button
              key={style}
              type="button"
              disabled={disabled}
              onClick={() => update({ musicStyle: active ? "" : style })}
              className={`rounded-full px-2.5 py-1 text-xs ring-1 transition disabled:opacity-50 ${
                active ? "bg-brand-pink/20 text-brand-pink ring-brand-pink/40" : "text-zinc-400 ring-white/10 hover:text-zinc-200"
              }`}
            >
              {style}
            </button>
          );
        })}
      </div>
    </Section>
  );

  const common = (
    <Section title="Publicación">
      <Segmented value={props.options.platform} options={PLATFORMS} disabled={disabled} onChange={(platform) => update({ platform })} />
      <input
        className={inputClass}
        placeholder="Tono (ej. divertido, elegante, motivador)"
        value={props.options.tone}
        disabled={disabled}
        maxLength={120}
        onChange={(e) => update({ tone: e.target.value })}
      />
    </Section>
  );

  if (props.kind === "image") {
    const { options, onChange, maskSource, onMaskSourceChange } = props;
    return (
      <div className="space-y-6">
        {brief}
        <Section title="Borrar objeto">
          <Segmented<MaskSource>
            value={maskSource}
            disabled={disabled}
            onChange={onMaskSourceChange}
            options={[
              { value: "none", label: "No" },
              { value: "text", label: "Describir" },
              { value: "brush", label: "Pintar" },
            ]}
          />
          {maskSource === "text" && (
            <input
              className={inputClass}
              placeholder='Ej. "la bolsa del fondo"'
              value={options.removeObject}
              disabled={disabled}
              maxLength={200}
              onChange={(e) => onChange({ ...options, removeObject: e.target.value })}
            />
          )}
          {maskSource === "text" && <p className="text-xs text-zinc-500">La IA de visión localiza el objeto. Para más precisión usa “Pintar”.</p>}
          {maskSource === "brush" && (
            <p className="text-xs text-zinc-500">Pinta sobre la vista previa todo el objeto a borrar. No hace falta ser preciso: la IA ajusta el trazo al borde del objeto.</p>
          )}
          {maskSource !== "none" && (
            <Toggle
              label="Borrar también su reflejo"
              hint="Detecta el reflejo del objeto en espejos, vidrios o superficies brillantes debajo de él"
              checked={options.removeReflections}
              disabled={disabled}
              onChange={(removeReflections) => onChange({ ...options, removeReflections })}
            />
          )}
        </Section>

        <Section title="Acabado profesional">
          <Toggle
            label="Look de cámara profesional"
            hint="Modo retrato (fondo desenfocado), nitidez en la persona y acabado de color. La persona no se deforma ni se redibuja."
            checked={options.proFinish}
            disabled={disabled}
            onChange={(proFinish) => onChange({ ...options, proFinish })}
          />
          {options.proFinish && (
            <>
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-400">Desenfoque del fondo</span>
                <Segmented<PortraitBlur>
                  value={options.portraitBlur}
                  disabled={disabled}
                  onChange={(portraitBlur) => onChange({ ...options, portraitBlur })}
                  options={[
                    { value: "off", label: "No" },
                    { value: "suave", label: "Suave" },
                    { value: "medio", label: "Medio" },
                    { value: "fuerte", label: "Fuerte" },
                  ]}
                />
              </div>
              <Toggle
                label="Enderezar si está torcida"
                hint="Solo inclinaciones leves (≤5°) y sin recortar a la persona"
                checked={options.straighten}
                disabled={disabled}
                onChange={(straighten) => onChange({ ...options, straighten })}
              />
            </>
          )}
        </Section>

        <Section title="Calidad">
          <Toggle
            label="Mejorar aspecto (luz y color)"
            hint="Corrige sobreexposición, halos de luz, balance de blancos, contraste y color. No deforma a las personas: solo ajusta luz y color."
            checked={options.enhance}
            disabled={disabled}
            onChange={(enhance) => onChange({ ...options, enhance })}
          />
          <Toggle label="Mejorar resolución (Real-ESRGAN)" hint="Aumenta resolución y nitidez" checked={options.upscale} disabled={disabled} onChange={(upscale) => onChange({ ...options, upscale })} />
          {options.upscale && (
            <Segmented<2 | 4>
              value={options.upscaleFactor}
              disabled={disabled}
              onChange={(upscaleFactor) => onChange({ ...options, upscaleFactor })}
              options={[
                { value: 2, label: "x2 (rápido)" },
                { value: 4, label: "x4" },
              ]}
            />
          )}
        </Section>

        {common}
      </div>
    );
  }

  const { options, onChange } = props;
  return (
    <div className="space-y-6">
      {brief}
      <Section title="Clips">
        <label className="block space-y-1.5">
          <span className="flex justify-between text-sm text-zinc-200">
            Número de clips <span className="text-zinc-400">{options.maxClips}</span>
          </span>
          <input type="range" min={1} max={6} value={options.maxClips} disabled={disabled} onChange={(e) => onChange({ ...options, maxClips: Number(e.target.value) })} className="w-full accent-brand-pink" />
        </label>
        <label className="block space-y-1.5">
          <span className="flex justify-between text-sm text-zinc-200">
            Duración por clip <span className="text-zinc-400">{options.clipDuration} s</span>
          </span>
          <input type="range" min={5} max={60} step={5} value={options.clipDuration} disabled={disabled} onChange={(e) => onChange({ ...options, clipDuration: Number(e.target.value) })} className="w-full accent-brand-pink" />
        </label>
        <Toggle label="Formato vertical 9:16" hint="Auto-crop centrado a 1080×1920" checked={options.verticalCrop} disabled={disabled} onChange={(verticalCrop) => onChange({ ...options, verticalCrop })} />
        <div className="space-y-1.5">
          <span className="text-sm text-zinc-200">Audio de los clips</span>
          <Segmented<ClipAudioMode>
            value={options.audioMode}
            disabled={disabled}
            onChange={(audioMode) => onChange({ ...options, audioMode })}
            options={[
              { value: "mute", label: "Sin audio" },
              { value: "voice", label: "Solo voz" },
              { value: "original", label: "Original" },
            ]}
          />
          <p className="text-xs text-zinc-500">
            {options.audioMode === "mute"
              ? "El clip sale mudo: súbelo y ponle la canción en TikTok o Reels."
              : options.audioMode === "voice"
                ? "Quita la música y el ruido de fondo y conserva lo que se habla (tarda ~20 s más por clip)."
                : "Conserva el sonido tal cual se grabó."}
          </p>
        </div>
        <Toggle label="Transcribir audio (Whisper)" hint="Texto con tiempos; mejora el copy" checked={options.transcribe} disabled={disabled} onChange={(transcribe) => onChange({ ...options, transcribe })} />
      </Section>
      {common}
    </div>
  );
}
