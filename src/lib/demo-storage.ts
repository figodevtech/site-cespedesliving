"use client";
import type { Booking, DemoProfile } from "@/domain/types";
const PREFIX = "cespedes-demo-v1:";
let memory: Record<string, unknown> = {};
export function readDemo<T>(key: string, fallback: T): T {
  try {
    return (
      JSON.parse(localStorage.getItem(PREFIX + key) ?? "null") ??
      memory[key] ??
      fallback
    );
  } catch {
    return (memory[key] as T) ?? fallback;
  }
}
export function writeDemo(key: string, value: unknown) {
  memory[key] = value;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* In-memory fallback when storage is unavailable. */
  }
  window.dispatchEvent(new Event("demo-change"));
}
export function saveProfile(profile: DemoProfile) {
  writeDemo("profile", {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    demo: true,
  });
}
export function saveBooking(booking: Booking) {
  writeDemo("bookings", [booking, ...readDemo<Booking[]>("bookings", [])]);
}
export function clearDemo() {
  memory = {};
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* Storage may be disabled. */
  }
  window.dispatchEvent(new Event("demo-change"));
}
