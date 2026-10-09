'use client';

import { useEffect } from 'react';
import { useGetGlobalSettingsQuery } from '@/store/api/cmsApi';

function injectHtmlSnippet(htmlContent: string | undefined, target: HTMLElement, containerId: string) {
  if (!htmlContent || typeof htmlContent !== 'string' || !htmlContent.trim()) return;

  const existing = document.getElementById(containerId);
  if (existing) {
    if (existing.getAttribute('data-content-hash') === String(htmlContent.length)) {
      return;
    }
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = containerId;
  container.setAttribute('data-content-hash', String(htmlContent.length));
  container.style.display = 'none';

  const parser = new DOMParser();
  const parsed = parser.parseFromString(htmlContent, 'text/html');

  const nodes = Array.from(parsed.head.childNodes).concat(Array.from(parsed.body.childNodes));
  nodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === 'script') {
        const script = document.createElement('script');
        Array.from(el.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        script.text = el.textContent || '';
        container.appendChild(script);
      } else {
        container.appendChild(el.cloneNode(true));
      }
    }
  });

  target.appendChild(container);
}

function injectInlineScript(code: string, scriptId: string, target: HTMLElement = document.head) {
  if (document.getElementById(scriptId)) return;
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'text/javascript';
  script.text = code;
  target.appendChild(script);
}

export function DynamicHead() {
  const { data: settings } = useGetGlobalSettingsQuery();

  useEffect(() => {
    if (typeof window === 'undefined' || !settings) return;

    // 1. Dynamic Favicon
    const favicon = settings.branding?.site_favicon;
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }

    const scripts = settings.scripts;
    if (!scripts) return;

    // 2. Google Tag Manager (GTM)
    const gtmHead = scripts.gtm?.head_code;
    const gtmBody = scripts.gtm?.body_code;
    const gtmId = scripts.gtm?.id;

    if (gtmHead) {
      injectHtmlSnippet(gtmHead, document.head, 'gtm-head-injected');
    } else if (gtmId && !document.getElementById('gtm-script-tag')) {
      const gtmScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      injectInlineScript(gtmScript, 'gtm-script-tag');
    }

    if (gtmBody) {
      injectHtmlSnippet(gtmBody, document.body, 'gtm-body-injected');
    } else if (gtmId && !document.getElementById('gtm-noscript-tag')) {
      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript-tag';
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.appendChild(noscript);
    }

    // 3. Google Analytics (GA4)
    const gaMeasurementId = scripts.google_analytics?.measurement_id;
    const gaScriptCode = scripts.google_analytics?.script_code;

    if (gaScriptCode) {
      injectHtmlSnippet(gaScriptCode, document.head, 'ga-custom-script');
    } else if (gaMeasurementId && !document.getElementById('ga4-script-tag')) {
      const gaExternal = document.createElement('script');
      gaExternal.id = 'ga4-script-tag';
      gaExternal.async = true;
      gaExternal.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
      document.head.appendChild(gaExternal);

      const gaInitCode = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaMeasurementId}');`;
      injectInlineScript(gaInitCode, 'ga4-init-tag');
    }

    // 4. Meta / Facebook Pixel
    const metaPixelId = scripts.meta_pixel?.pixel_id;
    const metaPixelCode = scripts.meta_pixel?.pixel_code;

    if (metaPixelCode) {
      injectHtmlSnippet(metaPixelCode, document.head, 'meta-pixel-custom');
    } else if (metaPixelId && !document.getElementById('meta-pixel-tag')) {
      const metaInit = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${metaPixelId}');fbq('track', 'PageView');`;
      injectInlineScript(metaInit, 'meta-pixel-tag');
    }

    // 5. TikTok Pixel
    const tiktokPixelId = scripts.tiktok_pixel?.pixel_id;
    if (tiktokPixelId && !document.getElementById('tiktok-pixel-tag')) {
      const tiktokInit = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};ttq.load('${tiktokPixelId}');ttq.page();}(window, document, 'ttq');`;
      injectInlineScript(tiktokInit, 'tiktok-pixel-tag');
    }

    // 6. Snapchat Pixel
    const snapchatPixelId = scripts.snapchat_pixel?.pixel_id;
    if (snapchatPixelId && !document.getElementById('snapchat-pixel-tag')) {
      const snapInit = `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init', '${snapchatPixelId}');snaptr('track', 'PAGE_VIEW');`;
      injectInlineScript(snapInit, 'snapchat-pixel-tag');
    }

    // 7. Custom Head Scripts
    const customHead = scripts.custom_head_scripts;
    if (customHead) {
      injectHtmlSnippet(customHead, document.head, 'custom-head-injection');
    }

    // 8. Custom Footer / Body Scripts
    const customFooter = scripts.custom_footer_scripts;
    if (customFooter) {
      injectHtmlSnippet(customFooter, document.body, 'custom-footer-injection');
    }
  }, [settings]);

  return null;
}
