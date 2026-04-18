export const NURSE_SESSION = {
  token: "triageos_nurse_jwt",
  /** @deprecated legacy key; cleared on login */
  loggedIn: "triageos_nurse_logged_in",
  name: "triageos_staff_name",
  username: "triageos_nurse_username",
  /** @deprecated legacy display id */
  staffId: "triageos_staff_id",
  station: "triageos_staff_station",
  status: "triageos_staff_status",
};

export const NURSE_STATION_OPTIONS = [
  "OPD · Floor 2",
  "OPD · Floor 3",
  "ED · Floor 1",
];

function parseJwtPayload(token) {
  try {
    const parts = String(token).split(".");
    if (parts.length !== 3) {
      return null;
    }
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getNurseToken() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem(NURSE_SESSION.token);
  } catch {
    return null;
  }
}

/** True when a non-expired JWT is stored. */
export function isNurseLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const token = localStorage.getItem(NURSE_SESSION.token);
    if (!token) {
      return false;
    }
    const payload = parseJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") {
      return false;
    }
    const skewSec = 30;
    return Date.now() / 1000 < payload.exp - skewSec;
  } catch {
    return false;
  }
}

export function clearNurseSession() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(NURSE_SESSION.token);
    localStorage.removeItem(NURSE_SESSION.loggedIn);
    localStorage.removeItem(NURSE_SESSION.name);
    localStorage.removeItem(NURSE_SESSION.username);
    localStorage.removeItem(NURSE_SESSION.staffId);
    localStorage.removeItem(NURSE_SESSION.station);
    localStorage.removeItem(NURSE_SESSION.status);
  } catch {
    /* ignore */
  }
}

/** Normalizes a raw value to N-#### staff id form (optional legacy helpers). */
export function normalizeNurseStaffId(raw) {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return "";
  const digitsOnly = v.replace(/\D/g, "");
  if (digitsOnly) {
    return `N-${digitsOnly.slice(-4).padStart(4, "0")}`;
  }
  return v;
}
