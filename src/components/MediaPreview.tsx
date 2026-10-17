"use client";

import { MaskPainter } from "./MaskPainter";

interface Props {
  file: File;
  previewUrl: string;
  maskMode: boolean;
  disabled?: boolean;
  onMaskChange: (mask: Blob | null) => void;
  onRemove: () => void;
}

function formatSize(bytes: number) {
  if (bytes > 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes > 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Vista previa del archivo seleccionado; en imágenes permite pintar la máscara de borrado. */
export function MediaPreview({ file, previewUrl, maskMode, disabled, onMaskChange, onRemove }: Props) {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-100">{file.name}</p>
          <p className="text-xs text-zinc-500">
            {file.type || "desconocido"} · {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-40"
        >
          Cambiar archivo
        </button>
      </div>

      {isImage ? (
        <MaskPainter key={`${previewUrl}-${maskMode}`} imageUrl={previewUrl} enabled={maskMode && !disabled} onMaskChange={onMaskChange} />
      ) : (
        <video src={previewUrl} controls className="mx-auto max-h-[60vh] w-full rounded-xl bg-black ring-1 ring-white/10" />
      )}
    </div>
  );
}
