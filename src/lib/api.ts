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

export type LearningContent = {
  id: number;
  topic_id: number;
  type: 'note' | 'video' | 'flashcard';
  title: string;
  body: string | null;
  position: number;
};

export type QuestionChoice = {
  id?: number;
  text: string;
  is_correct: boolean;
};

export type Question = {
  id: number;
  subject_id: number;
  topic_id: number | null;
  prompt: string;
  explanation: string | null;
  choices: QuestionChoice[];
};

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  xp: number;
  created_at: string;
  subjects_count: number;
};

export type AdminDocument = {
  id: number;
  user_id: number;
  subject_id: number;
  type: 'pdf' | 'typed_note';
  title: string;
  size_bytes: number;
  created_at: string;
  user: { id: number; name: string; email: string };
  subject: { id: number; name: string };
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
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

/** Multipart variant for CSV import — omits the JSON Content-Type so the browser can set its
 * own multipart boundary header. */
async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status);
  }

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

export const contentApi = {
  list: (topicId: number) => request<LearningContent[]>(`/admin/topics/${topicId}/content`),
  create: (topicId: number, data: { type: LearningContent['type']; title: string; body?: string }) =>
    request<LearningContent>(`/admin/topics/${topicId}/content`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { title?: string; body?: string; position?: number }) =>
    request<LearningContent>(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/content/${id}`, { method: 'DELETE' }),
};

export const questionsApi = {
  list: (subjectId: number, topicId?: number) =>
    request<Question[]>(`/admin/subjects/${subjectId}/questions${topicId ? `?topic_id=${topicId}` : ''}`),
  create: (subjectId: number, data: { topic_id?: number; prompt: string; explanation?: string; choices: QuestionChoice[] }) =>
    request<Question>(`/admin/subjects/${subjectId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { topic_id?: number; prompt: string; explanation?: string; choices: QuestionChoice[] }) =>
    request<Question>(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/questions/${id}`, { method: 'DELETE' }),
  importCsv: (subjectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return requestForm<{ created: number; errors: { row: number; errors: Record<string, string[]> }[] }>(
      `/admin/subjects/${subjectId}/questions/import`,
      formData
    );
  },
};

export const documentsApi = {
  list: (page = 1) => request<Paginated<AdminDocument>>(`/admin/documents?page=${page}`),
};

export const usersApi = {
  list: (page = 1) => request<Paginated<ManagedUser>>(`/admin/users?page=${page}`),
};

export type OverviewStats = {
  total_students: number;
  active_students_30d: number;
  completed_sessions: number;
  total_study_minutes: number;
  total_quiz_attempts: number;
  quiz_completion_rate: number;
  total_subjects: number;
  total_documents: number;
  recent_documents: {
    id: number;
    title: string;
    type: 'pdf' | 'typed_note';
    created_at: string;
    user: { id: number; name: string; email: string };
    subject: { id: number; name: string };
  }[];
};

export const dashboardApi = {
  overview: () => request<OverviewStats>('/admin/overview'),
};

export const adminProfileApi = {
  update: (data: { name: string }) =>
    request<AdminUser>('/admin/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    request<{ message: string }>('/admin/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
};
