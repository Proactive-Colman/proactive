import { API_CONFIG } from '../config/api';

interface UploadParams {
    file: File;
    name: string;
    description: string;
}

export const fileService = {
    uploadFile: async ({ file, name, description }: UploadParams) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('description', description);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        return response.json();
    },
}; 