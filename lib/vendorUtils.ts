// @/lib/vendorUtils.ts

import { vendorCategories } from '@/data/vendors';

/**
 * Returns the readable category name from its ID.
 */
export function getCategoryLabel(id: string): string | null {
  const match = vendorCategories.find((cat) => cat.id === id);
  return match ? match.name : null;
}

/**
 * Returns the category ID from its readable name.
 */
export function getCategoryIdFromName(name: string): string | null {
  const match = vendorCategories.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.id : null;
}

/**
 * Validates if a category ID exists in the known list.
 */
export function isValidCategoryId(id: string): boolean {
  return vendorCategories.some((cat) => cat.id === id);
}

/**
 * Simple fuzzy location matching function.
 */
export function isLocationMatch(
  searchTerm: string,
  vendorLocation: string
): boolean {
  return vendorLocation.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Returns the image path for a vendor category.
 */
export function getCategoryImagePath(categoryId: string): string {
  return `/images/categories/${categoryId}.png`; // assuming all images are .jpg
}
