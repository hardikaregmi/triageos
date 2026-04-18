import "../styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { AppRoleProvider } from "../contexts/AppRoleContext";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noLayout = router.pathname === "/nurse-login";

  return (
    <AppRoleProvider>
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
