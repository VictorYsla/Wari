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
    "WARI - Taxis Seguros con GPS en Huánuco | Comparte tu ubicación en tiempo real",
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
    title: "WARI - Taxis Seguros en Huánuco",
    description:
      "Ve el recorrido del taxi en tiempo real y compártelo con tus familiares. Seguridad gratis para el pasajero.",
    url: "https://wari.hawkperu.com/",
    siteName: "WARI",
    images: [
      {
        url: "https://wari.hawkperu.com/logo.png", // Asegúrate que esta imagen existe
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
    icon: "/logo.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "WARI - Taxis Seguros con GPS en Huánuco",
    description:
      "Con Wari puedes seguir en tiempo real el taxi donde viaja tu ser querido. Seguridad y tranquilidad gracias al GPS Hawk.",
    images: ["https://wari.hawkperu.com/og-image.jpg"],
    creator: "@wari_huanuco", // opcional, si tienes cuenta de Twitter
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
          <meta
            name="google-site-verification"
            content="1h7rffeEA3YwY6ATcAma8uEoJgz7QZeuT6XSJ8lAu4c"
          />
          <link rel="icon" href="logo.png" sizes="any" className="bg-white" />
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
