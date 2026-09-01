-- ====================================================================
-- AYUTH - Supabase PostgreSQL Database Schema
-- Run this in your Supabase Dashboard SQL Editor
-- ====================================================================

-- 1. Invention Locker Records Table (Proof of Conception & Video Proofs)
CREATE TABLE IF NOT EXISTS public.ayuth_locker_records (
    id BIGSERIAL PRIMARY KEY,
    record_id VARCHAR(64) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    master_sha256 VARCHAR(64) NOT NULL,
    timestamp_utc VARCHAR(32) NOT NULL,
    total_files INT DEFAULT 0,
    documents_count INT DEFAULT 0,
    images_count INT DEFAULT 0,
    videos_count INT DEFAULT 0,
    total_size_formatted VARCHAR(32) DEFAULT 'Verified',
    files JSONB DEFAULT '[]'::jsonb,
    receipt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast record lookups
CREATE INDEX IF NOT EXISTS idx_ayuth_locker_record_id ON public.ayuth_locker_records (record_id);
CREATE INDEX IF NOT EXISTS idx_ayuth_locker_created_at ON public.ayuth_locker_records (created_at DESC);

-- 2. Custom Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS public.ayuth_knowledge_docs (
    id VARCHAR(64) PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    citation TEXT,
    jurisdiction JSONB DEFAULT '["india", "international"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for knowledge retrieval
CREATE INDEX IF NOT EXISTS idx_ayuth_kb_category ON public.ayuth_knowledge_docs (category);

-- 3. Row Level Security (RLS) Policies (Permissive for public API / protected via Service Role Key)
ALTER TABLE public.ayuth_locker_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayuth_knowledge_docs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / service role reads and inserts
CREATE POLICY "Allow public read on locker records" ON public.ayuth_locker_records
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on locker records" ON public.ayuth_locker_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on knowledge docs" ON public.ayuth_knowledge_docs
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on knowledge docs" ON public.ayuth_knowledge_docs
    FOR INSERT WITH CHECK (true);

-- 4. Supabase Storage Bucket for Evidence Proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('ayuth_evidence', 'ayuth_evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public evidence upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'ayuth_evidence');

CREATE POLICY "Allow public evidence download" ON storage.objects
    FOR SELECT USING (bucket_id = 'ayuth_evidence');
