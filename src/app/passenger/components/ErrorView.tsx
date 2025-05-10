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

interface ErrorViewProps {
  tripStatus: {
    message: string;
    description?: string;
  };
  onGoBack: () => void;
}

export const ErrorView = ({ tripStatus, onGoBack }: ErrorViewProps) => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tripStatus.message}</CardTitle>
          <CardDescription>
            Ocurrió un problema al procesar tu solicitud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {tripStatus.description}
            </AlertDescription>
          </Alert>
          <Button className="w-full" onClick={onGoBack}>
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
