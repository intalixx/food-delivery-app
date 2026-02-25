import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAuthHeaders(): Record<string, string> {
    const token = Cookies.get('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders = getAuthHeaders();
    const isFormData = options?.body instanceof FormData;

    const headers: HeadersInit = {
        ...authHeaders,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options?.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ errors: ['Network error'] }));
        throw new Error(error.errors?.[0] || 'Something went wrong');
    }

    return response.json();
}

export { API_BASE_URL };
