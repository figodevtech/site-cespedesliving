import "server-only";
import { apiAdapter } from "./adapters/api";
import { mockAdapter } from "./adapters/mock";
export function getAdapter() {
  const source = process.env.DATA_ADAPTER ?? "api";
  if (source !== "mock" && source !== "api")
    throw new Error("DATA_ADAPTER deve ser mock ou api.");
  return source === "api" ? apiAdapter : mockAdapter;
}
export function isMock() {
  return process.env.DATA_ADAPTER === "mock";
}
