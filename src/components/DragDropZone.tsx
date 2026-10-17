"use client";

import { useRef, useState } from "react";
import type { MediaKind } from "@/services/types";

const ACCEPT: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/bmp,image/tiff",
  video: "video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-msvideo,video/mpeg",
};

const HINT: Record<MediaKind, string> = {
  image: "JPG, PNG o WEBP · Historias y posts",
  video: "MP4, MOV o WEBM · Reels y TikToks",
};

interface Props {
  kind: MediaKind;
  disabled?: boolean;
  onFile: (file: File) => void;
}

export function DragDropZone({ kind, disabled, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith(`${kind}/`)) {
      setRejected(`"${file.name}" no es ${kind === "image" ? "una imagen" : "un video"}.`);
      return;
    }
    setRejected(null);
    onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) accept(e.dataTransfer.files[0]);
      }}
      className={`group flex min-h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition
        ${dragging ? "border-brand-pink bg-brand-pink/10" : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"}
        ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-pink/20 ring-1 ring-white/10 transition group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-zinc-200" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-zinc-100">
          Arrastra tu {kind === "image" ? "imagen" : "video"} aquí
        </p>
        <p className="mt-1 text-sm text-zinc-400">o haz clic para elegir un archivo · {HINT[kind]}</p>
      </div>
      {rejected && <p className="text-sm text-red-400">{rejected}</p>}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={ACCEPT[kind]}
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
