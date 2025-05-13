import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { message } from 'antd';

interface UploadParams {
    file: File;
    name: string;
    description: string;
}

export const useFileUpload = () => {
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadMutation = useMutation({
        mutationFn: fileService.uploadFile,
        onSuccess: () => {
            setUploadProgress(0);
        },
        onError: (error) => {
            message.error('Failed to upload file');
            setUploadProgress(0);
            console.error('Upload error:', error);
        },
    });

    const uploadFile = async (params: UploadParams) => {
        try {
            setUploadProgress(0);
            await uploadMutation.mutateAsync(params);
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    return {
        uploadFile,
        isUploading: uploadMutation.isLoading,
        uploadProgress,
        error: uploadMutation.error,
    };
}; 