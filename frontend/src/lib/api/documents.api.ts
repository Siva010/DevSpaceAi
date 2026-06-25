import { api } from '../axios';

export interface Document {
  id: string;
  title: string;
  content?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export const documentsApi = {
  getDocuments: async (): Promise<Document[]> => {
    const { data } = await api.get('/documents');
    return data;
  },

  getDocument: async (id: string): Promise<Document & { versions?: { id: string; content: string; createdAt: string }[] }> => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  createDocument: async (payload: { title: string; content?: string }): Promise<Document> => {
    const { data } = await api.post('/documents', payload);
    return data;
  },

  updateDocument: async (id: string, payload: { title?: string; content?: string }): Promise<Document> => {
    const { data } = await api.patch(`/documents/${id}`, payload);
    return data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
