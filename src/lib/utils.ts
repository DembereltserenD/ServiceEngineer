import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent number formatting to avoid hydration issues
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

// Consistent date formatting to avoid hydration issues
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
}
