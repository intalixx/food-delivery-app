import { apiFetch } from './api';

export interface Category {
    id: string;
    category_name: string;
    created_at: string;
    updated_at: string;
}

interface CategoriesResponse {
    success: boolean;
    data: Category[];
}

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const response = await apiFetch<CategoriesResponse>('/categories');
        return response.data;
    },
};
