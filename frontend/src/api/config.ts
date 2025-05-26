import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

const resultsApi = axios.create({
  baseURL: import.meta.env.VITE_RESULTS_URL || '/results',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api, resultsApi };
