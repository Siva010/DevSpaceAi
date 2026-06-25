import { api } from '../axios';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
}

export const membersApi = {
  getMembers: async (slug: string): Promise<Member[]> => {
    const { data } = await api.get(`/organizations/${slug}/members`);
    return data;
  },

  addMember: async (slug: string, payload: { email: string; role?: string }): Promise<Member> => {
    const { data } = await api.post(`/organizations/${slug}/members`, payload);
    return data;
  },
};
