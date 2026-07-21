export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  }
  return process.env.API_URL ?? 'http://localhost:4000';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}/api/v1${path}`;
}
