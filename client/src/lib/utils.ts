import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const commonSectionClass = "bg-white p-6 rounded-xl shadow-sm border border-slate-200";
export const commonHeaderClass = "text-2xl font-semibold text-slate-900 mb-2";
export const commonSubHeaderClass = "text-lg font-semibold text-slate-900 mb-4";
