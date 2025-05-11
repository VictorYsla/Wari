"use client";

import { useDriver } from "./hooks/useDriver";
import { AuthForm } from "./components/AuthForm";
import { DriverPanel } from "./components/DriverPanel";
import { LoadingView } from "@/components/LoadingView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

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
      <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-amber-300 border-2 bg-[#fffbeb] p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-[#2a2416]">
              Acceso de Conductor
            </h1>
            <p className="text-gray-700 mb-6">
              Ingresa la placa del vehículo y el código de acceso
            </p>
            {/* Placa del vehículo */}
            <div className="mb-6">
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
            </div>
          </Card>
        </div>
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
