import { CircleArrowLeft, Flag, Frown, MapPin } from "lucide-react";
import { Destination } from "../types";
import { Trip } from "@/app/types/types";
import clsx from "clsx";

interface TripEndedViewProps {
  destination?: Destination | null;
  tripData: Trip | null;
  onGoBack: () => void;
}
export const TripEndedView = ({
  destination,
  tripData,
  onGoBack,
}: TripEndedViewProps) => {
  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center px-4 py-8 md:py-12">
      <div className="bg-white rounded-3xl w-full max-w-screen-md  py-22 px-6 flex flex-col items-center">
        <div
          className={`px-4 pt-25 pb-6 shadow-sm w-full rounded-3xl flex flex-col justify-center items-center border-2 ${
            tripData?.is_completed ? "border-wari-green" : "border-wari-black"
          }`}
        >
          {" "}
          <div
            className={`px-0 pt-0 w-full flex flex-col items-center text-center ${
              tripData?.is_completed ? "mb-10" : "mb-20"
            }`}
          >
            {!tripData?.is_completed ? (
              <Frown className="h-20 w-20 stroke-[2.5] text-wari-black" />
            ) : (
              <Flag className="h-20 w-20 stroke-[2.5] text-wari-green" />
            )}
            <h2
              className={clsx(
                "font-montserrat font-bold text-xl mt-4",
                tripData?.is_completed ? "text-wari-green" : "text-wari-black"
              )}
            >
              {!tripData?.is_completed ? "Viaje Cancelado" : "Viaje Finalizado"}
            </h2>
            <p className="font-montserrat font-normal text-sm  mt-5">
              {!tripData?.is_completed
                ? tripData?.is_canceled_by_passenger
                  ? "El pasajero ha cancelado el viaje."
                  : "El conductor ha cancelado el viaje."
                : "El vehículo ha llegado a su destino."}
            </p>
          </div>
          {tripData?.is_completed && (
            <div className="bg-wari-gray px-4 py-6 rounded-3xl flex mb-10">
              <MapPin className="w-10 h-10 stroke-[2.5] text-wari-black pb-4" />
              <p className="font-montserrat font-bold text-sm leading-4">
                Destino:{" "}
                <span className="font-montserrat font-normal text-sm leading-4">
                  {destination?.address}
                </span>
              </p>
            </div>
          )}
          <div className="space-y-6 px-0 text-center w-full flex flex-col items-center">
            <p
              className={`font-montserrat font-bold text-sm  ${
                !tripData?.is_completed
                  ? "text-wari-black bg-wari-gray px-4 py-6 w-full rounded-3xl mb-20"
                  : "text-wari-green mb-10"
              }`}
            >
              {!tripData?.is_completed ? (
                <>
                  El seguimiento del vehículo
                  <br />
                  se ha detenido automáticamente.
                </>
              ) : (
                `El seguimiento ha finalizado.`
              )}
            </p>

            <button
              className="w-full md:w-80 bg-wari-black hover:bg-black-300 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={onGoBack}
            >
              <CircleArrowLeft className="h-6 w-6 stroke-[2.5] text-white" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
