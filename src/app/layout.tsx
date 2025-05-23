import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { googleMapsApiKey } from "./api/helpers";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import "../styles/fonts.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://wari.hawkperu.com"),
  title:
    "Wari - Taxis Seguros con GPS en Huánuco | Comparte tu ubicación en tiempo real",
  description:
    "Con Wari, los taxis en Huánuco son más seguros. Gracias al GPS integrado, puedes ver el recorrido del taxi en tiempo real y compartir tu ubicación con tus seres queridos. Totalmente gratis para el pasajero.",
  keywords: [
    "taxi seguro",
    "Huánuco",
    "Wari app",
    "GPS taxi",
    "ubicación taxi en tiempo real",
    "taxis confiables Huánuco",
    "app taxi gratis Perú",
  ],
  openGraph: {
    title: "Wari - Taxis Seguros en Huánuco",
    description:
      "Ve el recorrido del taxi en tiempo real y compártelo con tus familiares. Seguridad gratis para el pasajero.",
    url: "https://wari.hawkperu.com/",
    siteName: "Wari",
    images: [
      {
        url: "https://wari.hawkperu.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Wari - Taxi seguro con GPS",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wari - Taxis Seguros con GPS en Huánuco",
    description:
      "Con Wari puedes seguir en tiempo real el taxi donde viaja tu ser querido. Seguridad y tranquilidad gracias al GPS Hawk.",
    images: ["https://wari.hawkperu.com/logo.png"],
    creator: "@wari_huanuco",
  },
  alternates: {
    canonical: "https://wari.hawkperu.com",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="es" className={montserrat.variable} suppressHydrationWarning>
        <head>
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Wari",
                "url": "https://wari.hawkperu.com",
                "logo": "https://wari.hawkperu.com/logo.png"
              }
            `}
          </script>
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Wari",
                "alternateName": "Wari - seguimiento vehicular",
                "url": "https://wari.hawkperu.com/"
              }
            `}
          </script>

          <meta
            name="google-site-verification"
            content="1h7rffeEA3YwY6ATcAma8uEoJgz7QZeuT6XSJ8lAu4c"
          />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="manifest" href="/site.webmanifest" />

          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
            async
            defer
          ></script>
        </head>
        <body>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
