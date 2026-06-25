import { api } from '../axios';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get('/users/me');
    return data;
  },
};
