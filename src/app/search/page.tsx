"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Logo from "@/assets/svgs/logo-01.svg";
import SearchIcon from "@/assets/svgs/icon-magni-glass.svg";
import Link from "next/link";
import {
  Loader,
  User,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Check,
  Copy,
} from "lucide-react";
import { Driver, Sponsor, VehicleStatus } from "./types";
import { convertUtcToDeviceTime } from "@/helpers/time";
import moment from "moment";
import { InfiniteCarousel } from "@/components/InfiniteSponsorsCarousel";

function getVehicleStatus(driver: Driver): VehicleStatus {
  if (driver.is_active && !driver.is_expired)
    return {
      status: "connected",
      label: "Activo",
      color: "bg-wari-green",
    };
  if (driver.is_active && driver.is_expired)
    return {
      status: "disconnected",
      label: "Expirado",
      color: "bg-wari-yellow text-black",
    };
  return {
    status: "inactive",
    label: "Inactivo",
    color: "bg-wari-red",
  };
}

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentSponsor, setCurrentSponsor] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Extrae la función para poder llamarla manualmente
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/get-all-users-ordered", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setDrivers(data.users);
      } else {
        setDrivers([]);
      }
    } catch {
      setDrivers([]);
    }
    setIsLoading(false);
  };

  const fetchSponsors = async () => {
    try {
      const res = await fetch("/api/get-sponsors", { method: "POST" });
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch {
      setSponsors([]);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1200);
  };

  useEffect(() => {
    fetchDrivers();
    fetchSponsors();

    const handleRefresh = () => setRefresh((r) => r + 1);
    window.addEventListener("click", handleRefresh);
    window.addEventListener("touchstart", handleRefresh);
    return () => {
      window.removeEventListener("click", handleRefresh);
      window.removeEventListener("touchstart", handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (sponsors.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sponsors.length]);

  function getAvailability(dt_tracker: string) {
    const now = moment(); // local time
    const lastUpdate = moment.utc(dt_tracker).local(); // convierte UTC a local
    const diff = now.diff(lastUpdate, "minutes");

    if (diff <= 5) {
      return { label: "Disponible", color: "bg-green-500" };
    }
    if (diff > 5 && diff <= 10) {
      return {
        label: "Probablemente disponible",
        color: "bg-yellow-400 text-black",
      };
    }
    return { label: "Probablemente no disponible", color: "bg-red-500" };
  }

  const filteredDrivers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(
      (d) =>
        (d.driverNumber?.toLowerCase?.().includes(q) ?? false) ||
        (d.plate?.toLowerCase?.().includes(q) ?? false) ||
        (d.vehicleType?.toLowerCase?.().includes(q) ?? false)
    );
  }, [searchQuery, drivers, refresh]);

  const sponsorFrames = sponsors.map((s) => ({
    key: s.id,
    website: s.website,
    mobile: {
      image: {
        src: s.logoUrl,
        width: 160,
        height: 96,
        alt: s.name,
      },
    },
    desktop: {
      image: {
        src: s.logoUrl,
        width: 160,
        height: 96,
        alt: s.name,
      },
    },
  }));

  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center justify-start p-4 md:py-12">
      <div className="bg-white rounded-2xl px-4 py-8 w-full max-w-screen-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 mb-6 relative">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="font-montserrat font-bold text-xl md:text-2xl mb-2">
            Lista de Conductores
          </h1>
          <p className="font-montserrat text-sm leading-5 text-center mb-6">
            Monitorea el estado y actividad de todos los conductores Wari
          </p>
          <button
            onClick={() => {
              fetchDrivers();
              fetchSponsors();
            }}
            className="flex items-center gap-2 bg-wari-blue hover:bg-[#189db9] text-white px-4 py-2 rounded-full font-montserrat font-semibold transition-colors mt-2"
            disabled={isLoading}
            aria-label="Refrescar listado"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Actualizando..." : "Refrescar listado"}
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full shadow-md bg-wari-yellow rounded-3xl py-4 px-2 mb-6">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col items-center"
          >
            <div className="w-full flex items-center bg-white rounded-4xl overflow-hidden mb-2 border border-gray-200">
              <input
                type="text"
                placeholder="Buscar por placa o número de celular"
                className="flex-1 py-2 px-3 text-sm md:py-3 md:px-4 outline-none font-montserrat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-black hover:bg-[#3a3426] text-white p-2 md:p-3 m-1 rounded-full"
                aria-label="Buscar"
              >
                <SearchIcon className="w-5 h-5 fill-white" />
              </button>
            </div>
          </form>
        </div>

        {/* Lista de conductores */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-wari-blue" />
            <span className="ml-2 font-montserrat text-gray-600">
              Cargando conductores...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="font-montserrat text-gray-600">
                  {searchQuery.trim()
                    ? "No se encontraron conductores que coincidan con tu búsqueda"
                    : "No hay conductores registrados"}
                </p>
              </div>
            ) : (
              filteredDrivers.map((driver) => {
                const vehicleStatus = getVehicleStatus(driver);
                const availability = getAvailability(
                  driver?.hawkData?.dt_last_move
                );

                const driverName =
                  driver.hawkData?.custom_fields?.find(
                    (f) => f.name === "complete_name"
                  )?.value || driver.hawkData?.name;

                return (
                  <div
                    key={driver.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4 mb-4 md:mb-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-wari-blue rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-montserrat font-bold text-lg text-gray-900">
                              {driverName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${vehicleStatus.color}`}
                            >
                              {vehicleStatus.status === "connected" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {vehicleStatus.status === "disconnected" && (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {vehicleStatus.status === "inactive" && (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {vehicleStatus.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Car className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="font-medium">Placa:</span>
                              <span className="ml-1 font-montserrat">
                                {driver.plate}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(driver.plate, `plate-${driver.id}`)
                                }
                                className={`ml-2 p-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-wari-blue hover:text-white transition-colors`}
                                title="Copiar placa"
                                type="button"
                              >
                                {copied[`plate-${driver.id}`] ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Tipo:</span>
                              <span className="ml-1 font-montserrat">
                                {driver.hawkData?.model}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Viajes:</span>
                              <span className="ml-1 font-montserrat font-bold text-wari-blue">
                                {driver.completedTrips}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Celular:</span>
                              <span className="ml-1 font-montserrat">
                                {driver.driverNumber}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    driver.driverNumber,
                                    `phone-${driver.id}`
                                  )
                                }
                                className={`ml-2 p-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-wari-blue hover:text-white transition-colors`}
                                title="Copiar celular"
                                type="button"
                              >
                                {copied[`phone-${driver.id}`] ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <span>Última conexión:</span>
                          {/* Círculo de color según disponibilidad */}
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${availability.color}`}
                            title={availability.label}
                          ></span>
                          <span className="font-montserrat">
                            {driver.hawkData?.dt_last_move
                              ? convertUtcToDeviceTime(
                                  driver.hawkData?.dt_last_move
                                )
                              : "-"}
                          </span>
                        </span>
                        {/* <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${availability.color}`}
                        >
                          {availability.label}
                        </span> */}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <button className="bg-wari-blue hover:bg-[#189db9] text-white py-3 px-6 rounded-4xl text-[15px] font-montserrat font-bold">
              Ir al inicio
            </button>
          </Link>
        </div>
        <div className="mt-10 mb-2 flex flex-col items-center">
          <span className="text-sm md:text-base text-gray-400 mb-3 font-semibold">
            Auspiciado por
          </span>
          <InfiniteCarousel
            frames={sponsorFrames}
            slideDuration={2500}
            autoplay={true}
            controls={true}
            ariaLabel="Carrusel de sponsors"
          />
        </div>
      </div>
    </div>
  );
}
