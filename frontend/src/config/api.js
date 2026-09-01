/**
 * Centralized AYUTH API Configuration
 * Resolves API Base URL from VITE_API_URL or defaults to http://localhost:8000
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  HEALTH: `${API_BASE_URL}/api/health`,
  CHAT: `${API_BASE_URL}/api/chat`,
  RAG_QUERY: `${API_BASE_URL}/api/rag/query`,
  RAG_SEARCH: `${API_BASE_URL}/api/rag/search`,
  CLASSIFY: `${API_BASE_URL}/api/classify`,
  DOCUMENTS: `${API_BASE_URL}/api/documents`,
  DOCUMENTS_UPLOAD: `${API_BASE_URL}/api/documents/upload`,
  LOCKER_RECORDS: `${API_BASE_URL}/api/locker/records`,
  LOCKER_UPLOAD: `${API_BASE_URL}/api/locker/upload`,
  LOCKER_CREATE: `${API_BASE_URL}/api/locker/create`,
  INVENTIONS: `${API_BASE_URL}/api/inventions`,
};

export default API_BASE_URL;
