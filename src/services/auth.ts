import { getAdapter } from "./adapter";
export const demoAccess = (input: {
  name: string;
  email: string;
  role: "guest" | "owner";
}) => getAdapter().demoAccess(input);
