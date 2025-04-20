import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/toaster"
import { googleMapsApiKey } from "./api/helpers"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Wari - Seguimiento de Vehículos",
  description: "Aplicación de seguimiento en tiempo real de vehículos de transporte",
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
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
  )
}
