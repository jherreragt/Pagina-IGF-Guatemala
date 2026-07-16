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

export type EventEdition = {
  id: string;
  year: string;
  title: string;
  lema: string | null;
  event_date: string | null;
  event_location: string;
  event_modality: string;
  datetime_iso: string | null;
  registration_open: boolean;
  sessions_open: boolean;
  is_active: boolean;
  created_at: string;
};

export type EventSession = {
  id: string;
  edition_id: string | null;
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
  edition_id: string | null;
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
  edition_id: string | null;
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
  edition_id: string | null;
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
  edition_id: string | null;
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

// ── Forum types ────────────────────────────────────────────────────────
export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  thread_count: number;
  created_at: string;
  updated_at: string;
};

export type ForumThread = {
  id: string;
  category_id: string;
  author_id: string | null;
  author_name: string;
  title: string;
  body: string;
  is_closed: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: number;
  reply_count: number;
  reaction_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type ForumPost = {
  id: string;
  thread_id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  is_hidden: boolean;
  reaction_count: number;
  created_at: string;
  updated_at: string;
};

export type ForumReaction = {
  id: string;
  user_id: string;
  target_type: 'thread' | 'post';
  target_id: string;
  reaction: string;
  created_at: string;
};

export type ForumReport = {
  id: string;
  reporter_id: string | null;
  target_type: 'thread' | 'post';
  target_id: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  admin_notes: string;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string;
};

export type ForumRule = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumAdmin = {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
};
