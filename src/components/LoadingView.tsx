import Destination from "@/assets/svgs/icon-dual-pin.svg";
import Info from "@/assets/svgs/icon-info.svg";

export const LoadingView = () => {
  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center px-4 py-8 md:py-12">
      <div className="bg-white rounded-2xl px-2 w-full max-w-screen-md pt-25 pb-4 flex flex-col items-center">
        {/* Título de carga */}
        <h1 className="font-montserrat font-bold text-xl text-center mb-20">
          Cargando
          <br />
          información del viaje...
        </h1>

        {/* Animación de carga infinita */}
        <div className="w-full max-w-md mb-15 px-4 flex items-center justify-center ">
          <div className="flex justify-center mt-4 flex-col w-50 items-center">
            <Destination className="w-30 h-30 text-black mb-4" />
            <div className="w-full h-[18px] bg-black rounded-full overflow-hidden p-1">
              <div className="h-full bg-wari-yellow animate-progress rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Texto explicativo */}
        <div className="rounded-3xl border-2 border-wari-yellow pt-10 pb-8 px-10 flex flex-col items-center w-full">
          <Info className="w-6 h-6 mb-6" />
          <p className="font-montserrat font-normal text-sm text-center leading-4">
            Estamos obteniendo todos los
            <br />
            detalles para ti.
          </p>
          <p className="font-montserrat font-normal text-sm leading-4 mt-4">
            Esto puede tardar unos minutos.
          </p>
        </div>
      </div>
    </div>
  );
};
