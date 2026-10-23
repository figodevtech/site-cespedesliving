import { getAdapter } from "./adapter";
import type { BookingInput } from "@/domain/types";
export const createReservation = (input: BookingInput) =>
  getAdapter().createBooking(input);
