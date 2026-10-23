import { getAdapter } from "./adapter";
import type { AvailabilityQuery } from "@/domain/types";
export const getQuote = (query: AvailabilityQuery) => getAdapter().quote(query);
