import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, ShipWheelIcon as SteeringWheel } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="flex flex-col items-center mb-8 md:mb-12">
        <div className="w-24 h-24 md:w-32 md:h-32 mb-4 relative">
          <Image
            src="/warilogo.png"
            alt="Wari Logo"
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
          wari
        </h1>
        <p className="text-center text-gray-800 max-w-md mx-auto text-sm md:text-base lg:text-lg">
          Seguimiento en tiempo real de vehículo de transporte
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Tarjeta Pasajero */}
        <Card className="border-none shadow-md bg-amber-300">
          <CardHeader className="flex flex-col items-center pb-2">
            <User className="w-12 h-12 text-black" />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Pasajero
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-black text-sm md:text-base mb-6">
              Escanea un código QR para seguir la ubicación de un vehículo
            </CardDescription>
            <Link href="/passenger" passHref>
              <Button className="w-full bg-black hover:bg-[#3a3426] text-white py-6 rounded-md text-base md:text-lg">
                Acceder como pasajero
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Tarjeta Conductor */}
        <Card className="border-none shadow-md bg-amber-300">
          <CardHeader className="flex flex-col items-center pb-2">
            <SteeringWheel className="w-12 h-12 text-black" />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-black text-sm md:text-base mb-6">
              Genera un código QR para compartir la ubicación de tu vehículo
            </CardDescription>
            <Link href="/driver" passHref>
              <Button className="w-full bg-black hover:bg-[#3a3426] text-white py-6 rounded-md text-base md:text-lg">
                Acceder como conductor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
