import { api } from '../axios';

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  status?: string;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    // The x-workspace-slug header is added automatically by the axios interceptor
    const { data } = await api.get('/projects');
    return data;
  },

  getProject: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  createProject: async (payload: { name: string; key: string; description?: string }): Promise<Project> => {
    const { data } = await api.post('/projects', payload);
    return data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
