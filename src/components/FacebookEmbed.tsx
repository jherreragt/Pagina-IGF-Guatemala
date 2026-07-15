import { useEffect, useRef, useState } from 'react';

interface FacebookEmbedProps {
  pageUrl: string;
  pageName?: string;
  height?: number;
}

declare global {
  interface Window {
    FB?: {
      XFBML?: {
        parse: (node?: HTMLElement) => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

let sdkLoading = false;
let sdkLoaded = false;

function loadFacebookSDK() {
  if (sdkLoaded || sdkLoading) return;
  sdkLoading = true;

  window.fbAsyncInit = function () {
    sdkLoaded = true;
    sdkLoading = false;
    window.FB?.XFBML?.parse();
  };

  const script = document.createElement('script');
  script.id = 'facebook-jssdk';
  script.src = 'https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v19.0';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export default function FacebookEmbed({
  pageUrl,
  pageName = 'Facebook',
  height = 500,
}: FacebookEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parsed, setParsed] = useState(false);

  useEffect(() => {
    if (!pageUrl) return;

    if (sdkLoaded) {
      window.FB?.XFBML?.parse(containerRef.current ?? undefined);
    } else {
      loadFacebookSDK();
    }
    setParsed(true);
  }, [pageUrl, parsed]);

  if (!pageUrl) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center"
        style={{ height }}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm font-medium">Publicaciones de {pageName}</p>
        <p className="text-slate-400 text-xs mt-1 max-w-xs">
          Pronto mostraremos aquí las publicaciones de nuestra página de Facebook.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div
        className="fb-page"
        data-href={pageUrl}
        data-tabs="timeline"
        data-width="500"
        data-height={height}
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      >
        <blockquote cite={pageUrl} className="fb-xfbml-parse-ignore">
          <a href={pageUrl} target="_blank" rel="noopener noreferrer">
            Ver {pageName} en Facebook
          </a>
        </blockquote>
      </div>
    </div>
  );
}
