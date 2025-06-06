"use client";

import { useDriver } from "./hooks/useDriver";
import { AuthForm } from "./components/AuthForm";
import { DriverPanel } from "./components/DriverPanel";
import { LoadingView } from "@/components/LoadingView";
import { ArrowLeftIcon } from "lucide-react";
import { useUserStore } from "@/hooks/userStore";

export default function DriverPage() {
  const { isLoaded, isSignedIn } = useUserStore();

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
  } = useDriver();

  const goBack = () => {
    window.location.href = "/";
  };

  if (loading.auth || loading.cancel || loading.recharge || !isLoaded) {
    return <LoadingView />;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-wari-gray flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl px-4 py-16 w-full max-w-screen-md">
          <button
            onClick={goBack} // Asegúrate de definir esta función, por ejemplo: const goBack = () => router.back()
            className="absolute top-6 left-4 flex items-center gap-2 text-wari-black hover:text-black-500 font-montserrat font-medium mt-6"
          >
            {/* Puedes usar un ícono aquí si tienes uno */}
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </button>
          <div className="border-wari-yellow border-2 bg-white px-4 py-8 shadow-sm rounded-3xl flex flex-col items-center text-center">
            <h1 className="font-montserrat font-bold text-xl mb-6">
              Acceso de Conductor
            </h1>
            <p className="font-montserrat font-normal text-sm leading-4">
              Ingresa la placa del vehículo y el
            </p>
            <p className="font-montserrat font-normal text-sm leading-4 mb-16">
              código de acceso.
            </p>

            {/* <!-- Placa del vehículo --> */}
            <AuthForm
              plateNumber={authState.plateNumber}
              password={authState.password}
              isLoading={loading.auth}
              onPlateChange={(value) => setAuthState({ plateNumber: value })}
              onPasswordChange={(value) => setAuthState({ password: value })}
              onSubmit={handleLogin}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DriverPanel
      vehicleDetails={authState.vehicleDetails}
      activeTrip={tripState.activeTrip}
      isGeneratingQR={tripState.isGeneratingQR}
      isLoading={loading.auth}
      isConnected={isConnected}
      isCancelLoading={loading.cancel}
      onGenerateQR={() => setTripState({ isGeneratingQR: true })}
      onCancelTrip={cancelTrip}
      onHideQR={() => setTripState({ isGeneratingQR: false })}
      onLogout={handleLogout}
    />
  );
}
