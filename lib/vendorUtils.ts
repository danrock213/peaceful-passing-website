export function isLocationMatch(search: string, vendorLocation: string): boolean {
  if (!search) return true;

  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const normalizedSearch = normalize(search);
  const normalizedVendorLoc = normalize(vendorLocation);

  return (
    normalizedVendorLoc.includes(normalizedSearch) ||
    normalizedSearch.includes(normalizedVendorLoc)
  );
}

export function getCategoryLabel(slug: string): string | null {
  const map: Record<string, string> = {
    'funeral-homes': 'Funeral Homes',
    crematoriums: 'Crematoriums',
    florists: 'Florists',
    'grief-counselors': 'Grief Counselors',
    'estate-lawyers': 'Estate Lawyers',
    'memorial-products': 'Memorial Products',
    'event-venues': 'Event Venues',
  };

  return map[slug] || null;
}
