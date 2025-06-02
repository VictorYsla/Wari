// stores/userStore.ts
import { create } from "zustand";

export interface UserResponseTypes {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  savedUser: UserStore;
  token: Token;
}

export interface UserStore {
  plate: string;
  is_active: boolean;
  is_expired: boolean;
  expired_date: Date;
  password: string;
  time_zone: string;
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Token {
  token: string;
  user: UserStore;
}

type UserState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: UserStore | null;
  fetchUser: () => Promise<void>;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  isLoaded: false,
  isSignedIn: false,
  user: null,

  fetchUser: async () => {
    try {
      const res = await fetch("/api/protected", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        set({ user: null, isSignedIn: false });
      } else {
        const data = await res.json();
        set({ user: data?.data, isSignedIn: true });
      }
    } catch {
      set({ user: null, isSignedIn: false });
    } finally {
      set({ isLoaded: true });
    }
  },

  logout: () => set({ user: null, isSignedIn: false }),
}));
