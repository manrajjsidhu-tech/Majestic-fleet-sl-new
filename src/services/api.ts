/**
 * Centralized API Service Helper
 * Wraps native fetch calls with automatic retry capabilities and enhanced error logging.
 */

export interface ApiFetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

// Get API Base URL from environment variables or default to current origin
const API_BASE_URL =
  typeof process !== "undefined" && process.env?.VITE_API_BASE_URL
    ? process.env.VITE_API_BASE_URL
    : "";

/**
 * Custom fetch wrapper that automatically retries failed 5xx/network requests.
 */
export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { retries = 2, retryDelay = 1000, ...fetchOptions } = options;
  const method = fetchOptions.method || "GET";
  const targetUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(targetUrl, fetchOptions);

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`[API Service 404 Not Found] Endpoint: ${method} ${targetUrl}`);
          let errorMessage = `HTTP 404: Endpoint ${targetUrl} not found on server`;
          try {
            const errorJson = await response.json();
            if (errorJson?.error || errorJson?.message) {
              errorMessage = errorJson.error || errorJson.message;
            }
          } catch {
            // Non-JSON response
          }
          // DO NOT retry on 404 as the route does not exist
          throw new Error(errorMessage);
        }

        console.warn(
          `[API Service Error ${response.status}] Endpoint: ${method} ${targetUrl} | Attempt ${attempt + 1}/${retries + 1}`
        );

        // Retry ONLY on 5xx server errors
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
      if (attempt < retries && !err.message?.includes("HTTP 404")) {
        console.warn(
          `[API Service Retrying] ${method} ${targetUrl} failed: "${err.message || err}". Retrying in ${retryDelay * (attempt + 1)}ms...`
        );
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      } else {
        console.error(
          `[API Service Request Failed] ${method} ${targetUrl}: ${err.message || err}`
        );
        throw err;
      }
    }
  }

  throw new Error(`[API Service] Failed to execute request for ${targetUrl}`);
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
  assignDriver: (
    bookingId: string,
    payload: { assignedDriverId?: string | null; driverPhone?: string; driverName?: string },
    options?: ApiFetchOptions
  ) =>
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
