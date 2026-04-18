import { useEffect } from "react";
import { useRouter } from "next/router";
import { isNurseLoggedIn } from "../constants/nurseSession";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace(isNurseLoggedIn() ? "/dashboard" : "/nurse-login");
  }, [router]);

  return null;
}
