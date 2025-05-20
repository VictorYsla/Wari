import { Loader2 } from "lucide-react";
import Vehicle from "@/assets/svgs/icon-vehicle.svg";
import Key from "@/assets/svgs/icon-key.svg";
import Check from "@/assets/svgs/icon-button.svg";

interface AuthFormProps {
  plateNumber: string;
  password: string;
  isLoading: boolean;
  onPlateChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AuthForm = ({
  plateNumber,
  password,
  isLoading,
  onPlateChange,
  onPasswordChange,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Bloque Placa */}
        <div className="flex flex-row w-full md:w-1/2 gap-3 items-end mb-8 md:mb-0">
          <div className="w-10 flex-shrink-0 flex">
            <Vehicle className="w-full h-full" />
          </div>
          <div className="flex flex-col flex-1 w-full">
            <label
              htmlFor="plateNumber"
              className="font-montserrat font-bold text-[15px] text-left"
            >
              Placa del vehículo
            </label>
            <input
              id="plateNumber"
              type="text"
              value={plateNumber}
              onChange={(e) => onPlateChange(e.target.value)}
              placeholder="Ej: ABC-123"
              required
              className="bg-white border-2 text-sm border-wari-yellow h-12 font-montserrat font-normal w-full rounded-4xl placeholder-black p-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Bloque Password */}
        <div className="flex flex-row w-full md:w-1/2 gap-3 items-end">
          <div className="w-10 flex-shrink-0 flex">
            <Key className="w-full h-full" />
          </div>
          <div className="flex flex-col flex-1 w-full">
            <label
              htmlFor="password"
              className="font-montserrat font-bold text-[15px] text-left"
            >
              Código de acceso
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Ej: 12345678"
              minLength={8}
              pattern=".{8,}"
              required
              className="bg-white border-2 text-sm border-wari-yellow h-12 w-full font-montserrat font-normal rounded-4xl placeholder-black p-2 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div id="clerk-captcha"></div>
      <div className="mt-16 flex justify-center">
        <button
          type="submit"
          className="w-full md:w-auto bg-wari-yellow hover:bg-amber-400 text-black text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-8 md:mt-12"
          disabled={isLoading || !password || !plateNumber}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Check className="h-6 w-6" />
              Verificar y acceder
            </>
          )}
        </button>
      </div>
    </form>
  );
};
