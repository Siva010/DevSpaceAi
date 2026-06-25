import { api } from '../axios';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: number;
  order: number;
  assigneeId?: string | null;
  creatorId: string;
  projectId: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; fullName: string | null; email: string } | null;
  creator?: { id: string; fullName: string | null; email: string };
}

export const PRIORITY_MAP: Record<number, string> = {
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

export const STATUS_MAP: Record<string, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
};

export const STATUS_REVERSE_MAP: Record<string, string> = {
  'todo': 'TODO',
  'in-progress': 'IN_PROGRESS',
  'review': 'REVIEW',
  'done': 'DONE',
};

export const tasksApi = {
  getTasks: async (projectId?: string): Promise<Task[]> => {
    const params = projectId ? `?projectId=${projectId}` : '';
    const { data } = await api.get(`/tasks${params}`);
    return data;
  },

  createTask: async (payload: {
    title: string;
    description?: string;
    projectId: string;
    status?: string;
    priority?: number;
    order?: number;
    assigneeId?: string;
    dueDate?: string;
  }): Promise<Task> => {
    const { data } = await api.post('/tasks', payload);
    return data;
  },

  updateTaskStatus: async (id: string, status: string, order?: number): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status, order });
    return data;
  },

  updateTask: async (id: string, payload: Partial<{
    title: string;
    description: string;
    status: string;
    priority: number;
    assigneeId: string;
    dueDate: string;
  }>): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
