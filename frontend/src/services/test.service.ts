import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.BASE_URL;
const RESULTS_URL = API_CONFIG.RESULTS_URL;

export interface Test {
  _id: string;
  name?: string;
  description?: string;
  startUrl: string;
  steps: {
    name: string;
    commands: string[];
  }[];
  status?: string;
  executionTime?: number;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestResult {
  _id: string;
  testId: string;
  status: string;
  executionTime: number;
  error?: string;
  timestamp: Date;
  createdAt?: Date;
  steps?: {
    name: string;
    status: string;
    duration: number;
    error?: string;
  }[];
}

export const testService = {
  async getAllTests(): Promise<Test[]> {
    try {
      console.log('Making request to:', `${API_URL}${API_CONFIG.ENDPOINTS.TESTS}`);
      const response = await axios.get(`${API_URL}${API_CONFIG.ENDPOINTS.TESTS}`);
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);

      if (!response.data) {
        console.error('No data in response');
        throw new Error('No data received from API');
      }

      if (!Array.isArray(response.data)) {
        console.error('Response data is not an array:', response.data);
        throw new Error('Invalid response format: expected array');
      }

      return response.data;
    } catch (error) {
      console.error('Error in getAllTests:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },

  async getTestById(id: string): Promise<Test> {
    const response = await axios.get(`${API_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`);
    return response.data;
  },

  async createTest(test: FormData): Promise<Test> {
    const response = await axios.post(`${API_URL}/upload`, test);
    return response.data;
  },

  async updateTest(id: string, test: Partial<Test>): Promise<Test> {
    const response = await axios.put(`${API_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`, test);
    return response.data;
  },

  async deleteTest(id: string): Promise<void> {
    await axios.delete(`${API_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`);
  },

  async getTestResults(testId: string): Promise<TestResult[]> {
    const response = await axios.get(
      `${RESULTS_URL}${API_CONFIG.ENDPOINTS.TEST_RESULTS}/by-test/${testId}`
    );
    return response.data;
  },

  async executeTest(id: string): Promise<TestResult> {
    const response = await axios.post(`${API_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}/execute`);
    return response.data;
  },
};
