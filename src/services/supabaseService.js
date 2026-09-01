import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import fs from 'node:fs';
import path from 'node:path';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = config.supabaseUrl;
  const key = config.supabaseKey;

  if (url && key && url.startsWith('http')) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      console.log('[Supabase] Connected to Supabase at:', url);
      return supabaseClient;
    } catch (err) {
      console.warn('[Supabase] Warning: Failed to initialize Supabase client:', err.message);
    }
  }

  return null;
}

const LOCAL_LOCKER_FILE = path.join(config.dataDir, 'locker_records.json');
const LOCAL_DOCS_FILE = path.join(config.dataDir, 'custom_documents.json');

function getLocalLocker() {
  if (fs.existsSync(LOCAL_LOCKER_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_LOCKER_FILE, 'utf-8'));
    } catch (_) {}
  }
  return [];
}

function saveLocalLocker(records) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(LOCAL_LOCKER_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function getLocalDocs() {
  if (fs.existsSync(LOCAL_DOCS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_DOCS_FILE, 'utf-8'));
    } catch (_) {}
  }
  return [];
}

function saveLocalDocs(docs) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(LOCAL_DOCS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
}

/**
 * Get all Invention Locker records (Supabase with Local File Fallback)
 */
export async function getLockerRecordsFromDb() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ayuth_locker_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }
      console.warn('[Supabase Locker Query Error]:', error?.message);
    } catch (e) {
      console.warn('[Supabase Query Exception]:', e.message);
    }
  }
  return getLocalLocker();
}

/**
 * Save new Invention Locker Record (Supabase with Local File Fallback)
 */
export async function saveLockerRecordToDb(record) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ayuth_locker_records')
        .insert([record])
        .select();

      if (!error && data && data.length > 0) {
        console.log(`[Supabase] Stored locker record ${record.record_id} in PostgreSQL.`);
        return data[0];
      }
      console.warn('[Supabase Locker Insert Error]:', error?.message);
    } catch (e) {
      console.warn('[Supabase Insert Exception]:', e.message);
    }
  }

  // Fallback to local storage
  const existing = getLocalLocker();
  existing.unshift(record);
  saveLocalLocker(existing);
  return record;
}

/**
 * Get custom knowledge documents from Supabase
 */
export async function getCustomDocumentsFromDb() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ayuth_knowledge_docs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (_) {}
  }
  return getLocalDocs();
}

/**
 * Save custom knowledge document to Supabase
 */
export async function saveCustomDocumentToDb(doc) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ayuth_knowledge_docs')
        .insert([doc])
        .select();

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (_) {}
  }

  const existing = getLocalDocs();
  existing.unshift(doc);
  saveLocalDocs(existing);
  return doc;
}
