import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    _hmt?: unknown[][];
  }
}

const pagePath = (pathname: string, search: string) => `${pathname}${search}`;

/**
 * Third-party page analytics, enabled by build-time env vars:
 * - GA_MEASUREMENT_ID   -> Google Analytics 4
 * - BAIDU_TONGJI_ID     -> Baidu Tongji (百度统计)
 *
 * Rendered inside <head>. No-ops (renders nothing) when neither ID is set.
 */
export function PageAnalytics() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  // GA4 config uses send_page_view:false, so every route change (including
  // the first one after hydration) is reported here.
  useEffect(() => {
    if (!__GA_MEASUREMENT_ID__ || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath(location.pathname, location.search),
    });
  }, [location.pathname, location.search]);

  // Baidu Tongji tracks the initial load on its own; only forward SPA navigations.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!__BAIDU_TONGJI_ID__) return;
    window._hmt = window._hmt || [];
    window._hmt.push(['_trackPageview', pagePath(location.pathname, location.search)]);
  }, [location.pathname, location.search]);

  if (!__GA_MEASUREMENT_ID__ && !__BAIDU_TONGJI_ID__) return null;

  return (
    <>
      {__GA_MEASUREMENT_ID__ && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${__GA_MEASUREMENT_ID__}`} />
          <script
            dangerouslySetInnerHTML={{
              __html:
                `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}`
                + `gtag('js',new Date());`
                + `gtag('config','${__GA_MEASUREMENT_ID__}',{send_page_view:false});`,
            }}
          />
        </>
      )}
      {__BAIDU_TONGJI_ID__ && (
        <script
          dangerouslySetInnerHTML={{
            __html:
              `window._hmt=window._hmt||[];(function(){`
              + `var hm=document.createElement('script');hm.async=true;`
              + `hm.src='https://hm.baidu.com/hm.js?${__BAIDU_TONGJI_ID__}';`
              + `var s=document.getElementsByTagName('script')[0];`
              + `s.parentNode.insertBefore(hm,s);})();`,
          }}
        />
      )}
    </>
  );
}
