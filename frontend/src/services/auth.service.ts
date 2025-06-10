import axios from 'axios';
import { API_CONFIG } from '@/config/api';

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
}

// Cookie helper functions
const setCookie = (name: string, value: string, hours: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;
  private initialized = false;
  private interceptorsSetup = false;

  private constructor() {
    // Load token and user from cookies on initialization
    this.token = getCookie('token');
    const userData = getCookie('user');
    this.user = userData ? JSON.parse(decodeURIComponent(userData)) : null;

    // Set axios headers immediately if we have a token
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    this.initialized = true;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, loginData);
      const { token, user } = response.data;

      this.token = token;
      this.user = user;

      // Store in cookies for 3 hours
      setCookie('token', token, 3);
      setCookie('user', encodeURIComponent(JSON.stringify(user)), 3);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/signup`, signupData);
      const { token, user } = response.data;

      this.token = token;
      this.user = user;

      // Store in cookies for 3 hours
      setCookie('token', token, 3);
      setCookie('user', encodeURIComponent(JSON.stringify(user)), 3);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;

    // Remove from cookies
    deleteCookie('token');
    deleteCookie('user');

    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Set up axios interceptor for token
  setupInterceptors(): void {
    // Only setup interceptors once
    if (this.interceptorsSetup) {
      return;
    }

    // Ensure token is set in headers if available
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    this.interceptorsSetup = true;
  }
}

export const authService = AuthService.getInstance();
