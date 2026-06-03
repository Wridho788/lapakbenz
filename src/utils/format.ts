export function capitalizeWords(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
