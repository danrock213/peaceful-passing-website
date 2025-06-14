import { Tribute } from '@/types/tribute';

export function getTributes(): Tribute[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('tributes') || '[]');
}

export function saveTributes(tributes: Tribute[]) {
  localStorage.setItem('tributes', JSON.stringify(tributes));
}

export function getTributeById(id: string): Tribute | undefined {
  return getTributes().find((t) => t.id === id);
}
