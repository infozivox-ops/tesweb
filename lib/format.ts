import type { Currency } from "@/types/domain";

export const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};
