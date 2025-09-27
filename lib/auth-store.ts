import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KeygenUser } from './types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  login: (token: string, user: Partial<KeygenUser>) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      login: (token, user) => set({ token, isAuthenticated: true, user }),
      logout: () => set({ token: null, isAuthenticated: false, user: null }),
      setToken: (token) =>
        set((state) => ({
          token,
          isAuthenticated: !!token,
          user: state.user,
        })),
    }),
    {
      name: 'keygen-auth',
    }
  )
);
