import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const backendEnvPath = path.join(rootDir, 'backend', '.env');
const rootEnvPath = path.join(rootDir, '.env');

// Load environment variables from backend/.env if available, then root .env
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

export const config = {
  port: Number(process.env.PORT || 8000),
  groqApiKey: process.env.GROQ_API_KEY || null,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  chatProvider: 'groq',
  chatModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
  vectorDbPath: path.join(dataDir, 'ayuth_lancedb'),
  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null,
  topK: 4,
  rootDir,
  dataDir,
};
