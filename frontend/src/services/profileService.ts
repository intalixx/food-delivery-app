import { apiFetch, API_BASE_URL } from './api';

export interface UserProfile {
    id: string;
    user_name: string;
    mobile_number: string;
    email: string | null;
    gender: 'male' | 'female' | null;
    image_path: string | null;
    created_at: string;
    updated_at: string;
}

interface ProfileResponse {
    success: boolean;
    data: UserProfile;
}

export interface UpdateProfileData {
    user_name?: string;
    email?: string;
    gender?: 'male' | 'female';
}

/** Build the full profile image URL from the relative path stored in DB */
export function getProfileImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${imagePath}`;
}

export const profileService = {
    /** Get current authenticated user's profile */
    async getMe(): Promise<UserProfile> {
        const response = await apiFetch<ProfileResponse>('/auth/me');
        return response.data;
    },

    /** Update current user's profile (supports image upload) */
    async updateMe(data: UpdateProfileData, imageFile?: File | null): Promise<UserProfile> {
        const formData = new FormData();

        if (data.user_name) formData.append('user_name', data.user_name);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.gender) formData.append('gender', data.gender);
        if (imageFile) formData.append('image', imageFile);

        const response = await apiFetch<ProfileResponse>('/auth/me', {
            method: 'PUT',
            body: formData,
        });
        return response.data;
    },
};
