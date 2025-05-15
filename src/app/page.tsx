import Logo from "@/assets/svgs/logo-01.svg";
import Driver from "@/assets/svgs/icon-driver.svg";
import Passenger from "@/assets/svgs/icon-passenger.svg";

export default function Home() {
  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center justify-center p-4 md:py-12">
      <div className="bg-white rounded-2xl px-4 py-8 w-full max-w-screen-md">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <div className="w-24 h-24 md:w-32 md:h-32 mb-10 relative">
            <Logo className="w-full h-full" />
          </div>
          <p className="font-montserrat-regular text-sm">Bienvenido a Wari,</p>
          <p className="font-montserrat-regular text-sm">
            <span className="font-montserrat-bold">
              seguimiento en tiempo real{" "}
            </span>
            de tu
          </p>
          <p className="font-montserrat-regular text-sm">
            vehículo de transporte.
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-center items-stretch gap-6">
          <div className="flex-1 border-none shadow-md bg-wari-yellow rounded-3xl py-6 px-6">
            <div className="flex flex-col items-center pb-2">
              <div className="w-14 h-14 md:w-24 md:h-24 lg:w-32 lg:h-32 relative">
                <Passenger className="w-full h-full" />
              </div>
              <h2 className="font-montserrat-bold text-[17px] ">Pasajero</h2>
            </div>
            <div className="text-center">
              <p className="font-montserrat-regular text-sm">
                Escanea un código QR para seguir la
              </p>
              <p className="font-montserrat-regular text-sm">
                ubicación del vehículo
              </p>
              <a href="/passenger" className="block mt-4">
                <button className="w-full bg-black hover:bg-[#3a3426] text-white py-4 rounded-4xl text-[15px] font-montserrat-bold md:text-lg">
                  Acceder como pasajero
                </button>
              </a>
            </div>
          </div>

          <div className="flex-1 border-none shadow-md bg-wari-yellow rounded-3xl py-6 px-6">
            <div className="flex flex-col items-center pb-2">
              <div className="w-14 h-14 md:w-24 md:h-24 lg:w-32 lg:h-32 relative">
                <Driver className="w-full h-full" />
              </div>
              <h2 className="font-montserrat-bold text-[17px] ">Conductor</h2>
            </div>
            <div className="text-center">
              <p className="font-montserrat-regular text-sm">
                Genera un código QR para compartir
              </p>
              <p className="font-montserrat-regular text-sm">
                la ubicación de tu vehículo
              </p>
              <a href="/driver" className="block mt-4">
                <button className="w-full bg-black hover:bg-[#3a3426] text-white py-4 rounded-4xl text-[15px] font-montserrat-bold md:text-lg">
                  Acceder como conductor
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
