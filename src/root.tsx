import { useEffect, type ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from 'react-router';
import { ToastProvider } from './components/ui/Toast';
import { PageAnalytics } from './components/analytics/PageAnalytics';
import { useLibraryStore } from './store/library';
import stylesheet from './index.css?url';
import syneSemibold from '@fontsource/syne/files/syne-latin-600-normal.woff2?url';
import syneBold from '@fontsource/syne/files/syne-latin-700-normal.woff2?url';
import manropeRegular from '@fontsource/manrope/files/manrope-latin-400-normal.woff2?url';
import manropeSemibold from '@fontsource/manrope/files/manrope-latin-600-normal.woff2?url';
import plexMedium from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2?url';

const readingFonts = [syneSemibold, syneBold, manropeRegular, manropeSemibold, plexMedium];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const canonical = `${__SITE_URL__}${location.pathname}`;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#090A0F" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${__SITE_URL__}/social-card.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${__SITE_URL__}/social-card.png`} />
        <Meta />
        {readingFonts.map((href) => <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />)}
        <link id="full-stylesheet" rel="stylesheet" href={stylesheet} />
        <Links />
        <PageAnalytics />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {__VERCEL_ANALYTICS_ENABLED__ && <Analytics />}
      </body>
    </html>
  );
}

function LibraryHydrator() {
  useEffect(() => {
    void Promise.resolve(useLibraryStore.persist.rehydrate()).finally(() => {
      document.documentElement.dataset.appReady = 'true';
    });
  }, []);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <LibraryHydrator />
      <Outlet />
    </ToastProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error interrupted this page.';
  return (
    <main className="root-error">
      <span className="eyebrow">Playback interrupted</span>
      <h1>The page could not be rendered.</h1>
      <p>{message}</p>
      <a href="/">Return home</a>
    </main>
  );
}
