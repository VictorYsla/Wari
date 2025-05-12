import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-amber-300 border-2 bg-[#fffbeb] p-6 shadow-sm">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold text-[#2a2416] mb-2">
              {tripStatus.message}
            </CardTitle>
            <p className="text-gray-700">
              Ocurrió un problema al procesar tu solicitud
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-0 pt-4">
            <Alert className="bg-red-100 border-red-300 text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <AlertTitle className="text-red-800 font-bold mb-1">
                Error
              </AlertTitle>
              <AlertDescription className="text-red-700">
                {tripStatus.description}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6"
                onClick={onGoBack}
              >
                Volver al inicio
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-300 py-6 hover:bg-gray-100"
                onClick={() => router.back()}
              >
                Intentar nuevamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
