import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: any;
  [key: string]: any;
}

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const isAdminPath = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || endpoint.includes('admin'));
  const token = typeof window !== 'undefined'
    ? (isAdminPath ? (localStorage.getItem('neva-admin-token') || localStorage.getItem('neva-token')) : localStorage.getItem('neva-token'))
    : null;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      method: (options.method || 'GET').toLowerCase(),
      data: options.body,
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    throw new Error(message);
  }
}
