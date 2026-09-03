const METRIKA_ID = 111934619;

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

export function initYandexMetrika() {
  if (window.ym) {
    return;
  }

  const ym: any = function (...args: any[]) {
    (ym.a = ym.a || []).push(args);
  };

  ym.l = Date.now();

  window.ym = ym;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;

  document.head.appendChild(script);

  ym(METRIKA_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}