/**
 * Normalizes the backend base URL to ensure it always includes the `/api/v1` prefix
 * without duplicate slashes.
 *
 * Examples:
 * - undefined / "" -> "http://localhost:8000/api/v1"
 * - "http://localhost:8000" -> "http://localhost:8000/api/v1"
 * - "https://duolingo-clone-backend.onrender.com" -> "https://duolingo-clone-backend.onrender.com/api/v1"
 * - "https://duolingo-clone-backend.onrender.com/" -> "https://duolingo-clone-backend.onrender.com/api/v1"
 * - "https://duolingo-clone-backend.onrender.com/api" -> "https://duolingo-clone-backend.onrender.com/api/v1"
 * - "https://duolingo-clone-backend.onrender.com/api/v1" -> "https://duolingo-clone-backend.onrender.com/api/v1"
 */
export function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim();

  if (!url) {
    return "http://localhost:8000/api/v1";
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, "");

  if (url.endsWith("/api/v1")) {
    return url;
  }

  if (url.endsWith("/api")) {
    return `${url}/v1`;
  }

  return `${url}/api/v1`;
}

export const API_BASE_URL = getApiBaseUrl();
const FALLBACK_API_URL = "http://127.0.0.1:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const primaryUrl = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(primaryUrl, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        // ignore non-json error responses
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (err: unknown) {
    // Only attempt 127.0.0.1 fallback in local dev environment if localhost resolution failed
    if (
      API_BASE_URL.includes("localhost") &&
      err instanceof TypeError &&
      (err.message.includes("fetch failed") ||
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError"))
    ) {
      try {
        const fallbackUrl = `${FALLBACK_API_URL}${cleanEndpoint}`;
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });

        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch {
        // ignore fallback failure and throw original
      }
    }

    throw err;
  }
}
