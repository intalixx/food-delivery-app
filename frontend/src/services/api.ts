const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ errors: ['Network error'] }));
        throw new Error(error.errors?.[0] || 'Something went wrong');
    }

    return response.json();
}

export { API_BASE_URL };
