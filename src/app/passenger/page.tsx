import { Suspense } from 'react'
import PassengerPageClient from './PassengerPageClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export default function PassengerPage() {
  return(    
    <Suspense fallback={      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Cargando información del viaje...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
          <CardDescription className="text-center text-gray-500">
            Estamos obteniendo todos los detalles para ti. Esto puede tardar unos momentos.
          </CardDescription>
        </CardContent>
      </Card>
    </div>}>
      <PassengerPageClient />
    </Suspense>
    )
}
