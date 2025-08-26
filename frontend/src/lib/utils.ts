import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as TND currency
 * @param amount - The amount to format
 * @returns Formatted currency string in TND
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0,00 TND";
  }

  return numAmount.toLocaleString("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse a currency string back to a number
 * @param currencyString - The formatted currency string
 * @returns The numeric value
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbol and spaces, replace comma with dot
  const cleanString = currencyString.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleanString) || 0;
}
