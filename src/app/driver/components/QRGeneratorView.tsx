import { QRCodeGenerator } from "@/components/qr-code-generator";
import { Loader2, XCircle } from "lucide-react";
import {
  convertTimestamptzToUserTimeZone,
  convertUtcToDeviceDate,
} from "@/helpers/time";
import { Trip } from "@/app/types/types";
import CloseEye from "@/assets/svgs/icon-dont-show.svg";
import QR from "@/assets/svgs/icon-qr.svg";
import { useUserStore } from "@/hooks/userStore";
import moment from "moment-timezone";

interface QRGeneratorViewProps {
  activeTrip: Trip | null;
  isConnected: boolean;
  isCancelLoading: boolean;
  onCancelTrip: () => void;
  onHideQR: () => void;
}

export const QRGeneratorView = ({
  activeTrip,
  isConnected,
  isCancelLoading,
  onCancelTrip,
  onHideQR,
}: QRGeneratorViewProps) => {
  const { user } = useUserStore();

  const isExpired = user?.is_expired;
  const expiredDate = user?.expired_date || "";

  return (
    <div className="w-full">
      {!isExpired ? (
        <div className="bg-wari-gray rounded-3xl pt-6 pb-4 px-6 w-full">
          {activeTrip && activeTrip.is_active ? (
            <div className="text-left mb-8">
              <h2 className="font-montserrat font-bold text-sm flex items-center gap-2 mb-2">
                <QR className="w-5 h-5" />
                Estado del QR
              </h2>
              {activeTrip.destination ? (
                <div className="mb-6">
                  <div className="space-y-1">
                    <p className="font-montserrat font-bold text-sm">
                      Destino:{" "}
                      <span className="font-montserrat font-normal text-sm">
                        {JSON.parse(activeTrip.destination).address}
                      </span>
                    </p>
                    <p className="font-montserrat font-bold text-sm">
                      Iniciado:{" "}
                      <span className="font-montserrat font-normal text-sm">
                        {convertUtcToDeviceDate(activeTrip.start_date)}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-montserrat font-normal text-sm leading-4">
                    QR activo esperando que un pasajero
                  </p>
                  <p className="font-montserrat font-normal text-sm leading-4">
                    defina el destino.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-left mb-8">
              <h2 className="font-montserrat font-bold text-sm flex items-center gap-2 mb-2">
                <QR className="w-5 h-5" />
                Estado del QR
              </h2>
              <p className="text-sm font-montserrat">
                QR no disponible. Actualizando...
              </p>
            </div>
          )}

          <QRCodeGenerator
            vehicleKey={activeTrip?.id || ""}
            isActive={activeTrip?.is_active || false}
            destination={activeTrip?.destination}
          />

          <p className="font-montserrat font-normal text-xs leading-4">
            Comparte este código QR con los
          </p>
          <p className="font-montserrat font-normal text-xs leading-4">
            pasajeros para que puedan seguir tu
          </p>
          <p className="font-montserrat font-normal text-xs leading-4">
            ubicación. El código QR expirará
          </p>
          <p className="font-montserrat font-normal text-xs leading-4">
            automáticamente al llegar al destino.
          </p>
        </div>
      ) : (
        <div className="bg-wari-gray rounded-3xl pt-6 pb-4 px-6 w-full">
          <div className="text-left mb-8">
            <h2 className="font-montserrat font-bold text-sm flex items-center gap-2 mb-2">
              <QR className="w-5 h-5" />
              Estado del QR
            </h2>
            <p className="text-base font-montserrat font-bold text-wari-red">
              {`Tienes un pago pendiente desde ${convertTimestamptzToUserTimeZone(
                expiredDate,
                user.time_zone
              )}`}
            </p>
          </div>
        </div>
      )}

      {/* Contenedor centrado de botones */}
      <div className="flex flex-col items-center md:flex-row md:justify-center md:gap-6">
        <button
          className="w-full md:w-80 bg-wari-yellow hover:bg-amber-400 text-black text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
          onClick={onHideQR}
        >
          <>
            <CloseEye className="w-6 h-6" />
            Ocultar código QR
          </>
        </button>

        <button
          className="w-full md:w-80 bg-wari-red hover:bg-red-400 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
          onClick={onCancelTrip}
          disabled={isCancelLoading || !isConnected || !activeTrip?.id}
        >
          {isCancelLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelando...
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6" />
              Cancelar viaje
            </>
          )}
        </button>
      </div>
    </div>
  );
};
