import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

export const config = {
  port: Number(process.env.PORT || 8000),
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
  chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
  vectorDbPath: path.join(dataDir, 'ayuth_lancedb'),
  tableName: 'ayuth_knowledge',
  topK: 4,
  rootDir,
  dataDir,
};
