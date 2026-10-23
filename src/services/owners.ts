import { getAdapter } from "./adapter";
import type { LeadInput } from "@/domain/types";
export const createOwnerLead = (input: LeadInput) =>
  getAdapter().createLead(input);
export const getOwnerDashboard = () => getAdapter().dashboard();
