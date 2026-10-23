export type Flat = {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  city: string;
  state: "PB";
  description: string;
  coverImage: string;
  gallery: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  amenities: string[];
  active: boolean;
  published: boolean;
  fromPrice: number;
  tag: string;
};
// ownerId belongs only to the private ERP record; it is never part of Flat.
export type AvailabilityQuery = {
  flatId: string;
  checkin: string;
  checkout: string;
  guests: number;
};
export type ReservationQuote = {
  available: boolean;
  nightlyBreakdown: { date: string; amount: number }[];
  subtotal: number;
  fees: number;
  taxes: number;
  total: number;
  currency: "BRL";
  expiresAt?: string;
};
export type Filters = {
  neighborhood?: string;
  guests?: number;
  checkin?: string;
  checkout?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sort?: string;
};
export type Guest = { name: string; email: string; phone: string };
export type BookingInput = AvailabilityQuery & {
  guest: Guest;
  acceptedTerms: boolean;
};
export type Booking = BookingInput & {
  id: string;
  flatTitle: string;
  slug: string;
  total: number;
  status: "PENDING";
  createdAt: string;
  demo: boolean;
};
export type DemoProfile = {
  name: string;
  email: string;
  role: "guest" | "owner";
  demo: true;
};
export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  message: string;
  website?: string;
};
export type OwnerDashboard = {
  occupancy: number;
  revenue: number;
  expenses: number;
  payout: number;
  reservations: {
    id: string;
    flat: string;
    period: string;
    amount: number;
    status: string;
  }[];
  maintenance: { title: string; status: string; amount: number }[];
};
