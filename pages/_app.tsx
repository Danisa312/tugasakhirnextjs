import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Layout } from '../components/layout/layout';
import { checkAuthClient } from '../utils/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const lightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {},
  },
});

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {},
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Daftar halaman yang tidak pakai layout
  const noLayoutPages = ['/login', '/register']; // tambah sesuai kebutuhan
  const isNoLayout = noLayoutPages.includes(router.pathname);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isNoLayout) {
      checkAuthClient();
    }
  }, [router.pathname]); // tambahkan dependensi agar react aware saat route berubah

  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <NextUIProvider>
        {isNoLayout ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default MyApp;