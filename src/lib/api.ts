const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
};

export type Topic = {
  id: number;
  subject_id: number;
  name: string;
  position: number;
};

export type Subject = {
  id: number;
  name: string;
  color_key: string | null;
  user_id: number | null;
  topics: Topic[];
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('admin_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem('admin_token', token);
  else window.localStorage.removeItem('admin_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: AdminUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AdminUser>('/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

export const subjectsApi = {
  list: () => request<Subject[]>('/admin/subjects'),
  create: (data: { name: string; color_key?: string }) =>
    request<Subject>('/admin/subjects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; color_key?: string }) =>
    request<Subject>(`/admin/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/subjects/${id}`, { method: 'DELETE' }),
};

export const topicsApi = {
  list: (subjectId: number) => request<Topic[]>(`/admin/subjects/${subjectId}/topics`),
  create: (subjectId: number, name: string) =>
    request<Topic>(`/admin/subjects/${subjectId}/topics`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  update: (id: number, data: { name?: string; position?: number }) =>
    request<Topic>(`/admin/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/topics/${id}`, { method: 'DELETE' }),
};
