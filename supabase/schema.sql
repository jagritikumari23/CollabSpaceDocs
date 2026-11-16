-- ==============================================================================
-- CollabSpace: Production Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Document Shares Table
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  permission TEXT NOT NULL CHECK (permission IN ('viewer', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, shared_with_email)
);

-- Indexes for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_shares_doc_id ON public.document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON public.document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_email ON public.document_shares(shared_with_email);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS Policies: Profiles
-- ==============================================================================
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ==============================================================================
-- RLS Policies: Documents
-- ==============================================================================
-- View: Owner OR explicitly shared user
CREATE POLICY "Users can view owned or shared documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM public.document_shares
      WHERE shared_with_user_id = auth.uid()
         OR shared_with_email = auth.jwt() ->> 'email'
    )
  );

-- Create: Authenticated users can create documents where they are owner
CREATE POLICY "Users can create their own documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Update: Owner OR user with 'editor' permission
CREATE POLICY "Owners and Editors can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM public.document_shares
      WHERE (shared_with_user_id = auth.uid() OR shared_with_email = auth.jwt() ->> 'email')
        AND permission = 'editor'
    )
  );

-- Delete: Only Owner can delete
CREATE POLICY "Only owners can delete documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ==============================================================================
-- RLS Policies: Document Shares
-- ==============================================================================
-- View: Document Owner OR the shared user
CREATE POLICY "Users can view shares for their documents or shared to them"
  ON public.document_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_user_id = auth.uid() OR
    shared_with_email = auth.jwt() ->> 'email' OR
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Insert: Document owner can share document
CREATE POLICY "Only owners can add shares"
  ON public.document_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Update: Document owner can modify permissions
CREATE POLICY "Only owners can update shares"
  ON public.document_shares FOR UPDATE
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Delete: Document owner can revoke access
CREATE POLICY "Only owners can revoke shares"
  ON public.document_shares FOR DELETE
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- Triggers and Automation
-- ==============================================================================

-- 1. Automatically update updated_at on documents
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Automatically create profile row when user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  -- Also link any pending document_shares to this new user_id
  UPDATE public.document_shares
  SET shared_with_user_id = NEW.id
  WHERE shared_with_email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
