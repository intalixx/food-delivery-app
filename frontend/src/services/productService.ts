import { apiFetch, API_BASE_URL } from './api';

export interface Product {
    id: string;
    product_name: string;
    description: string | null;
    price: number;
    image_path: string | null;
    category_id: string;
    category_name: string;
    created_at: string;
    updated_at: string;
}

interface ProductsResponse {
    success: boolean;
    data: Product[];
}

/** Build the full image URL from the relative path stored in DB */
export function getProductImageUrl(imagePath: string | null): string {
    if (!imagePath) return '';
    // API_BASE_URL is like http://localhost:8000/api — strip /api for static files
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
}

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await apiFetch<ProductsResponse>('/products');
        return response.data;
    },
};
