/**
 * Centralized API Service Helper
 * Wraps native fetch calls with automatic retry capabilities and enhanced error logging for 404 responses.
 */

export interface ApiFetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Resolves full API URL ensuring cross-origin requests from external sites (e.g. majesticfleetsl.com)
 * target the live Cloud Run backend server.
 */
export function getApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 1. Check window overrides or URL parameters
  if (typeof window !== "undefined") {
    const win = window as any;
    if (win.__VELVET_BACKEND_URL__) return `${win.__VELVET_BACKEND_URL__.replace(/\/$/, "")}${cleanPath}`;
    if (win.__API_BASE_URL__) return `${win.__API_BASE_URL__.replace(/\/$/, "")}${cleanPath}`;

    try {
      const urlParams = new URLSearchParams(win.location.search);
      const backendParam = urlParams.get("backend") || urlParams.get("api_base");
      if (backendParam) {
        return `${backendParam.replace(/\/$/, "")}${cleanPath}`;
      }
    } catch {}
  }

  // 2. Check environment variables
  const envBackend = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_APP_URL;
  if (envBackend && typeof envBackend === "string" && envBackend.startsWith("http")) {
    return `${envBackend.replace(/\/$/, "")}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Custom fetch wrapper that automatically resolves cross-origin API URLs, retries failed requests,
 * and logs error details.
 */
export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const resolvedUrl = getApiUrl(url);
  const { retries = 2, retryDelay = 1000, ...fetchOptions } = options;
  const method = fetchOptions.method || "GET";
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(resolvedUrl, fetchOptions);

      if (!response.ok) {
        if (response.status === 404) {
          console.error(
            `[API Service 404 Not Found] Endpoint: ${method} ${url} | Attempt ${attempt + 1}/${retries + 1}`
          );
        } else {
          console.warn(
            `[API Service Error ${response.status}] Endpoint: ${method} ${url} | Attempt ${attempt + 1}/${retries + 1}`
          );
        }

        // Retry on 5xx server errors if attempts remain
        if (attempt < retries && response.status >= 500) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson && (errorJson.error || errorJson.message)) {
            errorMessage = errorJson.error || errorJson.message;
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMessage);
      }

      // Successful response handling
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }
      const text = await response.text();
      return text as unknown as T;
    } catch (err: any) {
      if (attempt < retries) {
        console.warn(
          `[API Service Retrying] ${method} ${url} failed with error: "${err.message || err}". Retrying in ${retryDelay * (attempt + 1)}ms... (Attempt ${attempt + 1}/${retries})`
        );
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      } else {
        console.error(
          `[API Service Request Failed] ${method} ${url} failed after ${retries + 1} attempts: ${err.message || err}`
        );
        throw err;
      }
    }
  }

  throw new Error(`[API Service] Failed to execute request for ${url}`);
}

/**
 * Dedicated API helpers for Booking endpoints (/api/reserve, /api/bookings)
 */
export const bookingApi = {
  /** Fetch all bookings from the server (/api/reserve) */
  getAll: (options?: ApiFetchOptions) =>
    apiFetch<any[]>("/api/reserve", { method: "GET", ...options }),

  /** Create, sync, or save a booking (/api/bookings) */
  saveBooking: (bookingData: any, options?: ApiFetchOptions) =>
    apiFetch<any>("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
      ...options,
    }),

  /** Assign a driver to a booking (/api/reserve/:id/assign) */
  assignDriver: (bookingId: string, payload: { assignedDriverId?: string | null; driverPhone?: string; driverName?: string }, options?: ApiFetchOptions) =>
    apiFetch<any>(`/api/reserve/${bookingId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      ...options,
    }),

  /** Update flight/trip status for a booking (/api/reserve/:id/flight-status) */
  updateFlightStatus: (bookingId: string, flightStatus: string, options?: ApiFetchOptions) =>
    apiFetch<any>(`/api/reserve/${bookingId}/flight-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightStatus }),
      ...options,
    }),

  /** Resend invoice email for a booking (/api/bookings/:id/resend-invoice) */
  resendInvoice: (bookingId: string, email?: string, options?: ApiFetchOptions) =>
    apiFetch<{ success: boolean; message?: string }>(`/api/bookings/${bookingId}/resend-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email ? { email } : {}),
      ...options,
    }),
};

/**
 * Dedicated API helpers for Vehicle Price endpoints (/api/vehicle-prices)
 */
export const vehiclePriceApi = {
  /** Fetch vehicle price rules (/api/vehicle-prices) */
  getPrices: (options?: ApiFetchOptions) =>
    apiFetch<any[]>("/api/vehicle-prices", { method: "GET", ...options }),

  /** Update vehicle price rules (/api/vehicle-prices) */
  updatePrices: (pricesArray: any[], options?: ApiFetchOptions) =>
    apiFetch<{ success: boolean; prices: any[] }>("/api/vehicle-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices: pricesArray }),
      ...options,
    }),
};
