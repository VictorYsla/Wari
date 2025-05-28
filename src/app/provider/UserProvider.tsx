// app/UserProvider.tsx
"use client";

import { useUserStore } from "@/hooks/userStore";
import React, { useEffect } from "react";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
