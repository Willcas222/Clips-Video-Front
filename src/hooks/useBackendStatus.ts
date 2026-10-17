"use client";

import { useCallback, useEffect, useState } from "react";
import { contentService } from "@/services/contentService";
import { getErrorMessage } from "@/services/apiClient";
import type { HealthReport, JobSummary } from "@/services/types";

/** Estado de los servicios locales (Ollama, Python, FFmpeg) e historial de trabajos. */
export function useBackendStatus(refreshKey: unknown) {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobSummary[]>([]);

  const refreshHealth = useCallback(async (fresh = false) => {
    try {
      setHealth(await contentService.health(fresh));
      setHealthError(null);
    } catch (err) {
      // Se conserva el último estado conocido: un fallo puntual (CPU saturada) no implica caída.
      setHealthError(getErrorMessage(err));
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      setJobs(await contentService.listJobs());
    } catch {
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde una API externa
    refreshHealth();
    const id = setInterval(() => refreshHealth(), 60_000);
    return () => clearInterval(id);
  }, [refreshHealth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con el backend al cambiar de trabajo
    refreshJobs();
    const id = setInterval(refreshJobs, 10_000);
    return () => clearInterval(id);
  }, [refreshJobs, refreshKey]);

  return { health, healthError, jobs, refreshHealth };
}
