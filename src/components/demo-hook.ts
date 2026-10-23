"use client";
import { useMemo, useSyncExternalStore } from "react";
import { readDemo } from "@/lib/demo-storage";
const subscribeHydration = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
}
function subscribe(callback: () => void) {
  window.addEventListener("demo-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("demo-change", callback);
    window.removeEventListener("storage", callback);
  };
}
export function useDemoValue<T>(key: string, fallback: T): T {
  const value = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readDemo(key, null)),
    () => "null",
  );
  return useMemo(() => JSON.parse(value) ?? fallback, [value, fallback]) as T;
}
