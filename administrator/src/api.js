import axios from "axios";

const fallbackEndpoint = "http://localhost:3000/api";
const configuredEndpoint = import.meta.env.VITE_BACKEND_ENDPOINT?.trim();

export const API_URL = (configuredEndpoint || fallbackEndpoint).replace(
  /\/$/,
  "",
);

export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
export const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshRequest = null;
let adminSessionRejected = false;

export function markAdminSessionActive() {
  adminSessionRejected = false;
}

export function markAdminSessionInactive() {
  adminSessionRejected = true;
}

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthRequest = request?.url?.includes("/admin/auth/");

    if (error.response?.status !== 401 || request?._retried || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retried = true;

    if (adminSessionRejected) {
      return Promise.reject(error);
    }

    if (!refreshRequest) {
      refreshRequest = publicApi
        .post("/admin/auth/refresh")
        .then((response) => {
          adminSessionRejected = false;
          return response;
        })
        .catch((refreshError) => {
          adminSessionRejected = true;
          window.dispatchEvent(new Event("admin-session-expired"));
          throw refreshError;
        })
        .finally(() => {
          refreshRequest = null;
        });
    }

    try {
      await refreshRequest;
      return adminApi(request);
    } catch {
      return Promise.reject(error);
    }
  },
);

export function errorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || error?.message || fallback;
}
