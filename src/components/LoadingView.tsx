import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Luggage } from "lucide-react";

export const LoadingView = () => {
  return (
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Título de carga */}
        <h1 className="text-3xl font-bold text-center mb-10 text-[#2a2416]">
          Cargando
          <br />
          información
          <br />
          del viaje...
        </h1>

        {/* Animación de carga infinita */}
        <div className="relative mb-10">
          <div className="w-32 h-32 rounded-full border-8 border-amber-300/30"></div>
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-amber-300 border-t-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-32 h-32 flex items-center justify-center">
            <Luggage className="w-12 h-12 text-black" />
          </div>
        </div>

        {/* Texto explicativo */}
        <div className="text-center max-w-xs">
          <p className="text-gray-700 mb-2">
            Estamos obteniendo todos los detalles para&nbsp;ti.
          </p>
          <p className="text-gray-700">Esto puede tardar unos minutos.</p>
        </div>
      </div>
    </div>
  );
};
