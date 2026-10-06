const PRIMARY_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const FALLBACK_API_URL = "http://127.0.0.1:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const primaryUrl = `${PRIMARY_API_URL.replace(/\/+$/, "")}${cleanEndpoint}`;

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
    // If primary fetch failed (e.g. localhost IPv6 ::1 resolution issue on Mac), attempt 127.0.0.1 fallback
    if (
      PRIMARY_API_URL.includes("localhost") &&
      err instanceof TypeError &&
      (err.message.includes("fetch failed") || err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))
    ) {
      try {
        const fallbackUrl = `${FALLBACK_API_URL.replace(/\/+$/, "")}${cleanEndpoint}`;
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
