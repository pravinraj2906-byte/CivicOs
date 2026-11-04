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

export interface CitizenProfile {
  id: number;
  user_id: number;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  income_range?: string | null;
  location?: string | null;
  residence_type?: 'urban' | 'rural' | string | null;
  family_context?: string | null;
  is_bpl?: boolean | null;
  has_disability?: boolean | null;
  interests?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CitizenWithProfile extends User {
  profile?: CitizenProfile | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type GrievancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GrievanceStatus = 'SUBMITTED' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface GrievanceUpdate {
  id: number;
  grievance_id: number;
  officer_id?: number | null;
  status: GrievanceStatus;
  remarks?: string | null;
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
  department: string;
  status: GrievanceStatus;
  assigned_officer_id?: number | null;
  ai_summary?: string | null;
  urgency_score?: number | null;
  suggested_initial_action?: string | null;
  key_entities?: string[] | null;
  ai_source?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrievanceDetail extends Grievance {
  citizen?: User | null;
  assigned_officer?: User | null;
  updates: GrievanceUpdate[];
}

export interface GrievanceCreatePayload {
  title: string;
  description: string;
  location?: string;
  landmark?: string;
  category?: string;
}

// -------------------------------------------------------------
// Scheme Interfaces
// -------------------------------------------------------------
export interface Scheme {
  id: number;
  code: string;
  name: string;
  description: string;
  state: string;
  category: string;
  department?: string | null;
  target_groups?: string | null;
  eligibility_criteria?: string | null;
  eligibility_rules?: string | null;
  benefits?: string | null;
  required_documents?: string | null;
  official_portal?: string | null;
  application_steps?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  last_verified?: string | null;
  name_ta?: string | null;
  description_ta?: string | null;
  benefits_ta?: string | null;
  eligibility_criteria_ta?: string | null;
  application_steps_ta?: string | null;
  is_active: boolean;
  created_at: string;
  target_groups_list?: string[];
  required_documents_list?: string[];
}

export interface SchemeEligibilityCheckRequest {
  age?: number | null;
  gender?: string | null;
  is_student?: boolean | null;
  occupation?: string | null;
  income_range?: string | null;
  annual_income?: number | null;
  is_bpl?: boolean | null;
  is_farmer?: boolean | null;
  has_disability?: boolean | null;
  state?: string | null;
  district?: string | null;
  residence_type?: string | null;
  senior_citizen?: boolean | null;
  language?: string;
}

export interface SchemeEligibilityMatchItem {
  scheme_id: number;
  scheme_code: string;
  scheme_name: string;
  category: string;
  eligibility_status: 'LIKELY_ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'MORE_INFO_NEEDED';
  confidence: number;
  why_you_qualify: string;
  benefits_summary?: string | null;
  required_documents: string[];
  application_steps?: string | null;
  official_portal?: string | null;
  source_name?: string | null;
  missing_information: string[];
}

export interface SchemeEligibilityCheckResponse {
  citizen_context_summary: string;
  matches: SchemeEligibilityMatchItem[];
  explanation?: string | null;
  source: string;
}

export interface SchemeAssistantRequest {
  query: string;
  citizen_profile?: Record<string, any> | null;
  language?: string;
}

export interface SchemeAssistantResponse {
  answer: string;
  matches: SchemeEligibilityMatchItem[];
  suggested_prompts: string[];
  source: string;
}

export interface SchemeRecommendationItem {
  scheme_id: number;
  scheme_code: string;
  scheme_name: string;
  category: string;
  match_confidence: number;
  why_you_qualify: string;
  potential_benefits?: string | null;
  application_steps?: string | null;
  official_portal?: string | null;
}

export interface SchemeRecommendationResponse {
  citizen_id: number;
  generated_at: string;
  citizen_context_summary: string;
  recommendations: SchemeRecommendationItem[];
}

// -------------------------------------------------------------
// Civic Feed Interfaces
// -------------------------------------------------------------
export interface FeedAuthor {
  display_name: string;
  avatar_url?: string | null;
  district?: string | null;
  state?: string | null;
}

export interface FeedTimelineEvent {
  id: number;
  status: string;
  stage: 'CITIZEN_REPORT' | 'AI_TRIAGE' | 'OFFICIAL_UPDATE' | 'RESOLUTION' | string;
  label: string;
  label_ta?: string | null;
  remarks?: string | null;
  department?: string | null;
  created_at: string;
}

export interface CivicFeedItem {
  id: number;
  grievance_id: number;
  tracking_id: string;
  author: FeedAuthor;
  title: string;
  description: string;
  location?: string | null;
  landmark?: string | null;
  category: string;
  department: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  urgency_score?: number | null;
  ai_summary?: string | null;
  suggested_initial_action?: string | null;
  key_entities?: string[] | null;
  is_verified: boolean;
  community_count: number;
  confirmed_by_current_user: boolean;
  created_at: string;
  updated_at: string;
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

export interface ConfirmationResponse {
  grievance_id: number;
  tracking_id: string;
  community_count: number;
  confirmed: boolean;
  message: string;
}

export interface FeedFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  department?: string;
  priority?: string;
  search?: string;
  sort_by?: 'recent' | 'impact' | 'urgency';
  language?: string;
}

