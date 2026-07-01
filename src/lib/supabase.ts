import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SiteSetting = {
  id: string;
  key: string;
  value: string | null;
  label: string;
  section: string;
  type: 'text' | 'textarea' | 'boolean' | 'url' | 'image';
  sort_order: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSession = {
  id: string;
  title: string;
  description: string | null;
  session_type: string;
  axis: string | null;
  start_time: string | null;
  end_time: string | null;
  event_date: string | null;
  room: string | null;
  speakers_text: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type EventSpeaker = {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  sector: string | null;
  category: string;
  bio: string | null;
  photo_url: string | null;
  session_title: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type EventAlly = {
  id: string;
  name: string;
  ally_type: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type EventResource = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  resource_type: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type EventRegistration = {
  id: string;
  name: string;
  organization: string | null;
  role: string | null;
  email: string;
  phone: string | null;
  sector: string | null;
  modality: string | null;
  accepted_conduct: boolean;
  accepted_data: boolean;
  created_at: string;
};
