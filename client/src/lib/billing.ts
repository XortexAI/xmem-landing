export type BillingRegion = "IN" | "GLOBAL";
export type BillingCurrency = "INR" | "USD" | string;

export interface BillingPlanPrice {
  price_minor_unit?: number;
  price_paise?: number;
  currency: BillingCurrency;
}

export const PRO_MONTHLY_CREDITS = 5000;

export const DEFAULT_PRO_PRICES: Record<
  BillingRegion,
  { amountInMinorUnits: number; currency: BillingCurrency }
> = {
  IN: { amountInMinorUnits: 9900, currency: "INR" },
  GLOBAL: { amountInMinorUnits: 300, currency: "USD" },
};

export function detectBillingRegion(): BillingRegion {
  const configuredRegion = String(import.meta.env.VITE_XMEM_BILLING_REGION || "").toUpperCase();
  if (configuredRegion === "IN" || configuredRegion === "GLOBAL") {
    return configuredRegion;
  }

  const languages = typeof navigator !== "undefined" ? navigator.languages || [navigator.language] : [];
  if (languages.some((language) => /(^|-)IN$/i.test(language))) {
    return "IN";
  }

  const timezone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  return timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta" ? "IN" : "GLOBAL";
}

export function getRegionalPriceAmount(
  price: BillingPlanPrice | undefined,
  fallbackAmount: number,
): number {
  return Number(price?.price_minor_unit ?? price?.price_paise ?? fallbackAmount);
}

export function formatMinorUnitPrice(amountInMinorUnits: number, currency: BillingCurrency = "USD") {
  if (currency === "USD") {
    return `$${amountInMinorUnits / 100}`;
  }

  if (currency === "INR") {
    return `Rs ${amountInMinorUnits / 100}`;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInMinorUnits / 100);
}

export function formatRegionalProPrice(region: BillingRegion) {
  const price = DEFAULT_PRO_PRICES[region];
  return formatMinorUnitPrice(price.amountInMinorUnits, price.currency);
}
