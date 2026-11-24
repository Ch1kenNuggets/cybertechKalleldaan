// In-memory Bearer session token (never stored in localStorage or sessionStorage)
let sessionToken: string | null = null;

export function setAuthToken(token: string | null): void {
  sessionToken = token;
}

export function getAuthToken(): string | null {
  return sessionToken;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const errBody = (await response.json()) as { error?: string; message?: string };
      throw new Error(errBody.error || errBody.message || `Request failed (${response.status})`);
    }
    throw new Error(`Request failed (${response.status})`);
  }

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export async function downloadProtectedFile(filename: string): Promise<void> {
  const headers = new Headers();
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }
  const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, { headers });
  if (!res.ok) {
    throw new Error('Unable to download requested file.');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadAdminCsvReport(): Promise<void> {
  const headers = new Headers();
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }
  const res = await fetch('/api/admin/reports/csv', { headers });
  if (!res.ok) {
    throw new Error('Unable to export CSV report.');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = 'cybertech_academy_report.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
