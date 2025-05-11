"use client";

import { useDriver } from "./hooks/useDriver";
import { AuthForm } from "./components/AuthForm";
import { DriverPanel } from "./components/DriverPanel";
import { LoadingView } from "@/components/LoadingView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DriverPage() {
  const {
    authState,
    tripState,
    loading,
    isConnected,
    setAuthState,
    setTripState,
    handleLogin,
    handleLogout,
    cancelTrip,
    generateQR,
  } = useDriver();

  if (loading.recharge) {
    return <LoadingView />;
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso de Conductor</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm
              plateNumber={authState.plateNumber}
              imeiLastDigits={authState.imeiLastDigits}
              isLoading={loading.auth}
              onPlateChange={(value) =>
                setAuthState({ ...authState, plateNumber: value })
              }
              onImeiChange={(value) =>
                setAuthState({ ...authState, imeiLastDigits: value })
              }
              onSubmit={handleLogin}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <DriverPanel
        vehicleDetails={authState.vehicleDetails}
        activeTrip={tripState.activeTrip}
        isGeneratingQR={tripState.isGeneratingQR}
        isLoading={loading.auth}
        isConnected={isConnected}
        isCancelLoading={loading.cancel}
        onGenerateQR={() =>
          setTripState({ ...tripState, isGeneratingQR: true })
        }
        onCancelTrip={cancelTrip}
        onHideQR={() => setTripState({ ...tripState, isGeneratingQR: false })}
        onLogout={handleLogout}
      />
    </div>
  );
}
