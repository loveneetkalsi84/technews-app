'use client';

import Script from 'next/script';

interface AnalyticsScriptProps {
  analyticsId: string;
}

export default function AnalyticsScript({ analyticsId }: AnalyticsScriptProps) {
  return (
    <>
      <Script 
        async 
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  );
}
