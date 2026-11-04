import { demoAdapter } from '../../../demo/browser-api';
import axios from 'axios';
import { AuthResponse, Grievance, GrievanceDetail, StatusUpdatePayload, User, CivicFeedItem, CivicFeedResponse } from '../types/api';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  ...(import.meta.env.VITE_DEMO_MODE === 'true' ? { adapter: demoAdapter } : {}),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicos_officer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('civicos_officer_token');
      localStorage.removeItem('civicos_officer_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (email: string, password: string):Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  // Officer Operations
  getOfficerGrievances: async (params?: {
    status?: string;
    department?: string;
    priority?: string;
  }): Promise<Grievance[]> => {
    const cleanParams: Record<string, string> = {};
    if (params?.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params?.department && params.department !== 'ALL') cleanParams.department = params.department;
    if (params?.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;

    const res = await apiClient.get<Grievance[]>('/officer/grievances', {
      params: cleanParams,
    });
    return res.data;
  },

  getOfficerGrievanceDetail: async (id: string | number): Promise<GrievanceDetail> => {
    const res = await apiClient.get<GrievanceDetail>(`/officer/grievances/${id}`);
    return res.data;
  },

  updateGrievanceStatus: async (
    id: string | number,
    payload: StatusUpdatePayload
  ): Promise<GrievanceDetail> => {
    const res = await apiClient.patch<GrievanceDetail>(
      `/officer/grievances/${id}/status`,
      payload
    );
    return res.data;
  },

  // Civic Feed & Impact Operations
  getCivicImpactFeed: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    priority?: string;
    search?: string;
    sort_by?: string;
    language?: string;
  }): Promise<CivicFeedResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params?.page) cleanParams.page = params.page;
    if (params?.limit) cleanParams.limit = params.limit;
    if (params?.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params?.department && params.department !== 'ALL') cleanParams.department = params.department;
    if (params?.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
    if (params?.search) cleanParams.search = params.search;
    if (params?.sort_by) cleanParams.sort_by = params.sort_by;
    if (params?.language) cleanParams.language = params.language;

    const res = await apiClient.get<CivicFeedResponse>('/feed', { params: cleanParams });
    return res.data;
  },

  getFeedItem: async (id: string | number): Promise<CivicFeedItem> => {
    const res = await apiClient.get<CivicFeedItem>(`/feed/${id}`);
    return res.data;
  },

  // Health check
  checkHealth: async (): Promise<{ status: string; service: string }> => {
    const res = import.meta.env.VITE_DEMO_MODE === 'true' ? await demoAdapter({ url: '/health' }) : await axios.get('http://localhost:8000/health', { timeout: 3000 });
    return res.data;
  }
};


export default apiService;
