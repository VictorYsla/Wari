import { Suspense } from 'react'
import PassengerPageClient from './PassengerPageClient'

export default function PassengerPage() {
  return(    
    <Suspense fallback={<div>Cargando pasajero...</div>}>
      <PassengerPageClient />
    </Suspense>
    )
}
