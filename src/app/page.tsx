import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Wari</h1>
        <p className="text-xl text-muted-foreground">Seguimiento en tiempo real de vehículos de transporte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Conductor</CardTitle>
            <CardDescription>Genera un código QR para compartir la ubicación de tu vehículo</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/driver">
              <Button className="w-full">Acceder como conductor</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pasajero</CardTitle>
            <CardDescription>Escanea un código QR para seguir la ubicación de un vehículo</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/passenger">
              <Button className="w-full" variant="outline">
                Acceder como pasajero
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
