export type DocumentPermission = 'owner' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: any; // TipTap JSON structure or text
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  owner?: {
    email: string;
    full_name?: string | null;
  };
  permission: DocumentPermission;
  shared_count?: number;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_with_email: string;
  shared_with_user_id?: string | null;
  permission: 'viewer' | 'editor';
  created_at: string;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
