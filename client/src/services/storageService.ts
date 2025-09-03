export interface UploadImageRequest {
    user_id: string;
    image?: File;
    images?: File[];
}

export interface UploadImageResponse {
    success?: boolean; // Made optional since prediction endpoint doesn't return this
    message?: string;
    data?: any;
    images?: string[];
    features?: any;
    processed_image?: string;
}

class StorageService {
    private baseURL = `${import.meta.env.VITE_HOST_BE}/api/beans`;

    async uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
        try {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            
            if (data.image) {
                formData.append('image', data.image);
            }
            
            if (data.images && data.images.length > 0) {
                data.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await fetch(`${this.baseURL}/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to upload image(s)');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to upload image(s)');
        }
    }

    async predictImage(data: UploadImageRequest): Promise<UploadImageResponse> {
        try {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            
            if (data.image) {
                formData.append('image', data.image);
            }
            
            if (data.images && data.images.length > 0) {
                data.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await fetch(`${this.baseURL}/process/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to predict image(s)');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to predict image(s)');
        }
    }

    async submitImage(data: UploadImageRequest): Promise<UploadImageResponse> {
        try {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            
            if (data.image) {
                formData.append('image', data.image);
            }
            
            if (data.images && data.images.length > 0) {
                data.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await fetch(`${this.baseURL}/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to submit image(s)');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to submit image(s)');
        }
    }

    async retrieveImages(user_id: string): Promise<UploadImageResponse> {
        try {
            const response = await fetch(`${this.baseURL}/get-list/${user_id}/`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to retrieve images');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve images');
        }
    }
}

export const storageService = new StorageService();
