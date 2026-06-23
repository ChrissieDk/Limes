import axios from "axios";
import { getIdToken } from "firebase/auth";
import { auth } from "./firebase";
import { API_TIMEOUT_MS } from "../constants/api";
import { log } from "../lib/sentry-logger";

const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;
const STAGING_URL = "https://limes-staging.up.railway.app";

// Fallback to staging URL when VITE_API_URL is not set.
// Production builds should set VITE_API_URL in the deployment platform (e.g. Vercel).
const resolvedApiUrl = apiUrl || STAGING_URL;
if (!apiUrl && !isDev) {
  console.warn(
    "VITE_API_URL is not set. Falling back to staging URL:",
    STAGING_URL,
  );
}

try {
  localStorage.removeItem("authToken");
} catch {
  // ignore
}

export const apiClient = axios.create({
  baseURL: isDev ? "/api" : `${resolvedApiUrl}/api`,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Token refresh failed — let the request go without auth
        // The 401 handler will redirect if needed
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling + Sentry logging
apiClient.interceptors.response.use(
  (response) => {
    // Log slow API calls
    const duration = response.config.headers["x-request-start"]
      ? Date.now() - Number(response.config.headers["x-request-start"])
      : undefined;

    if (duration && duration > 2000) {
      log.warn("api_slow_response", {
        endpoint: response.config.url || "unknown",
        method: response.config.method?.toUpperCase() || "GET",
        status: response.status,
        duration_ms: duration,
      });
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const endpoint = error.config?.url || "unknown";
    const method = error.config?.method?.toUpperCase() || "GET";

    if (status === 401) {
      const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      const pathname = window.location.pathname.replace(base, "") || "/";
      const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/signin") ||
        pathname.startsWith("/signup");

      log.warn("api_401_unauthorized", {
        endpoint,
        method,
        route: pathname,
        is_public_route: isPublicRoute,
      });

      // NOTE: We intentionally do NOT redirect here. 401 errors are allowed to
      // propagate to the component level so that UI can show graceful messages
      // (e.g. "Your session has expired"). Auth redirects are handled at the
      // routing layer by <AuthenticatedRoute>.
    } else if (status && status >= 500) {
      log.error("api_server_error", {
        endpoint,
        method,
        status,
        message: error.message,
      });
    } else if (error.code === "ECONNABORTED") {
      log.error("api_timeout", {
        endpoint,
        method,
        timeout_ms: API_TIMEOUT_MS,
      });
    } else if (status && status >= 400) {
      log.warn("api_client_error", {
        endpoint,
        method,
        status,
        message: error.message,
      });
    } else {
      // Network or unknown errors
      log.error("api_network_error", {
        endpoint,
        method,
        code: error.code || "UNKNOWN",
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);

// Stamp request start time for duration tracking
apiClient.interceptors.request.use((config) => {
  config.headers["x-request-start"] = String(Date.now());
  return config;
});
