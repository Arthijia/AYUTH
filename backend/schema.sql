-- PostgreSQL & Supabase Database Schema with pgvector for AYUTH RAG

-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Knowledge Base Chunks (Ayurvedic IP, Patent Law, TKDL, NBA, International Treaties)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    citation TEXT NOT NULL,
    jurisdiction TEXT[] DEFAULT ARRAY['india', 'international'],
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on embedding for fast cosine distance search
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx 
ON knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 2. Invention Profiles (Classified by Inventors)
CREATE TABLE IF NOT EXISTS invention_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    novelty TEXT NOT NULL,
    disclosure TEXT NOT NULL,
    bio_resources TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Invention Locker Concept Receipts (Cryptographic Proofs of Conception)
CREATE TABLE IF NOT EXISTS concept_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    sha256_hash TEXT NOT NULL,
    text_size_bytes INTEGER NOT NULL,
    timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Supabase Storage Bucket Setup (for patent PDFs, experimental data, chromatography sheets)
-- insert into storage.buckets (id, name, public) values ('patent_documents', 'patent_documents', false);
