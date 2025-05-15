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
  title: "Wari - Seguimiento de Vehículos",
  description:
    "Aplicación de seguimiento en tiempo real de vehículos de transporte",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="es" className={montserrat.variable} suppressHydrationWarning>
        <head>
          <link rel="icon" href="logo.jpeg" sizes="any" />
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
