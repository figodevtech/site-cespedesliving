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
  /** Texto livre do ERP: distâncias e referências da região (nunca rua ou número). */
  locationDetails?: string;
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
/** Agenda pública do imóvel, para avisar antes de escolher as datas (fim = dia de saída). */
export type FlatAgenda = {
  unavailable: { start: string; end: string }[];
  packages: { name: string; start: string; end: string; minNights: number }[];
};
export type Filters = {
  modality?: Modality;
  neighborhood?: string;
  /** Destino da busca (cidade + UF de imóvel publicado). */
  city?: string;
  state?: string;
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
/** Reserva vista pelo proprietário (sem dados do hóspede). Campos opcionais chegam do ERP novo. */
export type OwnerDashboardReservation = {
  id: string;
  flat: string;
  /** "AAAA-MM-DD a AAAA-MM-DD": formato antigo, ainda enviado pelo ERP. */
  period: string;
  amount: number;
  status: string;
  flatId?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  paymentStatus?: string;
  createdAt?: string | null;
  /** Titular da reserva (sem documento). Ausente em ERPs anteriores a este campo. */
  guest?: OwnerReservationGuest | null;
  /** Horário previsto de entrada e saída da reserva ("HH:MM"). */
  checkinTime?: string | null;
  checkoutTime?: string | null;
  /** Entrada e saída registradas no ERP (data e hora, ISO). */
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
};
export type OwnerReservationGuest = {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
};
/** Bloqueio, manutenção ou ocupação ativa de um imóvel (fim nulo = sem data para acabar). */
export type OwnerOccupation = {
  id: number | string;
  imovel_id: number | string;
  tipo: string;
  inicio: string;
  fim: string | null;
  motivo?: string | null;
};
export type OwnerDashboard = {
  occupancy: number;
  revenue: number;
  expenses: number;
  payout: number;
  reservations: OwnerDashboardReservation[];
  maintenance: { title: string; status: string; amount: number | null }[];
  ocupacoes?: OwnerOccupation[];
};
/** Movimento do extrato do proprietário (imovel_movimento no ERP). */
export type OwnerMovement = {
  id: string | number;
  data?: string;
  data_movimento?: string;
  created_at?: string;
  descricao?: string;
  /** BRUTO_RECEBIDO, TAXA_ADMIN, DESPESA_PROPRIETARIO ou REPASSE. */
  tipo?: string;
  natureza?: string;
  valor?: number | string;
  imovel_id?: number | string | null;
  reserva_id?: number | string | null;
  imovel_titulo?: string;
  imovel?: { id?: number | string; titulo?: string } | null;
  documento_id?: string | null;
  /** Repasse registrado, mas ainda não lançado (ou não pago) no financeiro do ERP. */
  repasse_pendente?: boolean;
};
export type OwnerStatementData = {
  items: OwnerMovement[];
  totais: {
    recebido: number;
    receita_administradora: number;
    despesas: number;
    repassado: number;
    /** Saldo atual, de todo o histórico (não só do período filtrado). */
    saldo_repassar: number;
  };
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
