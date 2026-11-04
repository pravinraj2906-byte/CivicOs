export type ServiceIconName =
  | 'FileText'
  | 'CreditCard'
  | 'Award'
  | 'Car'
  | 'Compass'
  | 'FileCheck'
  | 'Home'
  | 'Users'
  | 'Zap'
  | 'Shield';

export interface GovernmentService {
  id: string;
  slug: string;
  title: string;
  title_ta: string;
  category: string;
  category_ta: string;
  short_desc: string;
  short_desc_ta: string;
  icon_name: ServiceIconName;
  what_is_it: string;
  what_is_it_ta: string;
  who_can_apply: string[];
  who_can_apply_ta: string[];
  documents_required: string[];
  documents_required_ta: string[];
  application_steps: string[];
  application_steps_ta: string[];
  fields_to_fill: string[];
  fields_to_fill_ta: string[];
  fees: string;
  fees_ta: string;
  processing_time: string;
  processing_time_ta: string;
  checklist_warnings: string[];
  checklist_warnings_ta: string[];
  official_portal_name: string;
  official_portal_url: string;
  official_source?: string;
  last_verified?: string;
  is_popular?: boolean;
  is_new?: boolean;
  tags: string[];
  tags_ta: string[];
  searchKeywords?: string[];
  searchKeywords_ta?: string[];
}

export interface ServiceSearchResult {
  service: GovernmentService;
  matchScore: number;
  matchedOn: 'title' | 'tag' | 'keyword' | 'category' | 'description';
}

export interface ServiceAssistantMessage {
  id: string;
  sender: 'citizen' | 'civicos';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}
