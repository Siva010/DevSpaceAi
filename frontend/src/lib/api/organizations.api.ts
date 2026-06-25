import { api } from '../axios';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  role?: string;
  membersCount?: number;
}

export const organizationsApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    const { data } = await api.get('/organizations');
    return data;
  },

  createOrganization: async (payload: { name: string; slug: string }): Promise<Organization> => {
    const { data } = await api.post('/organizations', payload);
    return data;
  },

  updateName: async (slug: string, name: string): Promise<Organization> => {
    const { data } = await api.patch(`/organizations/${slug}`, { name });
    return data;
  },

  deleteOrganization: async (slug: string): Promise<void> => {
    await api.delete(`/organizations/${slug}`);
  },
};

