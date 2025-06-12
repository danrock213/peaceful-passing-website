// /utils/geocode.ts

export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location) return null;

  const encodedLocation = encodeURIComponent(location);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PeacefulPassingApp/1.0 (your-email@example.com)', // Change email accordingly
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

const geocodeCacheKey = 'geocodeCache';

function getCache(): Record<string, { lat: number; lng: number }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(geocodeCacheKey);
  return stored ? JSON.parse(stored) : {};
}

function saveCache(cache: Record<string, { lat: number; lng: number }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(geocodeCacheKey, JSON.stringify(cache));
}

export async function geocodeWithCache(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location) return null;

  const cache = getCache();
  if (cache[location]) return cache[location];

  const coords = await geocodeLocation(location);
  if (coords) {
    cache[location] = coords;
    saveCache(cache);
  }
  return coords;
}

export function getDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}