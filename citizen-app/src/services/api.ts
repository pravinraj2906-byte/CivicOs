import { demoAdapter } from '../../../demo/browser-api';
import axios from 'axios';
import {
  AuthResponse,
  CitizenProfile,
  CitizenWithProfile,
  CivicFeedItem,
  CivicFeedResponse,
  ConfirmationResponse,
  FeedFilterParams,
  Grievance,
  GrievanceCreatePayload,
  GrievanceDetail,
  Scheme,
  SchemeEligibilityCheckRequest,
  SchemeEligibilityCheckResponse,
  SchemeAssistantRequest,
  SchemeAssistantResponse,
  SchemeRecommendationResponse,
  User,
} from '../types/api';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  ...(import.meta.env.VITE_DEMO_MODE === 'true' ? { adapter: demoAdapter } : {}),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicos_citizen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('civicos_citizen_token');
      localStorage.removeItem('civicos_citizen_user');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    state?: string;
    district?: string;
    preferred_language?: string;
  }): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', {
      ...payload,
      role: 'citizen',
    });
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  // Citizen Twin & Profile
  getCitizenDetails: async (): Promise<CitizenWithProfile> => {
    const res = await apiClient.get<CitizenWithProfile>('/citizens/me');
    return res.data;
  },

  updateCitizenProfile: async (payload: Partial<CitizenProfile>): Promise<CitizenProfile> => {
    const res = await apiClient.put<CitizenProfile>('/citizens/me/profile', payload);
    return res.data;
  },

  // Grievance Operations
  getMyGrievances: async (): Promise<Grievance[]> => {
    const res = await apiClient.get<Grievance[]>('/citizens/me/grievances');
    return res.data;
  },

  submitGrievance: async (payload: GrievanceCreatePayload): Promise<GrievanceDetail> => {
    const res = await apiClient.post<GrievanceDetail>('/grievances', payload);
    return res.data;
  },

  getGrievanceDetail: async (id: string | number): Promise<GrievanceDetail> => {
    const res = await apiClient.get<GrievanceDetail>(`/grievances/${id}`);
    return res.data;
  },

  submitResolutionFeedback: async (
    id: string | number,
    payload: { is_resolved: boolean; rating?: string; comment?: string }
  ): Promise<GrievanceDetail> => {
    const res = await apiClient.post<GrievanceDetail>(`/citizens/me/grievances/${id}/feedback`, payload);
    return res.data;
  },

  // Welfare Schemes & Citizen Benefits Assistant
  getSchemes: async (params?: {
    category?: string;
    state?: string;
    target_group?: string;
    search?: string;
    language?: string;
  }): Promise<Scheme[]> => {
    const res = await apiClient.get<Scheme[]>('/schemes', { params });
    return res.data;
  },

  getSchemeDetail: async (id: number, language: string = 'en'): Promise<Scheme> => {
    const res = await apiClient.get<Scheme>(`/schemes/${id}`, { params: { language } });
    return res.data;
  },

  checkSchemeEligibility: async (
    payload: SchemeEligibilityCheckRequest
  ): Promise<SchemeEligibilityCheckResponse> => {
    const res = await apiClient.post<SchemeEligibilityCheckResponse>('/schemes/eligibility', payload);
    return res.data;
  },

  askSchemeAssistant: async (
    payload: SchemeAssistantRequest
  ): Promise<SchemeAssistantResponse> => {
    const res = await apiClient.post<SchemeAssistantResponse>('/schemes/assistant', payload);
    return res.data;
  },

  getSchemeRecommendations: async (): Promise<SchemeRecommendationResponse> => {
    const res = await apiClient.get<SchemeRecommendationResponse>('/citizens/me/recommendations');
    return res.data;
  },

  // -----------------------------------------------------------
  // Civic Feed & Community Impact Operations
  // -----------------------------------------------------------
  getCivicFeed: async (params: FeedFilterParams = {}): Promise<CivicFeedResponse> => {
    const res = await apiClient.get<CivicFeedResponse>('/feed', { params });
    return res.data;
  },

  getFeedItem: async (id: string | number, language: string = 'en'): Promise<CivicFeedItem> => {
    const res = await apiClient.get<CivicFeedItem>(`/feed/${id}`, {
      params: { language },
    });
    return res.data;
  },

  confirmProblem: async (id: string | number): Promise<ConfirmationResponse> => {
    const res = await apiClient.post<ConfirmationResponse>(`/feed/${id}/confirm`);
    return res.data;
  },

  removeConfirmation: async (id: string | number): Promise<ConfirmationResponse> => {
    const res = await apiClient.delete<ConfirmationResponse>(`/feed/${id}/confirm`);
    return res.data;
  },

  // Health Check
  checkHealth: async (): Promise<{ status: string; service: string }> => {
    const res = import.meta.env.VITE_DEMO_MODE === 'true' ? await demoAdapter({ url: '/health' }) : await axios.get('http://localhost:8000/health', { timeout: 3000 });
    return res.data;
  },
};

export default apiService;

