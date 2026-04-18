import { clearNurseSession, getNurseToken } from "../constants/nurseSession";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

/**
 * Headers for JSON API calls; includes Bearer token when the nurse is logged in.
 */
export function authHeaders(includeJsonContentType = true) {
  const headers = {};
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }
  const token = getNurseToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * If the response is 401, clears the session and returns true (caller should stop and redirect).
 */
export function handleUnauthorized(res, router) {
  if (res.status !== 401) {
    return false;
  }
  clearNurseSession();
  if (router && typeof router.replace === "function") {
    router.replace("/nurse-login");
  }
  return true;
}
