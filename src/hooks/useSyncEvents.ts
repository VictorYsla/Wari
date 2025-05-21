import { useRef, useEffect } from "react";
import { useToast } from "./use-toast";

type useSyncEventsProps = {
  forceReconnect: () => void;
  silentlySync: () => Promise<void>;
  isConnected: boolean;
};

export function useSyncEvents({
  forceReconnect,
  silentlySync,
  isConnected,
}: useSyncEventsProps) {
  const { toast } = useToast();

  const isSyncingRef = useRef(false);

  const sync = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      await forceReconnect();
      await silentlySync();
    } catch (error) {
      console.error("Error sincronizando datos:", error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      sync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    const handleOnline = () => {
      toast?.({
        title: "Conexión restaurada",
        description: "Sincronizando datos",
        variant: "informative",
      });
      sync();
    };

    const handleOffline = () => {
      toast?.({
        title: "Sin conexión de internet",
        description: "Los datos se actualizarán cuando la conexión retorne",
        variant: "destructive",
      });
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    const handleTouchSync = () => {
      if (!isConnected) {
        sync();
      }
    };

    window.addEventListener("touchend", handleTouchSync);
    window.addEventListener("click", handleTouchSync);

    return () => {
      window.removeEventListener("touchend", handleTouchSync);
      window.removeEventListener("click", handleTouchSync);
    };
  }, [isConnected]);
}
