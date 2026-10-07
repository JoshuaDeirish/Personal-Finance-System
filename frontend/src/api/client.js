import axios from "axios";

/**
 * Single axios instance for the whole app.
 *
 * Auth is a Django session cookie (httpOnly, never visible to JS). Django's
 * CSRF protection needs the `csrftoken` cookie echoed back as X-CSRFToken on
 * unsafe requests; axios does that automatically via xsrfCookieName/HeaderName.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: { "Content-Type": "application/json" },
});

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

function hasCsrfCookie() {
  return document.cookie.split("; ").some((c) => c.startsWith("csrftoken="));
}

let csrfRequest = null;

export function ensureCsrfCookie() {
  if (hasCsrfCookie()) return Promise.resolve();
  if (!csrfRequest) {
    csrfRequest = api.get("/auth/csrf/").finally(() => {
      csrfRequest = null;
    });
  }
  return csrfRequest;
}

api.interceptors.request.use(async (config) => {
  if (UNSAFE_METHODS.has((config.method || "get").toLowerCase())) {
    await ensureCsrfCookie();
  }
  return config;
});

let unauthorizedHandler = null;

/** AuthContext registers this so any 401 drops the user back to the login screen. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);

/** Per-field messages from a DRF 400 response, e.g. { email: "Already exists." } */
export function getFieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "detail" || key === "non_field_errors") continue;
    fields[key] = Array.isArray(value) ? value.join(" ") : String(value);
  }
  return fields;
}

/** One human-readable message for any API error. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error?.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const { status, data } = error.response;
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status >= 500) return "The server had a problem. Please try again shortly.";
  if (data?.detail) return data.detail;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors.join(" ");
  const fields = Object.values(getFieldErrors(error));
  return fields[0] || fallback;
}

export default api;
