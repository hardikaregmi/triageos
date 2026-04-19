import "../styles/globals.css";
import Head from "next/head";
import { useLayoutEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { AppRoleProvider } from "../contexts/AppRoleContext";
import { BRAND_LOGO_MIME, BRAND_LOGO_SRC } from "../constants/branding";
import { clearNurseSession } from "../constants/nurseSession";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noLayout = router.pathname === "/nurse-login";

  /** Fresh session on each full page load: demo-friendly; no stale JWT auto-login. */
  useLayoutEffect(() => {
    clearNurseSession();
  }, []);

  return (
    <AppRoleProvider>
      <Head>
        <title>TriageOS</title>
        <link rel="icon" href={BRAND_LOGO_SRC} type={BRAND_LOGO_MIME} />
        <link rel="apple-touch-icon" href={BRAND_LOGO_SRC} />
      </Head>
      {noLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AppRoleProvider>
  );
}
