import { api } from '../axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
  message?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/register', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
