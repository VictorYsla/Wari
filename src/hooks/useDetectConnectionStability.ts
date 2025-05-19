import { useEffect } from "react";
import { useToast } from "./use-toast";
import { NetworkInformation } from "@/app/passenger/types";

export function useDetectConnectionStability(
  forceReconnect: () => void,
  silentlySync: () => void
) {
  const { toast } = useToast();

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = navigator.connection as NetworkInformation;

      const handleConnectionChange = () => {
        const isUnstable =
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.effectiveType === "3g" ||
          (connection.effectiveType === "4g" &&
            connection.rtt !== undefined &&
            connection.rtt > 400);

        if (isUnstable) {
          toast({
            title: "Conexión a internet inestable",
            description:
              "Conexión inestable, los datos pueden no estar actualizados",
            variant: "destructive",
          });
        } else {
          forceReconnect();
          silentlySync();
        }
      };

      connection.addEventListener("change", handleConnectionChange);

      // Ejecutar al montar
      handleConnectionChange();

      return () => {
        connection.removeEventListener("change", handleConnectionChange);
      };
    } else {
      // iOS fallback usando touch + fetch
      let lastCheck = 0;

      const detectSlowConnection = async () => {
        const now = Date.now();
        if (now - lastCheck < 10000) return; // evitar repeticiones rápidas
        lastCheck = now;

        const start = performance.now();
        try {
          await fetch("api/ping", { method: "HEAD", cache: "no-cache" });
          const end = performance.now();
          const rtt = end - start;

          if (rtt > 400) {
            toast({
              title: "Conexión a internet inestable",
              description:
                "Conexión inestable, los datos pueden no estar actualizados",
              variant: "destructive",
            });
          } else {
            forceReconnect();
            silentlySync();
          }
        } catch (error) {}
      };

      const handleTouch = () => {
        detectSlowConnection();
      };

      window.addEventListener("touchstart", handleTouch);

      return () => {
        window.removeEventListener("touchstart", handleTouch);
      };
    }
  }, []);
}
