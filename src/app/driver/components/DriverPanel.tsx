import { Loader2 } from "lucide-react";
import { QRGeneratorView } from "./QRGeneratorView";
import { DeviceObject, Trip } from "@/app/types/types";
import clsx from "clsx";
import Info from "@/assets/svgs/icon-info.svg";
import Eye from "@/assets/svgs/icon-show.svg";
import Logout from "@/assets/svgs/icon-logout.svg";

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
    <div className="min-h-screen bg-wari-gray flex flex-col items-center justify-center px-4 py-8">
      <div
        className={clsx(
          "bg-white rounded-2xl px-1 w-full max-w-screen-md",
          isGeneratingQR ? "py-2" : "py-16"
        )}
      >
        <div className=" bg-white px-4 py-8  rounded-3xl flex flex-col items-center text-center">
          <h1 className="font-montserrat font-bold text-xl mb-6">
            Panel del Conductor
          </h1>
          <p className="font-montserrat font-normal text-base leading-4">
            {" "}
            {`${
              isGeneratingQR
                ? "Código QR para compartir la ubicación"
                : "Muestra el código QR para compartir la "
            }`}
          </p>
          <p
            className={clsx(
              "font-montserrat font-normal  text-base leading-4",
              isGeneratingQR ? "mb-4" : "mb-16"
            )}
          >
            {`${
              isGeneratingQR ? "de tu vehículo." : "ubicación de tu vehículo."
            }`}
          </p>

          {/* Detalles del vehículo */}
          {vehicleDetails && (
            <div
              className={clsx(
                "border-2 border-wari-yellow bg-white rounded-3xl p-6 w-full text-left",
                isGeneratingQR ? "mb-2" : "mb-16"
              )}
            >
              <h2 className="font-montserrat font-bold text-sm flex flex-row items-center mb-2">
                <div className="w-6 flex-shrink-0 flex mr-1">
                  <Info className="w-full h-full" />
                </div>
                Detalles del vehículo:
              </h2>
              <div className="space-y-0">
                <p className="font-montserrat font-bold text-sm">
                  Nombre:{" "}
                  <span className="font-montserrat font-normal text-sm">
                    {vehicleDetails.name}
                  </span>
                </p>
                <p className="font-montserrat font-bold text-sm">
                  Placa:{" "}
                  <span className="font-montserrat font-normal text-sm">
                    {vehicleDetails.plate_number}
                  </span>
                </p>
                <p className="font-montserrat font-bold text-sm">
                  Modelo:{" "}
                  <span className="font-montserrat font-normal text-sm">
                    {vehicleDetails.model || "No especificado"}
                  </span>
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
            <button
              className="w-full md:w-80 bg-wari-yellow hover:bg-amber-400 text-black text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 md:mt-12"
              onClick={onGenerateQR}
              disabled={isLoading}
            >
              <div className="w-6 flex-shrink-0 flex mr-1">
                <Eye className="w-full h-full" />
              </div>
              Mostrar código QR
            </button>
          )}

          <button
            className={clsx(
              "flex items-center justify-center gap-2 mt-4",
              "w-full md:w-80 py-3 px-8 mt-0 md:mt-12 rounded-4xl text-[15px] font-montserrat font-bold",
              isGeneratingQR
                ? "bg-[#2a2416] hover:bg-[#3a3426] text-white"
                : "bg-wari-red hover:bg-red-400 text-white",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            onClick={onLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <Logout className="w-6 h-6" />
                Cerrar sesión
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
