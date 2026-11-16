import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { DocumentItem, DocumentShare, DocumentPermission, UserProfile } from '@/types';

// Pre-seeded Demo Users for local/testing convenience using standard RFC UUIDs
export const DEMO_USERS: Record<string, UserProfile> = {
  alex: {
    id: 'a1111111-1111-4111-8111-111111111111',
    email: 'alex@collabspace.io',
    full_name: 'Alex Rivera (Owner)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  },
  sarah: {
    id: 'b2222222-2222-4222-8222-222222222222',
    email: 'sarah@collabspace.io',
    full_name: 'Sarah Jenkins (Editor)',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  },
  david: {
    id: 'c3333333-3333-4333-8333-333333333333',
    email: 'david@collabspace.io',
    full_name: 'David Chen (Viewer)',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
};

const DEFAULT_DOC_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to CollabSpace' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Start drafting your ideas with ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'rich text formatting' },
        { type: 'text', text: ', real-time auto-saving, and collaborative permissions.' },
      ],
    },
  ],
};

const INITIAL_LOCAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-seed-1',
    title: 'Product Requirements Document (PRD) - CollabSpace',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'CollabSpace Product Vision' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'CollabSpace is a modern, lightweight collaborative document editor built with Next.js, TipTap, and Supabase.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Core Highlights' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Rich Text Formatting: ' },
                    { type: 'text', text: 'Headings, lists, blockquotes, code blocks, bold, italic, and underline.' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Smart Auto-Saving: ' },
                    { type: 'text', text: 'Debounced background synchronization with visual status indicators.' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Granular Permissions: ' },
                    { type: 'text', text: 'Distinguish between Owner, Editor, and Viewer access.' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    owner_id: DEMO_USERS.alex.id,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    permission: 'owner',
    owner: {
      email: DEMO_USERS.alex.email,
      full_name: DEMO_USERS.alex.full_name,
    },
    shared_count: 2,
  },
  {
    id: 'doc-seed-2',
    title: 'Engineering Architecture & Tech Stack',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'System Architecture' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This application utilizes Next.js App Router with server-ready and client-side data abstractions.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Database & Security' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'PostgreSQL Row Level Security (RLS) ensures documents are strictly isolated by owner and share records.',
            },
          ],
        },
      ],
    },
    owner_id: DEMO_USERS.alex.id,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    permission: 'owner',
    owner: {
      email: DEMO_USERS.alex.email,
      full_name: DEMO_USERS.alex.full_name,
    },
    shared_count: 0,
  },
  {
    id: 'doc-seed-3',
    title: 'Sprint 42 Retrospective & Action Items',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Sprint 42 Retrospective' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Reviewed release cadence and customer feedback regarding document search and export.',
            },
          ],
        },
      ],
    },
    owner_id: DEMO_USERS.sarah.id,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    permission: 'owner',
    owner: {
      email: DEMO_USERS.sarah.email,
      full_name: DEMO_USERS.sarah.full_name,
    },
    shared_count: 0,
  },
];

const INITIAL_LOCAL_SHARES: DocumentShare[] = [
  {
    id: 'share-1',
    document_id: 'doc-seed-1',
    shared_with_email: DEMO_USERS.sarah.email,
    shared_with_user_id: DEMO_USERS.sarah.id,
    permission: 'editor',
    created_at: new Date().toISOString(),
  },
  {
    id: 'share-2',
    document_id: 'doc-seed-1',
    shared_with_email: DEMO_USERS.david.email,
    shared_with_user_id: DEMO_USERS.david.id,
    permission: 'viewer',
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEY_DOCS = 'collabspace_docs_store_v2';
const STORAGE_KEY_SHARES = 'collabspace_shares_store_v2';

function getLocalStore(): { docs: DocumentItem[]; shares: DocumentShare[] } {
  if (typeof window === 'undefined') {
    return { docs: INITIAL_LOCAL_DOCUMENTS, shares: INITIAL_LOCAL_SHARES };
  }
  const storedDocs = localStorage.getItem(STORAGE_KEY_DOCS);
  const storedShares = localStorage.getItem(STORAGE_KEY_SHARES);

  let docs: DocumentItem[] = storedDocs ? JSON.parse(storedDocs) : INITIAL_LOCAL_DOCUMENTS;
  let shares: DocumentShare[] = storedShares ? JSON.parse(storedShares) : INITIAL_LOCAL_SHARES;

  // Auto-migrate any legacy non-UUID ids
  docs = docs.map((d) => {
    let ownerId = d.owner_id;
    if (ownerId === 'u-alex-1111-1111') ownerId = DEMO_USERS.alex.id;
    if (ownerId === 'u-sarah-2222-2222') ownerId = DEMO_USERS.sarah.id;
    if (ownerId === 'u-david-3333-3333') ownerId = DEMO_USERS.david.id;
    return { ...d, owner_id: ownerId };
  });

  shares = shares.map((s) => {
    let uid = s.shared_with_user_id;
    if (uid === 'u-alex-1111-1111') uid = DEMO_USERS.alex.id;
    if (uid === 'u-sarah-2222-2222') uid = DEMO_USERS.sarah.id;
    if (uid === 'u-david-3333-3333') uid = DEMO_USERS.david.id;
    return { ...s, shared_with_user_id: uid };
  });

  return { docs, shares };
}

function saveLocalStore(docs: DocumentItem[], shares: DocumentShare[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
  localStorage.setItem(STORAGE_KEY_SHARES, JSON.stringify(shares));
}

/**
 * Determines whether to query Supabase or use the local store.
 * Returns true ONLY if Supabase is configured AND the userId belongs to an active Supabase Auth session.
 * Demo users (Alex, Sarah, David) always use the local store so role testing never breaks.
 */
async function shouldUseSupabase(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  // If this userId is one of the built-in demo role switcher users, use the simulated store
  const isDemoRoleUser = Object.values(DEMO_USERS).some((u) => u.id === userId);
  if (isDemoRoleUser) return false;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return Boolean(session && session.user.id === userId);
  } catch {
    return false;
  }
}

// ==============================================================================
// Document Service Layer (Dual Supabase / Local Store Engine)
// ==============================================================================

export const documentService = {
  /**
   * Fetch all documents relevant to the current user (separated into owned & shared)
   */
  async getDocuments(userId: string, userEmail: string): Promise<{
    myDocuments: DocumentItem[];
    sharedDocuments: DocumentItem[];
  }> {
    const useSupabase = await shouldUseSupabase(userId);
    if (useSupabase && supabase) {
      // 1. Fetch owned documents
      const { data: ownedData, error: ownedErr } = await supabase
        .from('documents')
        .select('*, profiles:owner_id(email, full_name)')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (ownedErr) throw ownedErr;

      // 2. Fetch shared documents
      const { data: shareData, error: shareErr } = await supabase
        .from('document_shares')
        .select('document_id, permission, documents:document_id(*, profiles:owner_id(email, full_name))')
        .or(`shared_with_user_id.eq.${userId},shared_with_email.eq.${userEmail}`);

      if (shareErr) throw shareErr;

      const myDocuments: DocumentItem[] = (ownedData || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        owner_id: doc.owner_id,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        permission: 'owner',
        owner: doc.profiles,
      }));

      const sharedDocuments: DocumentItem[] = (shareData || [])
        .filter((s: any) => s.documents)
        .map((s: any) => ({
          id: s.documents.id,
          title: s.documents.title,
          content: s.documents.content,
          owner_id: s.documents.owner_id,
          created_at: s.documents.created_at,
          updated_at: s.documents.updated_at,
          permission: s.permission as DocumentPermission,
          owner: s.documents.profiles,
        }));

      return { myDocuments, sharedDocuments };
    }

    // Local / Offline Store Fallback
    const { docs, shares } = getLocalStore();

    const myDocs = docs
      .filter((d) => d.owner_id === userId)
      .map((d) => {
        const shareCount = shares.filter((s) => s.document_id === d.id).length;
        return { ...d, permission: 'owner' as DocumentPermission, shared_count: shareCount };
      });

    const userShares = shares.filter(
      (s) => s.shared_with_user_id === userId || s.shared_with_email.toLowerCase() === userEmail.toLowerCase()
    );

    const sharedDocs: DocumentItem[] = [];
    for (const share of userShares) {
      const doc = docs.find((d) => d.id === share.document_id);
      if (doc && doc.owner_id !== userId) {
        sharedDocs.push({
          ...doc,
          permission: share.permission,
        });
      }
    }

    return {
      myDocuments: myDocs,
      sharedDocuments: sharedDocs,
    };
  },

  /**
   * Fetch a single document by ID with permission check
   */
  async getDocument(docId: string, userId: string, userEmail: string): Promise<DocumentItem | null> {
    const useSupabase = await shouldUseSupabase(userId);
    if (useSupabase && supabase) {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*, profiles:owner_id(email, full_name)')
        .eq('id', docId)
        .single();

      if (error || !doc) return null;

      let permission: DocumentPermission = 'viewer';
      if (doc.owner_id === userId) {
        permission = 'owner';
      } else {
        const { data: share } = await supabase
          .from('document_shares')
          .select('permission')
          .eq('document_id', docId)
          .or(`shared_with_user_id.eq.${userId},shared_with_email.eq.${userEmail}`)
          .maybeSingle();

        if (!share) return null; // No access
        permission = share.permission as DocumentPermission;
      }

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        owner_id: doc.owner_id,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        permission,
        owner: doc.profiles,
      };
    }

    // Local Store Fallback
    const { docs, shares } = getLocalStore();
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return null;

    if (doc.owner_id === userId) {
      return { ...doc, permission: 'owner' };
    }

    const share = shares.find(
      (s) =>
        s.document_id === docId &&
        (s.shared_with_user_id === userId || s.shared_with_email.toLowerCase() === userEmail.toLowerCase())
    );

    if (!share) return null; // Forbidden

    return {
      ...doc,
      permission: share.permission,
    };
  },

  /**
   * Create a new document
   */
  async createDocument(
    title: string = 'Untitled Document',
    content: any = DEFAULT_DOC_CONTENT,
    userId: string,
    userEmail: string
  ): Promise<DocumentItem> {
    const useSupabase = await shouldUseSupabase(userId);
    if (useSupabase && supabase) {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          content,
          owner_id: userId,
        })
        .select('*, profiles:owner_id(email, full_name)')
        .single();

      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        permission: 'owner',
        owner: data.profiles,
      };
    }

    // Local Store
    const { docs, shares } = getLocalStore();
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      content,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permission: 'owner',
      owner: {
        email: userEmail,
        full_name: userEmail.split('@')[0],
      },
      shared_count: 0,
    };

    docs.unshift(newDoc);
    saveLocalStore(docs, shares);
    return newDoc;
  },

  /**
   * Update document (only Owner or Editor)
   */
  async updateDocument(
    docId: string,
    updates: { title?: string; content?: any },
    userId: string,
    userEmail: string
  ): Promise<DocumentItem> {
    const useSupabase = await shouldUseSupabase(userId);
    if (useSupabase && supabase) {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', docId)
        .select('*, profiles:owner_id(email, full_name)')
        .single();

      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        permission: data.owner_id === userId ? 'owner' : 'editor',
        owner: data.profiles,
      };
    }

    // Local Store
    const { docs, shares } = getLocalStore();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) throw new Error('Document not found');

    const currentDoc = docs[index];

    // Permission check
    const isOwner = currentDoc.owner_id === userId;
    const isEditor = shares.some(
      (s) =>
        s.document_id === docId &&
        (s.shared_with_user_id === userId || s.shared_with_email.toLowerCase() === userEmail.toLowerCase()) &&
        s.permission === 'editor'
    );

    if (!isOwner && !isEditor) {
      throw new Error('Unauthorized: Viewer permissions cannot edit documents');
    }

    const updatedDoc: DocumentItem = {
      ...currentDoc,
      ...updates,
      updated_at: new Date().toISOString(),
      permission: isOwner ? 'owner' : 'editor',
    };

    docs[index] = updatedDoc;
    saveLocalStore(docs, shares);
    return updatedDoc;
  },

  /**
   * Delete a document (Owner only)
   */
  async deleteDocument(docId: string, userId: string): Promise<boolean> {
    const useSupabase = await shouldUseSupabase(userId);
    if (useSupabase && supabase) {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)
        .eq('owner_id', userId);

      if (error) throw error;
      return true;
    }

    // Local Store
    const { docs, shares } = getLocalStore();
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return false;
    if (doc.owner_id !== userId) {
      throw new Error('Unauthorized: Only document owner can delete this document');
    }

    const newDocs = docs.filter((d) => d.id !== docId);
    const newShares = shares.filter((s) => s.document_id !== docId);
    saveLocalStore(newDocs, newShares);
    return true;
  },

  /**
   * Get shares for a document
   */
  async getDocumentShares(docId: string, _userId: string): Promise<DocumentShare[]> {
    const useSupabase = await shouldUseSupabase(_userId);
    if (useSupabase && supabase) {
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', docId);

      if (error) throw error;
      return data || [];
    }

    const { shares } = getLocalStore();
    return shares.filter((s) => s.document_id === docId);
  },

  /**
   * Add or update share permission
   */
  async shareDocument(
    docId: string,
    sharedWithEmail: string,
    permission: 'viewer' | 'editor',
    ownerId: string
  ): Promise<DocumentShare> {
    const cleanEmail = sharedWithEmail.trim().toLowerCase();

    const useSupabase = await shouldUseSupabase(ownerId);
    if (useSupabase && supabase) {
      // Find if user already has an account
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      const { data, error } = await supabase
        .from('document_shares')
        .upsert(
          {
            document_id: docId,
            shared_with_email: cleanEmail,
            shared_with_user_id: profile?.id || null,
            permission,
          },
          { onConflict: 'document_id,shared_with_email' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Local Store
    const { docs, shares } = getLocalStore();
    const doc = docs.find((d) => d.id === docId);
    if (!doc || doc.owner_id !== ownerId) {
      throw new Error('Only the owner can manage sharing permissions');
    }

    // Check if matched demo user
    const matchedUser = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    const existingIndex = shares.findIndex(
      (s) => s.document_id === docId && s.shared_with_email.toLowerCase() === cleanEmail
    );

    let updatedShare: DocumentShare;
    if (existingIndex >= 0) {
      shares[existingIndex].permission = permission;
      updatedShare = shares[existingIndex];
    } else {
      updatedShare = {
        id: `share-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        document_id: docId,
        shared_with_email: cleanEmail,
        shared_with_user_id: matchedUser ? matchedUser.id : null,
        permission,
        created_at: new Date().toISOString(),
      };
      shares.push(updatedShare);
    }

    saveLocalStore(docs, shares);
    return updatedShare;
  },

  /**
   * Revoke share
   */
  async removeShare(shareId: string, ownerId: string): Promise<boolean> {
    const useSupabase = await shouldUseSupabase(ownerId);
    if (useSupabase && supabase) {
      const { error } = await supabase
        .from('document_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      return true;
    }

    const { docs, shares } = getLocalStore();
    const shareIndex = shares.findIndex((s) => s.id === shareId);
    if (shareIndex === -1) return false;

    const doc = docs.find((d) => d.id === shares[shareIndex].document_id);
    if (!doc || doc.owner_id !== ownerId) {
      throw new Error('Only document owner can revoke access');
    }

    shares.splice(shareIndex, 1);
    saveLocalStore(docs, shares);
    return true;
  },
};
