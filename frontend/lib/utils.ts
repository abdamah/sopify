import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder.png"

export function getProductImageUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  if (trimmed.startsWith("/uploads/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return `${baseUrl}${trimmed}`;
  }

  return trimmed;
}
