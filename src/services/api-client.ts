/**
 * Base API client for handling common functionality
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Cache for in-flight requests to prevent duplicate requests
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Base fetch function with authentication and error handling
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type to application/json for POST and PUT requests that aren't FormData
  if (
    (options.method === "POST" || options.method === "PUT") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Ensure there's no double slash between base URL and endpoint
  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  // Create a cache key for this request
  const cacheKey = `${options.method || "GET"}:${url}:${
    options.body ? JSON.stringify(options.body) : ""
  }`;

  // Check if this request is already in flight
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  // Create the fetch promise
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        throw new Error("Could not validate credentials");
      }

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const data = await response.json();

          if (!response.ok) {
            // Handle validation errors (422) with more detail
            if (response.status === 422) {
              const errorMessage = Array.isArray(data.detail)
                ? data.detail
                    .map(
                      (err: { loc: string[]; msg: string }) =>
                        `${err.loc.join(".")}: ${err.msg}`
                    )
                    .join(", ")
                : data.detail || "Validation error";
              throw new Error(errorMessage);
            }

            // Special handling for content generation errors
            if (
              response.status === 500 &&
              endpoint.includes("batch-generate")
            ) {
              // Check if the error contains the specific format we're seeing
              if (
                data.detail &&
                typeof data.detail === "string" &&
                data.detail.includes("content {") &&
                data.detail.includes("finish_reason: RECITATION")
              ) {
                throw new Error(`Failed to generate content: ${data.detail}`);
              }
            }

            throw new Error(data.detail || "An error occurred");
          }

          return data;
        } catch (error) {
          // If JSON parsing fails but response is ok, return null
          if (response.ok) {
            return null;
          }
          throw error;
        }
      }

      // For non-JSON responses, just check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For empty responses with ok status, return null
      return null;
    } catch (error) {
      // Enhance error message for network errors
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error("Network error: Could not connect to the server");
      }
      throw error;
    } finally {
      // Remove the request from the in-flight cache after it completes or fails
      inFlightRequests.delete(cacheKey);
    }
  })();

  // Store the promise in the in-flight cache
  inFlightRequests.set(cacheKey, fetchPromise);

  return fetchPromise as Promise<T>;
};

/**
 * Create form data for file uploads
 */
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof Blob || value instanceof File) {
        formData.append(key, value);
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        formData.append(key, String(value));
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      }
    }
  });

  return formData;
};
