import config from '../../public/config.json';

const apiUrl = import.meta.env.VITE_API_URL || config.apiUrl;
const resultsUrl = import.meta.env.VITE_RESULTS_URL || config.resultsUrl;

export const API_CONFIG = {
  BASE_URL: apiUrl,
  RESULTS_URL: resultsUrl,
  ENDPOINTS: {
    UPLOAD: config.endpoints.upload,
    TESTS: config.endpoints.tests,
    TEST_RESULTS: config.endpoints.testResults,
  },
} as const;
