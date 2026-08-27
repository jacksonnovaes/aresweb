export const legalConfig = {
  operatorName: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME?.trim() || "Responsável legal do Ares a configurar",
  operatorDocument: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_DOCUMENT?.trim() || "documento a configurar",
  operatorAddress: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS?.trim() || "endereço a configurar",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || "canal de privacidade a configurar",
  termsVersion: process.env.NEXT_PUBLIC_LEGAL_TERMS_VERSION?.trim() || "2026-08-27",
  privacyVersion: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_VERSION?.trim() || "2026-08-27",
};

export const legalIdentityConfigured = Boolean(
  process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME?.trim()
  && process.env.NEXT_PUBLIC_LEGAL_OPERATOR_DOCUMENT?.trim()
  && process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS?.trim()
  && process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim(),
);
