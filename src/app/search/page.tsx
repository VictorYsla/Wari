"use client";

import React, { useState } from "react";
import Logo from "@/assets/svgs/logo-01.svg";
import SearchIcon from "@/assets/svgs/icon-magni-glass.svg";
import Link from "next/link";

// Simulación de base de datos de conductores activos
const activeDrivers = ["ABC123", "XYZ789", "DEF456"];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    isActive: boolean;
    message: string;
  } | null>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    const isWariActive = activeDrivers.includes(trimmedQuery.toUpperCase());

    setSearchResult({
      isActive: isWariActive,
      message: isWariActive
        ? "Este vehículo es un Wari activo"
        : "Este vehículo no es un Wari activo",
    });
  };

  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center justify-center p-4 md:py-12">
      <div className="bg-white rounded-2xl px-4 py-8 w-full max-w-screen-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 mb-6 relative">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="font-montserrat font-bold text-xl md:text-2xl mb-2">
            Buscar Conductores
          </h1>
          <p className="font-montserrat text-sm leading-5 text-center mb-6">
            Ingresa el código o placa del vehículo para verificar si es un Wari
            activo
          </p>
        </div>

        <div className="w-full shadow-md bg-wari-yellow rounded-3xl py-8 px-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col items-center">
            <div className="w-full flex items-center bg-white rounded-4xl overflow-hidden mb-6 border border-gray-200">
              <input
                type="text"
                placeholder="Ingresa la placa del vehículo"
                className="flex-1 py-3 px-4 outline-none font-montserrat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-black hover:bg-[#3a3426] text-white p-3 m-1 rounded-full"
                aria-label="Buscar"
              >
                <SearchIcon className="w-5 h-5 fill-white" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full md:w-2/3 bg-black hover:bg-[#3a3426] text-white py-4 rounded-4xl text-[15px] font-montserrat font-bold md:text-lg"
            >
              Buscar
            </button>
          </form>
        </div>

        {searchResult && (
          <div
            className={`w-full shadow-md rounded-3xl py-6 px-6 text-center ${
              searchResult.isActive
                ? "bg-wari-green text-white"
                : "bg-wari-red text-white"
            }`}
          >
            <p className="font-montserrat font-bold text-lg md:text-xl">
              {searchResult.message}
            </p>
            <p className="font-montserrat text-sm mt-2">
              {searchResult.isActive
                ? "Puedes rastrear este vehículo escaneando su código QR"
                : "Este vehículo no está registrado en nuestro sistema"}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <button className="bg-wari-blue hover:bg-[#189db9] text-white py-3 px-6 rounded-4xl text-[15px] font-montserrat font-bold">
              Volver al inicio
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
