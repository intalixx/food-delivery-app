import { apiFetch } from './api';

export interface Address {
    id: string;
    user_id: string;
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
    created_at: string;
    updated_at: string;
}

interface AddressResponse {
    success: boolean;
    data: Address;
}

interface AddressListResponse {
    success: boolean;
    data: Address[];
}

export interface CreateAddressData {
    user_id: string;
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
}

export interface UpdateAddressData {
    save_as?: string;
    pincode?: string;
    city?: string;
    state?: string;
    house_number?: string;
    street_locality?: string;
    mobile?: string;
}

export const addressService = {
    /** Get all addresses for a specific user */
    async getByUserId(userId: string): Promise<Address[]> {
        const response = await apiFetch<AddressListResponse>(`/addresses/user/${userId}`);
        return response.data;
    },

    /** Create a new address */
    async create(data: CreateAddressData): Promise<Address> {
        const response = await apiFetch<AddressResponse>('/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /** Update an existing address */
    async update(id: string, data: UpdateAddressData): Promise<Address> {
        const response = await apiFetch<AddressResponse>(`/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /** Delete an address */
    async delete(id: string): Promise<void> {
        await apiFetch<{ success: boolean; message: string }>(`/addresses/${id}`, {
            method: 'DELETE',
        });
    },
};
