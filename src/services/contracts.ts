import type {
  AvailabilityQuery,
  Booking,
  BookingInput,
  DemoProfile,
  Filters,
  Flat,
  LeadInput,
  OwnerDashboard,
  ReservationQuote,
} from "@/domain/types";
export interface DataAdapter {
  listFlats(filters?: Filters): Promise<Flat[]>;
  getFlat(slug: string): Promise<Flat | null>;
  quote(query: AvailabilityQuery): Promise<ReservationQuote>;
  createBooking(input: BookingInput): Promise<Booking>;
  demoAccess(input: {
    name: string;
    email: string;
    role: "guest" | "owner";
  }): Promise<DemoProfile>;
  createLead(input: LeadInput): Promise<{ id: string; demo: boolean }>;
  dashboard(): Promise<OwnerDashboard>;
}
