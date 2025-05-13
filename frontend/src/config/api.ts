import config from '../../public/config.json';

export const API_CONFIG = {
    BASE_URL: config.apiUrl,
    ENDPOINTS: {
        UPLOAD: config.endpoints.upload,
        TESTS: config.endpoints.tests,
    },
} as const; 