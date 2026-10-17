"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { contentService } from "@/services/contentService";
import { getErrorMessage } from "@/services/apiClient";
import type { Job, JobCreated } from "@/services/types";

export type UploadPhase = "idle" | "uploading" | "processing" | "completed" | "failed";

const POLL_INTERVAL_MS = 2000;
/** Fallos de red consecutivos tolerados durante el polling antes de rendirse. */
const MAX_POLL_ERRORS = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Maneja el ciclo completo: subida (con % de progreso) -> trabajo en cola ->
 * polling del estado de la IA -> resultado final o error.
 */
export function useUpload() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Trabajo que se está siguiendo; cambiarlo detiene el bucle de polling anterior. */
  const activeJobId = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    activeJobId.current = null;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const poll = useCallback(async (jobId: string) => {
    activeJobId.current = jobId;
    let errors = 0;
    while (activeJobId.current === jobId) {
      try {
        const next = await contentService.getJob(jobId);
        if (activeJobId.current !== jobId) return;
        errors = 0;
        setJob(next);
        if (next.status === "completed" || next.status === "failed") {
          setPhase(next.status);
          if (next.status === "failed") setError(next.error ?? "El procesamiento falló");
          activeJobId.current = null;
          return;
        }
      } catch (err) {
        if (++errors >= MAX_POLL_ERRORS) {
          setPhase("failed");
          setError(getErrorMessage(err));
          activeJobId.current = null;
          return;
        }
      }
      await sleep(POLL_INTERVAL_MS);
    }
  }, []);

  const submit = useCallback(
    async (send: (onProgress: (p: number) => void) => Promise<JobCreated>) => {
      stopPolling();
      setError(null);
      setJob(null);
      setUploadProgress(0);
      setPhase("uploading");
      try {
        const created = await send(setUploadProgress);
        setPhase("processing");
        void poll(created.jobId);
        return created.jobId;
      } catch (err) {
        setPhase("failed");
        setError(getErrorMessage(err));
        return null;
      }
    },
    [poll, stopPolling],
  );

  /** Reabre un trabajo existente (por ejemplo, desde el historial). */
  const track = useCallback(
    (jobId: string) => {
      setError(null);
      setJob(null);
      setPhase("processing");
      void poll(jobId);
    },
    [poll],
  );

  const reset = useCallback(() => {
    stopPolling();
    setPhase("idle");
    setUploadProgress(0);
    setJob(null);
    setError(null);
  }, [stopPolling]);

  return { phase, uploadProgress, job, error, submit, track, reset };
}
