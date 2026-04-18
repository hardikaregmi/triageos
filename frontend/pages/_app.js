import "../styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { AppRoleProvider } from "../contexts/AppRoleContext";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noLayout = router.pathname === "/nurse-login";

  return (
    <AppRoleProvider>
      <Head>
        <title>TriageOS</title>
        <link rel="icon" href="/favicon.ico" />
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
