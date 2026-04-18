export const NURSE_SESSION = {
  loggedIn: "triageos_nurse_logged_in",
  name: "triageos_staff_name",
  staffId: "triageos_staff_id",
  station: "triageos_staff_station",
  status: "triageos_staff_status",
};

export const NURSE_STATION_OPTIONS = [
  "OPD · Floor 2",
  "OPD · Floor 3",
  "ED · Floor 1",
];

export function normalizeNurseStaffId(raw) {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return "N-0104";
  const digitsOnly = v.replace(/\D/g, "");
  if (digitsOnly) {
    return `N-${digitsOnly.slice(-4).padStart(4, "0")}`;
  }
  return "N-0104";
}

export function isNurseLoggedIn() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(NURSE_SESSION.loggedIn) === "true";
  } catch {
    return false;
  }
}
