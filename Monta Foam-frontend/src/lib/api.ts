import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly refresh-token cookie
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
const SESSION_MARKER = "montaFoamSession";

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem(SESSION_MARKER, "1");
    } else {
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem(SESSION_MARKER);
    }
  }
};

export const hasKnownSession = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(getAccessToken() || localStorage.getItem(SESSION_MARKER));
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = sessionStorage.getItem("accessToken");
  }
  return accessToken;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 once, then retry the original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = String(originalRequest?.url ?? "");
    const isPublicAuthRequest = [
      "/auth/login",
      "/auth/register",
      "/auth/verify-email",
      "/auth/resend-otp",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/google",
      "/auth/refresh",
    ].some((path) => url.includes(path));

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest &&
      hasKnownSession()
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= axios
          .post(
            `${API_BASE_URL}/auth/refresh`,
            undefined,
            { withCredentials: true, headers: { "Content-Type": "application/json" } },
          )
          .then((response) => {
            const token = response.data?.data?.accessToken as string | undefined;
            if (!token) throw new Error("Refresh response did not include an access token");
            setAccessToken(token);
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const token = await refreshPromise;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  },
);
