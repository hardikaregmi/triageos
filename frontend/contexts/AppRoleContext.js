import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AppRole,
  DEFAULT_APP_ROLE,
  DEFAULT_HOSPITAL_ID,
  STORAGE_KEY_APP_ROLE,
  isAppRole,
} from "../constants/appRoles";

const AppRoleContext = createContext(null);

/**
 * Experience role for nurse vs doctor vs hospital admin UIs (no auth yet).
 * Dev override: localStorage.setItem(STORAGE_KEY_APP_ROLE, AppRole.DOCTOR) then reload.
 */
export function AppRoleProvider({ children }) {
  const [role, setRoleState] = useState(DEFAULT_APP_ROLE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APP_ROLE);
      if (isAppRole(stored)) {
        setRoleState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setRole = useCallback((next) => {
    if (!isAppRole(next)) return;
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY_APP_ROLE, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      hospitalId: DEFAULT_HOSPITAL_ID,
      isNurse: role === AppRole.NURSE,
      isDoctor: role === AppRole.DOCTOR,
      isHospitalAdmin: role === AppRole.HOSPITAL_ADMIN,
    }),
    [role, setRole]
  );

  return <AppRoleContext.Provider value={value}>{children}</AppRoleContext.Provider>;
}

export function useAppRole() {
  const ctx = useContext(AppRoleContext);
  if (ctx == null) {
    throw new Error("useAppRole must be used within AppRoleProvider");
  }
  return ctx;
}
