export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  state?: string | null;
  district?: string | null;
  preferred_language?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type GrievancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GrievanceStatus = 'SUBMITTED' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type DepartmentType =
  | 'Public_Works'
  | 'Water_Sanitation'
  | 'Electricity_Board'
  | 'Health_Dept'
  | 'Municipal_Corp';

export interface GrievanceUpdate {
  id: number;
  grievance_id: number;
  officer_id: number | null;
  status: GrievanceStatus;
  remarks: string | null;
  created_at: string;
  officer?: User | null;
}

export interface Grievance {
  id: number;
  tracking_id: string;
  citizen_id: number;
  title: string;
  description: string;
  location?: string | null;
  landmark?: string | null;
  category: string;
  priority: GrievancePriority;
  department: DepartmentType | string;
  status: GrievanceStatus;
  assigned_officer_id?: number | null;
  ai_summary?: string | null;
  urgency_score?: number | null;
  suggested_initial_action?: string | null;
  key_entities?: string[] | null;
  ai_source?: string | null;
  community_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GrievanceDetail extends Grievance {
  citizen?: User | null;
  assigned_officer?: User | null;
  updates: GrievanceUpdate[];
}

export interface StatusUpdatePayload {
  status: GrievanceStatus;
  remarks?: string;
}

export interface FeedAuthor {
  id: number;
  display_name: string;
  avatar_url?: string | null;
  district?: string | null;
  state?: string | null;
}

export interface FeedTimelineEvent {
  id: number;
  status: GrievanceStatus;
  label: string;
  label_ta: string;
  remarks?: string | null;
  officer_name?: string | null;
  department?: string | null;
  created_at: string;
}

export interface CivicFeedItem {
  id: number;
  tracking_id: string;
  title: string;
  description: string;
  location?: string | null;
  landmark?: string | null;
  category: string;
  priority: GrievancePriority;
  department: string;
  status: GrievanceStatus;
  urgency_score?: number | null;
  ai_summary?: string | null;
  key_entities?: string[] | null;
  community_count: number;
  confirmed_by_current_user: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  author: FeedAuthor;
  timeline: FeedTimelineEvent[];
}

export interface CivicFeedResponse {
  items: CivicFeedItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

