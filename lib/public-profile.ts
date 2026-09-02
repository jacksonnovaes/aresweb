export function publicMediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("/api/backend/public/media/")) return path;
  if (/^(?:https?:|data:|blob:)/i.test(path) || path.startsWith("/")) return path;
  return `/api/backend/public/media/${path}`;
}

export function safeProfileColor(value: string | null | undefined, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value ?? "") ? value! : fallback;
}

export function colorWithOpacity(hex: string, percentage: number) {
  const color = safeProfileColor(hex, "#F6F4ED");
  const alpha = Math.max(0, Math.min(90, percentage)) / 100;
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
