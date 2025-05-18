import { CircleArrowLeft, CircleX, RotateCw } from "lucide-react";
import { useRouter } from "next/router";

interface ErrorViewProps {
  tripStatus: {
    message: string;
    description?: string;
  };
  onGoBack: () => void;
}

export const ErrorView = ({ tripStatus, onGoBack }: ErrorViewProps) => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center px-4 py-8 md:py-12">
      <div className="bg-white rounded-3xl w-full max-w-screen-md  py-16 px-6 flex flex-col items-center">
        <div className="border-wari-red border-2 px-6 pt-25 pb-6 shadow-sm w-full rounded-3xl flex flex-col justify-center items-center">
          <div className="px-0 pt-0 w-full flex flex-col items-center text-center">
            <CircleX className="h-20 w-20 stroke-[2.5] text-wari-red" />
            <h2 className="font-montserrat font-bold text-xl text-wari-red mt-4">
              {tripStatus.message}
            </h2>
            <p className="font-montserrat font-bold text-sm my-10">
              Ocurrió un problema al procesar
              <br />
              tu solicitud
            </p>
          </div>

          <div className="space-y-6 px-0 pt-4 w-full flex flex-col items-center">
            <div className="space-y-3 w-full flex flex-col items-center">
              <button
                className="w-full md:w-80 bg-wari-black hover:bg-black-300 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={onGoBack}
              >
                <CircleArrowLeft className="h-6 w-6 stroke-[2.5] text-white" />
                Volver al inicio
              </button>

              <button
                className="w-full md:w-80 bg-wari-red hover:bg-red-400 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => router.reload()}
              >
                <RotateCw className="h-6 w-6 stroke-[2.5] text-white" />
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
