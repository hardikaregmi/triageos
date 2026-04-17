import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomeAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
