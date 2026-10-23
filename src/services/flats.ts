import { getAdapter } from "./adapter";
import type { Filters } from "@/domain/types";
export const getFlats = (filters?: Filters) => getAdapter().listFlats(filters);
export const getFlat = (slug: string) => getAdapter().getFlat(slug);
