import { useSyncExternalStore } from "react";

export type User = { name: string; email: string; username: string; password: string; photo: string | null };
export type AppState = { logo: string | null; user: User; loggedIn: boolean };

const KEY = "app-state-v1";
const DEFAULT: AppState = {
  logo: null,
  loggedIn: false,
  user: { name: "Administrador", email: "admin@exemplo.com", username: "admin", password: "admin", photo: null },
};

let state: AppState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
}

export function setState(patch: Partial<AppState>) {
  load();
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useAppState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => DEFAULT,
  );
}

export function login(username: string, password: string) {
  load();
  if (username.trim() === state.user.username && password === state.user.password) {
    setState({ loggedIn: true });
    return true;
  }
  return false;
}

export const logout = () => setState({ loggedIn: false });

export function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
