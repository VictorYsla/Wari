import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { QRGeneratorView } from "./QRGeneratorView";
import { DeviceObject, Trip } from "@/app/types/types";
import clsx from "clsx";

interface DriverPanelProps {
  vehicleDetails: DeviceObject | null;
  activeTrip: Trip | null;
  isGeneratingQR: boolean;
  isLoading: boolean;
  isConnected: boolean;
  isCancelLoading: boolean;
  onGenerateQR: () => void;
  onCancelTrip: () => void;
  onHideQR: () => void;
  onLogout: () => void;
}

export const DriverPanel = ({
  vehicleDetails,
  activeTrip,
  isGeneratingQR,
  isLoading,
  isConnected,
  isCancelLoading,
  onGenerateQR,
  onCancelTrip,
  onHideQR,
  onLogout,
}: DriverPanelProps) => {
  return (
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card
          className={clsx(
            isGeneratingQR
              ? "bg-transparent p-0 shadow-none border-none"
              : "bg-[#fffbeb] p-6 shadow-sm border-amber-300 border-2"
          )}
        >
          <h1 className="text-2xl font-bold mb-2 text-[#2a2416]">
            Panel del Conductor
          </h1>
          <p className="text-gray-700 mb-6">
            Código QR para compartir la ubicación de tu vehículo
          </p>

          {/* Detalles del vehículo */}
          {vehicleDetails && (
            <div className="border border-amber-300 bg-white rounded-md p-4 mb-6">
              <h2 className="font-bold text-lg mb-3">Detalles del vehículo</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-bold">Nombre:</span>{" "}
                  {vehicleDetails.name}
                </p>
                <p>
                  <span className="font-bold">Placa:</span>{" "}
                  {vehicleDetails.plate_number}
                </p>
                <p>
                  <span className="font-bold">Modelo:</span>{" "}
                  {vehicleDetails.model || "No especificado"}
                </p>
              </div>
            </div>
          )}
          {isGeneratingQR ? (
            <QRGeneratorView
              activeTrip={activeTrip}
              isConnected={isConnected}
              isCancelLoading={isCancelLoading}
              onCancelTrip={onCancelTrip}
              onHideQR={onHideQR}
            />
          ) : (
            <Button
              className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6 flex items-center justify-center gap-2"
              onClick={onGenerateQR}
              disabled={isLoading}
            >
              Mostrar código QR
            </Button>
          )}

          <Button
            variant="destructive"
            className={`w-full text-white flex items-center justify-center py-6 gap-2 mt-3 ${
              isGeneratingQR
                ? "bg-[#2a2416] hover:bg-[#3a3426]" // negro
                : "bg-orange-500 hover:bg-orange-600" // naranja
            }`}
            onClick={onLogout}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
};
