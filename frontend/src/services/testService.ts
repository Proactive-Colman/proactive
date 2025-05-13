import { API_CONFIG } from '../config/api';

export interface Test {
  id: number;
  name: string;
  description: string;
}

export const testService = {
  getAllTests: async (): Promise<Test[]> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}`);
    if (!response.ok) throw new Error('Failed to fetch tests');
    return response.json();
  },

  getTestById: async (id: number): Promise<Test> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch test ${id}`);
    return response.json();
  },

  createTest: async (test: Omit<Test, 'id'>): Promise<Test> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(test),
    });
    if (!response.ok) throw new Error('Failed to create test');
    return response.json();
  },

  updateTest: async (id: number, test: Partial<Test>): Promise<Test> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(test),
    });
    if (!response.ok) throw new Error('Failed to update test');
    return response.json();
  },

  deleteTest: async (id: number): Promise<void> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete test');
  },
};
