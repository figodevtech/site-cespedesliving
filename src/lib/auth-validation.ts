export function validCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let size = 9; size < 11; size++) {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
    const digit = (sum * 10) % 11;
    if ((digit === 10 ? 0 : digit) !== Number(cpf[size])) return false;
  }
  return true;
}
/** Guarda, entre o cadastro e a confirmação do e-mail, para onde a pessoa ia. */
export const SIGNUP_NEXT_COOKIE = "cl_signup_next";
export function safeNext(value: string | null, fallback = "/minha-conta") {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\r\n]/.test(value)
    ? value
    : fallback;
}
export function validateRegistration(input: Record<string, unknown>) {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();
  const phone = String(input.phone ?? "").replace(/\D/g, "");
  const cpf = String(input.cpf ?? "").replace(/\D/g, "");
  const password = String(input.password ?? "");
  if (name.length < 3 || name.length > 120)
    throw new Error("Informe seu nome completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new Error("Informe um e-mail válido.");
  if (!/^\d{10,13}$/.test(phone))
    throw new Error("Informe seu telefone com DDD.");
  if (!validCpf(cpf)) throw new Error("Informe um CPF válido.");
  if (password.length < 8 || password.length > 128)
    throw new Error("A senha deve ter entre 8 e 128 caracteres.");
  if (input.acceptedTerms !== true)
    throw new Error("Aceite os termos e a política de privacidade.");
  return { name, email, phone, cpf, password };
}
