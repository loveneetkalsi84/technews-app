'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdSenseScript() {
  const handleError = (e: Error) => {
    console.error('AdSense script failed to load:', e);
  };

  const handleLoad = () => {
    console.log('AdSense script loaded successfully');
  };

  return (
    <Script 
      async 
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
