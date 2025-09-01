import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ensureDate(timestamp: Date | string): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}
