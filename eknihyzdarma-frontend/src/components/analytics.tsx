"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getCookieConsent } from "@/components/cookie-banner";

export default function Analytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Souhlas už byl dříve udělen
    if (getCookieConsent() === "accepted") {
      setConsent(true);
    }

    // Souhlas právě udělený kliknutím na banner
    const handler = () => setConsent(true);
    window.addEventListener("cookieConsentAccepted", handler);
    return () => window.removeEventListener("cookieConsentAccepted", handler);
  }, []);

  if (!consent) return null;

  return (
    <>
      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8543878903194593"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2KE1TM1GWS"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2KE1TM1GWS');
        `}
      </Script>
    </>
  );
}
