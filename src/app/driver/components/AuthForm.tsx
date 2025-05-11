import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";

interface AuthFormProps {
  plateNumber: string;
  imeiLastDigits: string;
  isLoading: boolean;
  onPlateChange: (value: string) => void;
  onImeiChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AuthForm = ({
  plateNumber,
  imeiLastDigits,
  isLoading,
  onPlateChange,
  onImeiChange,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plateNumber">Placa del vehículo</Label>
        <Input
          id="plateNumber"
          value={plateNumber}
          onChange={(e) => onPlateChange(e.target.value)}
          placeholder="Ej: ABC-123"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imeiLastDigits">Código de acceso</Label>
        <Input
          id="imeiLastDigits"
          value={imeiLastDigits}
          onChange={(e) => onImeiChange(e.target.value)}
          placeholder="Ej: 1234"
          maxLength={4}
          pattern="\d{4}"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
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
