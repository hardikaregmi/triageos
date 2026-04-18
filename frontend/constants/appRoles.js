/**
 * Application experience roles (auth to be layered on later).
 * Values are stable strings for URLs, storage, and future API claims.
 */
export const AppRole = {
  NURSE: "nurse",
  DOCTOR: "doctor",
  HOSPITAL_ADMIN: "hospital_admin",
};

export const APP_ROLES = Object.values(AppRole);

/** Default matches current product (triage / intake–first flows). */
export const DEFAULT_APP_ROLE = AppRole.NURSE;

export const STORAGE_KEY_APP_ROLE = "triageos_app_role";

/** Placeholder tenant until hospital context comes from auth or routing. */
export const DEFAULT_HOSPITAL_ID = "1";

export function isAppRole(value) {
  return typeof value === "string" && APP_ROLES.includes(value);
}
