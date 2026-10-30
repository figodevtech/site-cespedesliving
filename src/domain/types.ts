export type Modality = "TEMPORADA" | "LOCACAO" | "VENDA";
export type SiteProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: "guest" | "owner";
};
export type Flat = {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  city: string;
  state: string;
  modalities?: Modality[];
  prices?: {
    nightly?: number | null;
    monthly?: number | null;
    sale?: number | null;
  };
  occupancyStatus?: string;
  description: string;
  coverImage: string;
  gallery: string[];
  /** true quando as fotos são do imóvel real (não ambientação gerada por IA). */
  realPhotos?: boolean;
  maxGuests: number;
  minNights?: number;
  maxNights?: number;
  rules?: string;
  checkinTime?: string;
  checkoutTime?: string;
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
  quoteId?: string;
};
export type Filters = {
  modality?: Modality;
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
  guest?: Guest;
  acceptedTerms: boolean;
  quoteId?: string;
  expectedTotal?: number;
  idempotencyKey?: string;
};
export type Booking = {
  id: string;
  flatTitle: string;
  slug: string;
  checkin: string;
  checkout: string;
  guests: number;
  total: number;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  paymentStatus?: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  createdAt: string;
  demo?: boolean;
};
export type DemoProfile = {
  name: string;
  email: string;
  role: "guest" | "owner";
  demo: true;
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
  maintenance: { title: string; status: string; amount: number | null }[];
};
export type OwnerStatement = {
  id: string;
  date: string;
  property: string;
  description: string;
  revenue: number;
  expenses: number;
  fee: number;
  payout: number;
  fileId?: string;
};
