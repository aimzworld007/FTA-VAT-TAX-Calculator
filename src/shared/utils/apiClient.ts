export async function apiClient<T = any>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.message || 'Request failed');
  return json;
}
