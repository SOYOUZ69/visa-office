import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Meta API
export const metaAPI = {
  getClientStatuses: async () => {
    const response = await api.get('/api/v1/meta/client-statuses');
    return response.data;
  },
  getVisaTypes: async () => {
    const response = await api.get('/api/v1/meta/visa-types');
    return response.data;
  },
  getAttachmentTypes: async () => {
    const response = await api.get('/api/v1/meta/attachment-types');
    return response.data;
  },
  getServiceTypes: async () => {
    const response = await api.get('/api/v1/meta/service-types');
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  create: async (data: any) => {
    const response = await api.post('/api/v1/clients', data);
    return response.data;
  },
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/clients', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/clients/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/clients/${id}`);
    return response.data;
  },
  addFamilyMember: async (clientId: string, data: any) => {
    const response = await api.post(`/api/v1/clients/${clientId}/family-members`, data);
    return response.data;
  },
  removeFamilyMember: async (id: string) => {
    const response = await api.delete(`/api/v1/family-members/${id}`);
    return response.data;
  },
};

// Attachments API
export const attachmentsAPI = {
  upload: async (clientId: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post(`/api/v1/clients/${clientId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getByClient: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/attachments`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/attachments/${id}`);
    return response.data;
  },
  download: async (id: string) => {
    const response = await api.get(`/api/v1/attachments/${id}/file`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getClientServices: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/services`);
    return response.data;
  },
  createService: async (clientId: string, data: any) => {
    const response = await api.post(`/api/v1/clients/${clientId}/service`, data);
    return response.data;
  },
  createManyServices: async (clientId: string, data: any) => {
    const response = await api.post(`/api/v1/clients/${clientId}/services`, data);
    return response.data;
  },
  updateService: async (serviceId: string, data: any) => {
    const response = await api.patch(`/api/v1/services/${serviceId}`, data);
    return response.data;
  },
  deleteService: async (serviceId: string) => {
    const response = await api.delete(`/api/v1/services/${serviceId}`);
    return response.data;
  },
};
