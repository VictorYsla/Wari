import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-row items-stretch gap-3">
          {/* Imagen que se estira */}
          <div className="w-10 flex-shrink-0 flex items-center">
            <Image
              src={"/car-login.png"}
              alt="Icono de vehículo"
              width={40}
              height={40}
              className="object-contain h-full"
            />
          </div>

          {/* Label + Input */}
          <div className="flex flex-col flex-1">
            <label
              htmlFor="plateNumber"
              className="font-medium text-[#2a2416] mb-1"
            >
              Placa del vehículo
            </label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => onPlateChange(e.target.value)}
              placeholder="Ej: ABC-123"
              required
              className="bg-white border-amber-300 h-12 text-base w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-stretch gap-3">
          {/* Imagen que se estira */}
          <div className="w-10 flex-shrink-0 flex items-center">
            <Image
              src={"/key-login.png"}
              alt="Icono de vehículo"
              width={40}
              height={40}
              className="object-contain h-full"
            />
          </div>

          {/* Label + Input */}
          <div className="flex flex-col flex-1">
            <label
              htmlFor="plateNumber"
              className="flex items-center gap-3 font-medium text-[#2a2416] mb-2"
            >
              Código de acceso
            </label>
            <Input
              id="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Ej: 12345678"
              minLength={8}
              pattern=".{8,}"
              required
              className="bg-white border-amber-300 h-12 text-base w-full"
            />
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6 flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verificar y acceder
          </>
        )}
      </Button>
    </form>
  );
};
