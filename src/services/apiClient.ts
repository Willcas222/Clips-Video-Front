import axios, { AxiosError } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30_000,
});

/** URL que fuerza la descarga (Guardar como) de un archivo servido en /files/inputs|outputs. */
export function toDownloadUrl(fileUrl: string): string {
  return fileUrl.replace(/\/files\/(inputs|outputs)\//, "/files/download/$1/");
}

/** Extrae un mensaje legible de cualquier error de Axios/red. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiMessage = (error.response?.data as { error?: { message?: string; details?: unknown } } | undefined)?.error;
    if (apiMessage?.message) {
      const details = apiMessage.details ? ` ${JSON.stringify(apiMessage.details)}` : "";
      return `${apiMessage.message}${details}`;
    }
    if (error.code === "ERR_NETWORK") {
      return `No se pudo conectar con el backend en ${API_URL}. ¿Está corriendo "npm run dev" en /backend?`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}
