import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder.png"

export function getProductImageUrl(imageUrl: string): string {
  return imageUrl.trim() || PRODUCT_PLACEHOLDER_IMAGE
}
